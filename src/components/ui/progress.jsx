export function Progress({ value = 0, className = "" }) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className={`overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full rounded-full bg-violet-400 transition-all"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
