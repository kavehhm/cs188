export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`min-h-24 w-full resize-y border bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${className}`}
      {...props}
    />
  );
}
