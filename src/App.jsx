import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Icon = ({ children, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

const calendarEventsSeed = [
  { id: "cal-1", title: "Marketing Lecture", start: "09:00", end: "10:15", type: "calendar" },
  { id: "cal-2", title: "Team Meeting", start: "11:00", end: "11:45", type: "calendar" },
  { id: "cal-3", title: "Gym", start: "17:30", end: "18:30", type: "calendar" },
];

const tasksSeed = [
  {
    id: "g1",
    title: "Reply to important emails",
    description: "Low-pressure communication tasks to ease into the day.",
    duration: 30,
    priority: "Low",
    deadline: "Today",
    kind: "light",
    source: "typed",
  },
  {
    id: "g2",
    title: "Light lecture review",
    description: "Review notes casually and highlight confusing sections.",
    duration: 60,
    priority: "Low",
    deadline: "Friday",
    kind: "light",
    source: "typed",
  },
  {
    id: "g3",
    title: "Creative journaling + brainstorming",
    description: "Reflect and ideate without pressure.",
    duration: 45,
    priority: "Low",
    deadline: "This week",
    kind: "creative",
    source: "typed",
  },
  {
    id: "h1",
    title: "Deep work sprint - strategy slides",
    description: "Complete major project milestone.",
    duration: 120,
    priority: "High",
    deadline: "Tomorrow",
    kind: "deep",
    source: "typed",
  },
  {
    id: "h2",
    title: "Case interview prep",
    description: "Timed practice session.",
    duration: 90,
    priority: "High",
    deadline: "Today",
    kind: "deep",
    source: "typed",
  },
  {
    id: "h3",
    title: "Networking outreach",
    description: "Send recruiter follow-ups and LinkedIn messages.",
    duration: 45,
    priority: "Medium",
    deadline: "Today",
    kind: "light",
    source: "typed",
  },
  {
    id: "c1a",
    title: "Brainstorm startup ideas",
    description: "Free-form ideation and sketching.",
    duration: 75,
    priority: "Medium",
    deadline: "This week",
    kind: "creative",
    source: "typed",
  },
  {
    id: "c2a",
    title: "Design prototype wireframes",
    description: "Work on visual concepts and layouts.",
    duration: 120,
    priority: "High",
    deadline: "Tomorrow",
    kind: "creative",
    source: "typed",
  },
  {
    id: "s1",
    title: "Admin cleanup",
    description: "Clear inbox and organize assignments.",
    duration: 45,
    priority: "Low",
    deadline: "Today",
    kind: "light",
    source: "typed",
  },
  {
    id: "s2",
    title: "Small project progress",
    description: "Low-pressure progress on ongoing work.",
    duration: 60,
    priority: "Medium",
    deadline: "Tomorrow",
    kind: "light",
    source: "typed",
  },
  {
    id: "d1",
    title: "Finalize presentation",
    description: "Push to complete before submission.",
    duration: 150,
    priority: "High",
    deadline: "Today",
    kind: "deep",
    source: "typed",
  },
  {
    id: "d2",
    title: "Practice delivery",
    description: "Run through slides and timing.",
    duration: 60,
    priority: "High",
    deadline: "Today",
    kind: "deep",
    source: "typed",
  },
  {
    id: "d3",
    title: "Quick dinner + reset",
    description: "Short recharge break.",
    duration: 30,
    priority: "Low",
    deadline: "Today",
    kind: "light",
    source: "typed",
  },
  {
    id: "ca1",
    title: "Watch missed lecture",
    description: "Catch up on yesterday's content.",
    duration: 90,
    priority: "Medium",
    deadline: "Tomorrow",
    kind: "deep",
    source: "typed",
  },
  {
    id: "ca2",
    title: "Complete overdue assignments",
    description: "Handle lingering school tasks.",
    duration: 120,
    priority: "High",
    deadline: "Today",
    kind: "deep",
    source: "typed",
  },
  {
    id: "b1",
    title: "Study session",
    description: "Focused but realistic work block.",
    duration: 90,
    priority: "Medium",
    deadline: "Tomorrow",
    kind: "deep",
    source: "typed",
  },
  {
    id: "b2",
    title: "Email + admin",
    description: "Respond and organize.",
    duration: 45,
    priority: "Low",
    deadline: "Today",
    kind: "light",
    source: "typed",
  },
  {
    id: "b3",
    title: "Personal project work",
    description: "Work on app prototype.",
    duration: 90,
    priority: "Medium",
    deadline: "This week",
    kind: "creative",
    source: "typed",
  },
];

const moodOptions = [
  "happy",
  "sad",
  "calm",
  "angry",
  "upset",
  "anxious",
  "tired",
  "overwhelmed",
  "stressed",
  "neutral",
  "motivated",
];

const focusOptions = ["deep work", "light work", "creative"];
const horizonOptions = [
  "chill day",
  "balanced day",
  "deadline mode",
  "catch-up day",
  "maximize output",
];

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutesAfterMidnight) {
  const hours = Math.floor(minutesAfterMidnight / 60);
  const minutes = minutesAfterMidnight % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function minutesToInputTime(minutesAfterMidnight) {
  const safeMinutes = Math.max(0, Math.min(23 * 60 + 59, minutesAfterMidnight));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getPreferredKinds(checkIn) {
  if (checkIn.energy <= 30) return ["light", "creative", "deep"];

  if (checkIn.energy <= 60) {
    return checkIn.focusType === "creative"
      ? ["creative", "light", "deep"]
      : ["light", "deep", "creative"];
  }

  if (checkIn.focusType === "deep work") return ["deep", "light", "creative"];
  if (checkIn.focusType === "creative") return ["creative", "deep", "light"];

  return ["light", "deep", "creative"];
}

function getDayMode(checkIn, contextNote) {
  const note = contextNote.toLowerCase();
  const moods = Array.isArray(checkIn.moods)
    ? checkIn.moods
    : checkIn.mood
      ? [checkIn.mood]
      : [];
  const hardMood = [
    "sad",
    "angry",
    "upset",
    "anxious",
    "tired",
    "overwhelmed",
    "stressed",
  ].some((mood) => moods.includes(mood));

  if (checkIn.timeHorizon === "deadline mode") return "Deadline mode";

  if (
    checkIn.timeHorizon === "chill day" ||
    checkIn.energy <= 30 ||
    hardMood ||
    note.includes("headache") ||
    note.includes("sleep")
  ) {
    return "Gentle day";
  }

  if (checkIn.timeHorizon === "maximize output") return "High-output day";
  if (checkIn.timeHorizon === "catch-up day") return "Catch-up day";

  return "Balanced day";
}

function sortTasks(tasks, checkIn, contextNote, manualOrder) {
  const priorityScore = { High: 3, Medium: 2, Low: 1 };
  const deadlineScore = { Today: 4, Tomorrow: 3, Friday: 2, "This week": 1 };
  const preferredKinds = getPreferredKinds(checkIn);
  const dayMode = getDayMode(checkIn, contextNote);
  const manualIndex = new Map(manualOrder.map((id, index) => [id, index]));

  return [...tasks].sort((a, b) => {
    if (manualIndex.has(a.id) && manualIndex.has(b.id)) {
      return manualIndex.get(a.id) - manualIndex.get(b.id);
    }

    if (manualIndex.has(a.id)) return -1;
    if (manualIndex.has(b.id)) return 1;

    if (dayMode === "Gentle day") {
      const gentleRank = { light: 0, creative: 1, deep: 2 };

      if (gentleRank[a.kind] !== gentleRank[b.kind]) {
        return gentleRank[a.kind] - gentleRank[b.kind];
      }
    }

    const kindDiff =
      preferredKinds.indexOf(a.kind) - preferredKinds.indexOf(b.kind);

    if (kindDiff !== 0) return kindDiff;

    const aScore =
      (priorityScore[a.priority] || 1) + (deadlineScore[a.deadline] || 0);
    const bScore =
      (priorityScore[b.priority] || 1) + (deadlineScore[b.deadline] || 0);

    return bScore - aScore;
  });
}

function buildPlan(tasks, calendarEvents, checkIn, contextNote, manualOrder) {
  const dayStart = 8 * 60;
  const dayEnd = 21 * 60;
  const busy = calendarEvents
    .map((event) => ({
      start: timeToMinutes(event.start),
      end: timeToMinutes(event.end),
      title: event.title,
    }))
    .sort((a, b) => a.start - b.start);
  const freeSlots = [];
  let cursor = dayStart;

  for (const block of busy) {
    if (cursor < block.start) {
      freeSlots.push({ start: cursor, end: block.start });
    }

    cursor = Math.max(cursor, block.end);
  }

  if (cursor < dayEnd) {
    freeSlots.push({ start: cursor, end: dayEnd });
  }

  const breakPadding =
    checkIn.timeHorizon === "chill day"
      ? 20
      : checkIn.timeHorizon === "balanced day"
        ? 15
        : checkIn.timeHorizon === "catch-up day"
          ? 10
          : 5;

  const sortedTasks = sortTasks(tasks, checkIn, contextNote, manualOrder);
  const scheduled = [];
  const unscheduled = [];

  for (const task of sortedTasks) {
    let placed = false;

    for (const slot of freeSlots) {
      const fit = slot.end - slot.start - breakPadding;

      if (fit >= task.duration) {
        const start = slot.start;
        const end = start + task.duration;
        const confidence =
          checkIn.energy >= 70 && task.kind === "deep"
            ? 90
            : checkIn.energy <= 30 && task.kind === "deep"
              ? 55
              : 78;

        scheduled.push({ ...task, start, end, confidence });
        slot.start = end + breakPadding;
        placed = true;
        break;
      }
    }

    if (!placed) {
      unscheduled.push(task);
    }
  }

  return {
    scheduled: scheduled.sort((a, b) => a.start - b.start),
    unscheduled,
  };
}

function getFreeSlots(calendarEvents) {
  const dayStart = 8 * 60;
  const dayEnd = 21 * 60;
  const busy = calendarEvents
    .map((event) => ({
      start: timeToMinutes(event.start),
      end: timeToMinutes(event.end),
    }))
    .sort((a, b) => a.start - b.start);
  const freeSlots = [];
  let cursor = dayStart;

  for (const block of busy) {
    if (cursor < block.start) {
      freeSlots.push({ start: cursor, end: block.start });
    }

    cursor = Math.max(cursor, block.end);
  }

  if (cursor < dayEnd) {
    freeSlots.push({ start: cursor, end: dayEnd });
  }

  return freeSlots;
}

function packScheduledTasks(tasksInOrder, calendarEvents) {
  const freeSlots = getFreeSlots(calendarEvents);
  const scheduled = [];
  const overflow = [];

  for (const task of tasksInOrder) {
    let placed = false;

    for (const slot of freeSlots) {
      if (slot.end - slot.start >= task.duration) {
        const start = slot.start;
        const end = start + task.duration;

        scheduled.push({ ...task, start, end });
        slot.start = end;
        placed = true;
        break;
      }
    }

    if (!placed) {
      overflow.push({
        ...task,
        reason: "Moved out of today's visible plan because no open slot fit it.",
      });
    }
  }

  return { scheduled, overflow };
}

function createEmptySchedule() {
  return {
    scheduled: [],
    unscheduled: [],
    strategy: "",
    summary: "",
    score: null,
    source: "idle",
    model: "",
  };
}

function getEventDuration(event) {
  return Math.max(15, timeToMinutes(event.end) - timeToMinutes(event.start));
}

function inferKind(title, description, duration) {
  const text = `${title} ${description}`.toLowerCase();

  if (
    text.includes("brainstorm") ||
    text.includes("design") ||
    text.includes("write") ||
    text.includes("draft")
  ) {
    return "creative";
  }

  if (
    duration >= 75 ||
    text.includes("project") ||
    text.includes("study") ||
    text.includes("slides")
  ) {
    return "deep";
  }

  return "light";
}

function ChoiceButton({ active, children, onClick, tone = "rose" }) {
  const activeClass =
    tone === "sky"
      ? "bg-sky-100 text-sky-700 shadow-sm"
      : tone === "violet"
        ? "bg-violet-100 text-violet-700 shadow-sm"
        : "bg-rose-100 text-rose-700 shadow-sm";

  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition active:scale-95 ${
        active ? activeClass : "bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function TimelineBlock({
  item,
  isTask,
  dragId,
  onDragStart,
  onDrop,
  onToggleDone,
  onShiftCalendarEvent,
  onMoveTask,
}) {
  const isCalendar = item.type === "calendar";

  return (
    <motion.div
      layout
      draggable={isTask}
      onDragStart={(event) => {
        if (isTask) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", item.id);
          onDragStart(item.id);
        }
      }}
      onDragEnd={() => isTask && onDragStart(null)}
      onDragOver={(event) => {
        if (isTask) event.preventDefault();
      }}
      onDrop={(event) => {
        if (isTask) {
          event.preventDefault();
          onDrop(item.id);
        }
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: isTask ? -2 : 0 }}
      className={`rounded-2xl border px-4 py-3 shadow-sm transition ${
        dragId === item.id ? "scale-[1.01] ring-2 ring-violet-200" : ""
      } ${
        isCalendar
          ? "border-sky-100 bg-sky-50/80"
          : item.done
            ? "border-emerald-100 bg-emerald-50/80"
            : "cursor-grab border-violet-100 bg-white active:cursor-grabbing"
      }`}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 gap-3">
          <div className="mt-1 shrink-0 text-slate-400">
            {isTask ? <Icon>⋮⋮</Icon> : <Icon>📅</Icon>}
          </div>

          <div className="min-w-0 flex-1">
            <div className="break-words font-medium leading-snug text-slate-700">
              {item.title}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>
                ⏰ {minutesToTime(item.start)} - {minutesToTime(item.end)}
              </span>

              {isTask && (
                <Badge className="rounded-full bg-violet-50 px-2 py-1 text-violet-700 hover:bg-violet-50">
                  {item.kind}
                </Badge>
              )}

              {isTask && (
                <Badge className="rounded-full bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-50">
                  {item.deadline}
                </Badge>
              )}
            </div>

            {isTask && item.description && (
              <div className="mt-2 text-xs leading-5 text-slate-500">
                {item.description}
              </div>
            )}

            {isTask && item.reason && (
              <div className="mt-2 rounded-xl bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-700">
                {item.reason}
              </div>
            )}

            {isTask && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Plan confidence</span>
                  <span>{item.confidence}%</span>
                </div>

                <Progress value={item.confidence} className="h-2" />
              </div>
            )}
          </div>
        </div>

        {isTask && (
          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              aria-label={`Move ${item.title} earlier in plan`}
              onClick={() => onMoveTask(item.id, -1)}
            >
              -
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              aria-label={`Move ${item.title} later in plan`}
              onClick={() => onMoveTask(item.id, 1)}
            >
              +
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              aria-label={`Mark ${item.title} ${item.done ? "not done" : "done"}`}
              onClick={() => onToggleDone(item.id)}
            >
              ✓
            </Button>
          </div>
        )}

        {isCalendar && (
          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              aria-label={`Move ${item.title} 15 minutes earlier`}
              onClick={() => onShiftCalendarEvent(item.id, -15)}
            >
              -
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              aria-label={`Move ${item.title} 15 minutes later`}
              onClick={() => onShiftCalendarEvent(item.id, 15)}
            >
              +
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CalmAIDayPlanner() {
  const [checkIn, setCheckIn] = useState({
    energy: 60,
    moods: ["tired", "anxious", "motivated"],
    focusType: "deep work",
    timeHorizon: "balanced day",
  });
  const [contextNote, setContextNote] = useState(
    "Did not sleep well last night, have a headache."
  );
  const [calendarEvents, setCalendarEvents] = useState(calendarEventsSeed);
  const [tasks, setTasks] = useState(tasksSeed);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    duration: "45",
    deadline: "This week",
  });
  const [voiceDraft, setVoiceDraft] = useState(
    "Add task: review notes for 1 hour and draft my consulting response."
  );
  const [chatMessages, setChatMessages] = useState([
    {
      role: "planner",
      text:
        "Tell me your mood, energy, fixed events, tasks, deadlines, and any preferences. Multiple moods are totally fine.",
    },
  ]);
  const [chatDraft, setChatDraft] = useState(
    "I feel tired, anxious, and still motivated. I have class at 9, a meeting at 11, and gym at 5:30. I need to finish a presentation today, prep for an interview, and keep enough breaks so I do not burn out."
  );
  const [generatedSchedule, setGeneratedSchedule] = useState(createEmptySchedule);
  const [manualOrder, setManualOrder] = useState([]);
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planError, setPlanError] = useState("");
  const [dragId, setDragId] = useState(null);

  const availableTasks = useMemo(() => {
    if (!hasGeneratedPlan) return tasks;

    const scheduledIds = new Set(
      generatedSchedule.scheduled.map((task) => task.id)
    );

    return tasks.filter((task) => !scheduledIds.has(task.id));
  }, [tasks, hasGeneratedPlan, generatedSchedule]);

  const timelineItems = useMemo(() => {
    const calendar = calendarEvents.map((event) => ({
      ...event,
      start: timeToMinutes(event.start),
      end: timeToMinutes(event.end),
    }));

    return [...calendar, ...generatedSchedule.scheduled].sort(
      (a, b) => a.start - b.start
    );
  }, [calendarEvents, generatedSchedule]);

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const duration = Math.max(5, Number(newTask.duration) || 45);
    const task = {
      id: `t${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      duration,
      priority: duration >= 90 ? "High" : duration >= 45 ? "Medium" : "Low",
      deadline: newTask.deadline.trim() || "This week",
      kind: inferKind(newTask.title, newTask.description, duration),
      source: "typed",
    };

    setTasks((prev) => [...prev, task]);
    setNewTask({
      title: "",
      description: "",
      duration: "45",
      deadline: "This week",
    });
  };

  const addVoiceTask = () => {
    if (!voiceDraft.trim()) return;

    const task = {
      id: `t${Date.now()}`,
      title: "AI Parsed Voice Task",
      description: voiceDraft.trim(),
      duration: 60,
      priority: "Medium",
      deadline: "This week",
      kind: inferKind(voiceDraft, voiceDraft, 60),
      source: "voice",
    };

    setTasks((prev) => [...prev, task]);
    setVoiceDraft("");
  };

  const updateCalendarEvent = (id, patch) => {
    setCalendarEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        const next = { ...event, ...patch };

        if (patch.start && !patch.end) {
          const duration = getEventDuration(event);
          const nextStart = timeToMinutes(patch.start);
          const nextEnd = Math.min(23 * 60 + 59, nextStart + duration);
          next.end = minutesToInputTime(nextEnd);
        }

        if (timeToMinutes(next.end) <= timeToMinutes(next.start)) {
          const nextEnd = Math.min(23 * 60 + 59, timeToMinutes(next.start) + 30);
          next.end = minutesToInputTime(nextEnd);
        }

        return next;
      })
    );
    setHasGeneratedPlan(false);
    setGeneratedSchedule(createEmptySchedule());
    setPlanError("");
  };

  const addCalendarEvent = () => {
    setCalendarEvents((prev) => [
      ...prev,
      {
        id: `cal-${Date.now()}`,
        title: "Fixed event",
        start: "13:00",
        end: "14:00",
        type: "calendar",
      },
    ]);
    setHasGeneratedPlan(false);
    setGeneratedSchedule(createEmptySchedule());
  };

  const removeCalendarEvent = (id) => {
    setCalendarEvents((prev) => prev.filter((event) => event.id !== id));
    setHasGeneratedPlan(false);
    setGeneratedSchedule(createEmptySchedule());
    setPlanError("");
  };

  const shiftCalendarEvent = (id, deltaMinutes) => {
    setCalendarEvents((prev) =>
      prev.map((event) => {
        if (event.id !== id) return event;

        const duration = getEventDuration(event);
        const currentStart = timeToMinutes(event.start);
        const nextStart = Math.max(
          0,
          Math.min(23 * 60 + 59 - duration, currentStart + deltaMinutes)
        );

        return {
          ...event,
          start: minutesToInputTime(nextStart),
          end: minutesToInputTime(nextStart + duration),
        };
      })
    );
    setHasGeneratedPlan(false);
    setGeneratedSchedule(createEmptySchedule());
    setPlanError("");
  };

  const sendChatMessage = () => {
    if (!chatDraft.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { role: "student", text: chatDraft.trim() },
    ]);
    setChatDraft("");
  };

  const generateDailyPlan = async () => {
    setIsPlanning(true);
    setPlanError("");

    try {
      const effectiveChatMessages = chatDraft.trim()
        ? [...chatMessages, { role: "student", text: chatDraft.trim() }]
        : chatMessages;

      if (chatDraft.trim()) {
        setChatMessages(effectiveChatMessages);
        setChatDraft("");
      }

      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          calendarEvents,
          checkIn,
          contextNote,
          chatMessages: effectiveChatMessages,
          manualOrder,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gemini could not create a schedule.");
      }

      setGeneratedSchedule({
        scheduled: data.scheduled || [],
        unscheduled: data.unscheduled || [],
        strategy: data.strategy || "",
        summary: data.summary || "",
        score: data.score ?? null,
        source: data.source || "gemini",
        model: data.model || "",
      });
      setHasGeneratedPlan(true);
    } catch (error) {
      setPlanError(
        error instanceof Error ? error.message : "Gemini could not create a schedule."
      );
    } finally {
      setIsPlanning(false);
    }
  };

  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;

    const sortedTasks = [...generatedSchedule.scheduled].sort(
      (a, b) => a.start - b.start
    );
    const taskById = new Map(sortedTasks.map((task) => [task.id, task]));
    const ids = sortedTasks.map((task) => task.id);
    const filtered = ids.filter((id) => id !== dragId);
    const targetIndex = filtered.indexOf(targetId);

    filtered.splice(targetIndex >= 0 ? targetIndex : filtered.length, 0, dragId);

    const packed = packScheduledTasks(
      filtered.map((id) => taskById.get(id)).filter(Boolean),
      calendarEvents
    );
    const movedIds = new Set([
      ...packed.scheduled.map((task) => task.id),
      ...packed.overflow.map((task) => task.id),
    ]);

    setGeneratedSchedule((prev) => ({
      ...prev,
      scheduled: packed.scheduled,
      unscheduled: [
        ...packed.overflow,
        ...prev.unscheduled.filter((task) => !movedIds.has(task.id)),
      ],
      strategy: "You manually adjusted the generated plan order.",
    }));
    setManualOrder(packed.scheduled.map((task) => task.id));
    setDragId(null);
  };

  const moveTaskInPlan = (id, direction) => {
    const sortedTasks = [...generatedSchedule.scheduled].sort(
      (a, b) => a.start - b.start
    );
    const index = sortedTasks.findIndex((task) => task.id === id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= sortedTasks.length) return;

    const nextTasks = [...sortedTasks];
    [nextTasks[index], nextTasks[nextIndex]] = [
      nextTasks[nextIndex],
      nextTasks[index],
    ];

    const packed = packScheduledTasks(nextTasks, calendarEvents);
    const movedIds = new Set([
      ...packed.scheduled.map((task) => task.id),
      ...packed.overflow.map((task) => task.id),
    ]);

    setGeneratedSchedule((prev) => ({
      ...prev,
      scheduled: packed.scheduled,
      unscheduled: [
        ...packed.overflow,
        ...prev.unscheduled.filter((task) => !movedIds.has(task.id)),
      ],
      strategy: "You manually adjusted the generated plan order.",
    }));
    setManualOrder(packed.scheduled.map((task) => task.id));
  };

  const toggleDone = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const dayMode = getDayMode(checkIn, contextNote);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-violet-50 to-sky-50 p-4 text-slate-700 sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-xl">
                <span>🌸 Daily Check-In</span>
                <Badge className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-700 hover:bg-violet-100">
                  10 sec
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Energy level</span>
                  <span>{checkIn.energy}%</span>
                </div>

                <Slider
                  value={[checkIn.energy]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) =>
                    setCheckIn((prev) => ({ ...prev, energy: value[0] }))
                  }
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Mood</span>
                  <span className="text-xs text-slate-400">choose multiple</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((mood) => (
                    <ChoiceButton
                      key={mood}
                      active={checkIn.moods.includes(mood)}
                      onClick={() =>
                        setCheckIn((prev) => {
                          const hasMood = prev.moods.includes(mood);
                          const moods = hasMood
                            ? prev.moods.filter((item) => item !== mood)
                            : [...prev.moods, mood];

                          return { ...prev, moods };
                        })
                      }
                    >
                      {mood}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm">Focus type</div>
                <div className="flex flex-wrap gap-2">
                  {focusOptions.map((focusType) => (
                    <ChoiceButton
                      key={focusType}
                      tone="sky"
                      active={checkIn.focusType === focusType}
                      onClick={() =>
                        setCheckIn((prev) => ({ ...prev, focusType }))
                      }
                    >
                      {focusType}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm">Day style</div>
                <div className="flex flex-wrap gap-2">
                  {horizonOptions.map((timeHorizon) => (
                    <ChoiceButton
                      key={timeHorizon}
                      tone="violet"
                      active={checkIn.timeHorizon === timeHorizon}
                      onClick={() =>
                        setCheckIn((prev) => ({ ...prev, timeHorizon }))
                      }
                    >
                      {timeHorizon}
                    </ChoiceButton>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm">What's going on today?</div>
                <Textarea
                  value={contextNote}
                  onChange={(event) => setContextNote(event.target.value)}
                  className="rounded-2xl border-violet-100 bg-white/80"
                  placeholder="I didn't sleep well, keep things light..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle>💬 AI Planner Chat</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-slate-50/80 p-3">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-2xl px-3 py-2 text-sm leading-6 ${
                      message.role === "student"
                        ? "ml-6 bg-violet-500 text-white"
                        : "mr-6 bg-white text-slate-600"
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>

              <Textarea
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                className="rounded-2xl border-violet-100 bg-white/80"
                placeholder="I feel tired and anxious. I have class at 9..."
              />

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={sendChatMessage}
                  variant="secondary"
                  className="rounded-2xl"
                >
                  Send
                </Button>

                <Button
                  onClick={generateDailyPlan}
                  disabled={isPlanning}
                  className="rounded-2xl bg-violet-500 hover:bg-violet-600"
                >
                  {isPlanning ? "Planning..." : "Generate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>📅 Fixed Events</span>
                <Button
                  onClick={addCalendarEvent}
                  variant="secondary"
                  className="h-8 rounded-2xl px-3"
                >
                  Add
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {calendarEvents.map((event) => (
                <div
                  key={event.id}
                  className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-3"
                >
                  <Input
                    value={event.title}
                    onChange={(inputEvent) =>
                      updateCalendarEvent(event.id, {
                        title: inputEvent.target.value,
                      })
                    }
                    className="rounded-2xl border-sky-100 bg-white"
                  />

                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      type="time"
                      value={event.start}
                      onInput={(inputEvent) =>
                        updateCalendarEvent(event.id, {
                          start: inputEvent.currentTarget.value,
                        })
                      }
                      onChange={(inputEvent) =>
                        updateCalendarEvent(event.id, {
                          start: inputEvent.target.value,
                        })
                      }
                      className="rounded-2xl border-sky-100 bg-white"
                    />

                    <Input
                      type="time"
                      value={event.end}
                      onInput={(inputEvent) =>
                        updateCalendarEvent(event.id, {
                          end: inputEvent.currentTarget.value,
                        })
                      }
                      onChange={(inputEvent) =>
                        updateCalendarEvent(event.id, {
                          end: inputEvent.target.value,
                        })
                      }
                      className="rounded-2xl border-sky-100 bg-white"
                    />

                    <Button
                      onClick={() => removeCalendarEvent(event.id)}
                      variant="ghost"
                      className="h-10 rounded-2xl px-3"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle>📋 Task Pool</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-violet-50/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-700">
                      Tasks waiting to be planned
                    </div>
                    <div className="text-xs text-slate-500">
                      Scheduled tasks disappear after AI planning.
                    </div>
                  </div>

                  <Badge className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-700 hover:bg-violet-100">
                    {availableTasks.length} remaining
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {availableTasks.map((task) => (
                    <div
                      key={task.id}
                      className="min-w-0 overflow-hidden rounded-2xl border border-violet-100 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="break-words font-medium text-slate-700">
                            {task.title}
                          </div>
                          <div className="mt-1 break-words text-xs leading-5 text-slate-500">
                            {task.description}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge className="rounded-full bg-sky-50 px-2 py-1 text-sky-700 hover:bg-sky-50">
                            {task.duration} min
                          </Badge>

                          <Badge className="rounded-full bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-50">
                            {task.deadline}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {availableTasks.length === 0 && (
                    <div className="rounded-2xl bg-emerald-50 p-4 text-center text-sm text-emerald-700">
                      All tasks were successfully scheduled for today ✨
                    </div>
                  )}
                </div>
              </div>

              <Input
                value={newTask.title}
                onChange={(event) =>
                  setNewTask((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Task title"
                className="rounded-2xl border-violet-100"
              />

              <Textarea
                value={newTask.description}
                onChange={(event) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Task description"
                className="rounded-2xl border-violet-100"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  value={newTask.duration}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      duration: event.target.value,
                    }))
                  }
                  placeholder="Minutes"
                  className="rounded-2xl border-violet-100"
                />

                <Input
                  value={newTask.deadline}
                  onChange={(event) =>
                    setNewTask((prev) => ({
                      ...prev,
                      deadline: event.target.value,
                    }))
                  }
                  placeholder="Deadline"
                  className="rounded-2xl border-violet-100"
                />
              </div>

              <Button
                onClick={addTask}
                className="w-full rounded-2xl bg-violet-500 hover:bg-violet-600"
              >
                Add Task
              </Button>

              <div className="space-y-3 rounded-2xl bg-sky-50 p-4">
                <div className="text-sm font-medium text-sky-700">
                  🎤 Voice / AI Input
                </div>

                <Textarea
                  value={voiceDraft}
                  onChange={(event) => setVoiceDraft(event.target.value)}
                  className="rounded-2xl border-sky-100 bg-white"
                />

                <Button
                  onClick={addVoiceTask}
                  variant="secondary"
                  className="w-full rounded-2xl"
                >
                  Parse + Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-3xl font-semibold text-slate-800">
                  Your Adaptive Day
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  AI-generated plan based on your energy, focus, and schedule.
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="rounded-full bg-emerald-100 px-4 py-2 text-emerald-700 hover:bg-emerald-100">
                  {dayMode}
                </Badge>

                <Badge className="rounded-full bg-rose-100 px-4 py-2 text-rose-700 hover:bg-rose-100">
                  {generatedSchedule.scheduled.length} tasks scheduled
                </Badge>

                {generatedSchedule.source === "gemini" && (
                  <Badge className="rounded-full bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-100">
                    {generatedSchedule.model || "Gemini"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {hasGeneratedPlan && generatedSchedule.summary && (
            <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
              <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Gemini schedule strategy
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">
                    {generatedSchedule.summary}
                  </div>
                  {generatedSchedule.strategy && (
                    <div className="mt-2 text-xs leading-5 text-violet-700">
                      {generatedSchedule.strategy}
                    </div>
                  )}
                </div>

                {generatedSchedule.score !== null && (
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                    <div className="text-xs font-medium text-emerald-700">
                      Fit score
                    </div>
                    <div className="text-2xl font-semibold text-emerald-800">
                      {Math.round(generatedSchedule.score)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-3xl border-white/60 bg-white/70 backdrop-blur">
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <CardTitle>🗓️ Smart Timeline</CardTitle>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={generateDailyPlan}
                    disabled={isPlanning}
                    className="rounded-2xl bg-violet-500 hover:bg-violet-600"
                  >
                    {isPlanning ? "Asking Gemini..." : "Generate with Gemini"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setHasGeneratedPlan(false);
                      setGeneratedSchedule(createEmptySchedule());
                      setPlanError("");
                      setManualOrder([]);
                    }}
                    className="rounded-2xl"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {planError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                  {planError}
                </div>
              )}

              {!hasGeneratedPlan && (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 p-10 text-center">
                  <div className="text-5xl">✨</div>
                  <div className="mt-4 text-lg font-semibold text-slate-700">
                    Your day hasn't been planned yet
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    Complete your daily check-in and ask Gemini to optimize your schedule.
                  </div>
                </div>
              )}

              {timelineItems.map((item) => (
                <TimelineBlock
                  key={item.id}
                  item={item}
                  isTask={item.type !== "calendar"}
                  dragId={dragId}
                  onDragStart={setDragId}
                  onDrop={onDrop}
                  onToggleDone={toggleDone}
                  onShiftCalendarEvent={shiftCalendarEvent}
                  onMoveTask={moveTaskInPlan}
                />
              ))}
            </CardContent>
          </Card>

          {generatedSchedule.unscheduled.length > 0 && (
            <Card className="rounded-3xl border-amber-100 bg-amber-50/80">
              <CardHeader>
                <CardTitle>⚠️ Unscheduled Tasks</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {generatedSchedule.unscheduled.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {task.reason || "Gemini left this outside today's plan."}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
