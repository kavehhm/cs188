export function Badge({ className = "", children }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
