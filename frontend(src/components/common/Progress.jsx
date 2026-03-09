export default function Progress({ value = 0 }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full">
      <div
        className="h-2 bg-white rounded-full"
        style={{ width: value + "%" }}
      />
    </div>
  );
}