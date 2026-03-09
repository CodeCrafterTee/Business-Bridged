export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-black/25 p-5 ${className}`}
    >
      {children}
    </div>
  );
}