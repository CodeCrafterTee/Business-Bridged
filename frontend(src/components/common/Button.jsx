export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "rounded-2xl px-4 py-3 text-sm font-semibold transition";

  const styles = {
    primary: "bg-[#C7000B] text-white hover:opacity-95",
    secondary:
      "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    ghost: "text-white/80 hover:bg-white/10",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}