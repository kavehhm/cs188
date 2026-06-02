const variants = {
  default: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
};

const sizes = {
  default: "h-10 px-4 py-2",
  icon: "h-10 w-10",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variants[variant] ?? variants.default} ${sizes[size] ?? sizes.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
