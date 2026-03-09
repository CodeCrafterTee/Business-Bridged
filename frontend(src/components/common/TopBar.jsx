export default function TopBar() {
  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">

        <div>
          <div className="text-sm font-semibold">
            Business Bridged (B²)
          </div>
          <div className="text-xs text-white/60">
            Get your free business score
          </div>
        </div>

      </div>
    </header>
  );
}