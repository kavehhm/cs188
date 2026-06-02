import "dotenv/config";
import path from "node:path";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const port = Number(process.env.PORT || 5173);
const isProduction = process.env.NODE_ENV === "production";
const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

app.use(express.json({ limit: "1mb" }));

const planSchema = {
  type: "object",
  properties: {
    strategy: { type: "string" },
    summary: { type: "string" },
    score: { type: "number" },
    scheduled: {
      type: "array",
      items: {
        type: "object",
        properties: {
          taskId: { type: "string" },
          start: { type: "integer" },
          end: { type: "integer" },
          confidence: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["taskId", "start", "end", "confidence", "reason"],
      },
    },
    unscheduled: {
      type: "array",
      items: {
        type: "object",
        properties: {
          taskId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["taskId", "reason"],
      },
    },
  },
  required: ["strategy", "summary", "score", "scheduled", "unscheduled"],
};

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calendarToBusyBlocks(calendarEvents) {
  return calendarEvents
    .map((event) => ({
      id: event.id,
      title: event.title,
      start: timeToMinutes(event.start),
      end: timeToMinutes(event.end),
    }))
    .sort((a, b) => a.start - b.start);
}

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

function normalizeGeminiPlan(rawPlan, tasks, calendarEvents) {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const busyBlocks = calendarToBusyBlocks(calendarEvents);
  const scheduled = [];
  const seenTaskIds = new Set();

  for (const entry of rawPlan.scheduled || []) {
    const task = taskById.get(entry.taskId);
    const start = Number(entry.start);
    const end = Number(entry.end);

    if (
      !task ||
      seenTaskIds.has(task.id) ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start ||
      end - start !== task.duration ||
      start < 8 * 60 ||
      end > 21 * 60
    ) {
      continue;
    }

    const candidate = { start, end };
    const hitsCalendar = busyBlocks.some((block) => overlaps(candidate, block));
    const hitsTask = scheduled.some((item) => overlaps(candidate, item));

    if (hitsCalendar || hitsTask) continue;

    scheduled.push({
      ...task,
      start,
      end,
      confidence: Math.max(1, Math.min(100, Number(entry.confidence) || 75)),
      reason: entry.reason || "Selected by Gemini based on the current day context.",
    });
    seenTaskIds.add(task.id);
  }

  const unscheduledReasons = new Map(
    (rawPlan.unscheduled || []).map((item) => [item.taskId, item.reason])
  );
  const unscheduled = tasks
    .filter((task) => !seenTaskIds.has(task.id))
    .map((task) => ({
      ...task,
      reason:
        unscheduledReasons.get(task.id) ||
        "Gemini left this outside today's plan to protect the chosen schedule.",
    }));

  return {
    scheduled: scheduled.sort((a, b) => a.start - b.start),
    unscheduled,
    strategy: rawPlan.strategy || "Gemini optimized the schedule from the available task pool.",
    summary: rawPlan.summary || "Gemini created a schedule using your check-in, tasks, and calendar.",
    score: Math.max(0, Math.min(100, Number(rawPlan.score) || 75)),
    source: "gemini",
    model: modelName,
  };
}

function buildPlannerPrompt({
  tasks,
  calendarEvents,
  checkIn,
  contextNote,
  chatMessages,
  manualOrder,
}) {
  return `
You are an AI daily planner for a busy college student. Your goal is to reduce the mental burden of planning their day.

Hard constraints:
- Day runs from 8:00 AM to 9:00 PM, represented as minutes after midnight from 480 to 1260.
- Never overlap calendar events.
- Never overlap scheduled tasks.
- Preserve each task duration exactly: end - start must equal task.duration.
- Schedule only tasks from the provided task list using their exact id.
- Use manualOrder as a soft preference only if it improves the plan.

Optimization priorities:
1. Do urgent/high-priority tasks before lower-value tasks.
2. Respect energy, multiple moods, focus type, day style, preferences, and the planner chat.
3. Put deep work during stronger focus windows unless the user is low-energy or stressed.
4. Include realistic breaks, meals, and buffer time by leaving unscheduled space where possible.
5. Prefer a plan the user is likely to actually complete over cramming everything in.
6. Leave tasks unscheduled when the day would become unrealistic.
7. Briefly explain why the plan was organized this way in summary and strategy.

Return only JSON that matches the schema.

Input:
${JSON.stringify(
  { tasks, calendarEvents, checkIn, contextNote, chatMessages, manualOrder },
  null,
  2
)}
`;
}

app.post("/api/plan", async (request, response) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    response.status(400).json({
      error:
        "Missing GEMINI_API_KEY. Add it to /Users/kavehmalekzadeh/Documents/projects/cs188/.env and restart npm run dev.",
    });
    return;
  }

  try {
    const {
      tasks,
      calendarEvents,
      checkIn,
      contextNote,
      chatMessages = [],
      manualOrder,
    } = request.body;
    const ai = new GoogleGenAI({ apiKey });
    const geminiResponse = await ai.models.generateContent({
      model: modelName,
      contents: buildPlannerPrompt({
        tasks,
        calendarEvents,
        checkIn,
        contextNote,
        chatMessages,
        manualOrder,
      }),
      config: {
        temperature: 0.25,
        responseMimeType: "application/json",
        responseSchema: planSchema,
      },
    });
    const rawPlan = JSON.parse(geminiResponse.text);

    response.json(normalizeGeminiPlan(rawPlan, tasks, calendarEvents));
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : "Gemini planning failed.",
    });
  }
});

if (isProduction) {
  app.use(express.static("dist"));
  app.use((_, response) => {
    response.sendFile(path.resolve("dist/index.html"));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(port, "127.0.0.1", () => {
  console.log(`Planner app running at http://127.0.0.1:${port}/`);
});
