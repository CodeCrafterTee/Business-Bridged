import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070A0F] text-white">
      {/* Example navbar */}
      <header className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold">Business App</h1>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Outlet /> {/* Renders Dashboard, Vault, Score, etc. */}
      </main>
    </div>
  );
}