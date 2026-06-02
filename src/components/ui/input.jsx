export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-10 w-full border bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 ${className}`}
      {...props}
    />
  );
}
