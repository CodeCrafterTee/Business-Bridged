export default function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-white/10 text-white",
    success: "bg-green-500/20 text-green-300",
    warning: "bg-yellow-500/20 text-yellow-300",
    danger: "bg-red-500/20 text-red-300",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[variant]}`}
    >
      {children}
    </span>
  );
}