export function Card({ className = "", children }) {
  return <section className={`border shadow-sm ${className}`}>{children}</section>;
}

export function CardHeader({ className = "", children }) {
  return <div className={`p-6 pb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }) {
  return <h2 className={`text-lg font-semibold text-slate-800 ${className}`}>{children}</h2>;
}

export function CardContent({ className = "", children }) {
  return <div className={`p-6 pt-3 ${className}`}>{children}</div>;
}
