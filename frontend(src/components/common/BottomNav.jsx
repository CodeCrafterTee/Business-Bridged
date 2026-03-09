import { NavLink } from "react-router-dom";

export default function BottomNav() {

  const linkStyle = ({ isActive }) =>
    `flex-1 text-center py-2 text-xs font-semibold rounded-xl ${
      isActive
        ? "bg-white text-black"
        : "text-white/70 hover:bg-white/10"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur">
      <div className="max-w-md mx-auto flex gap-2 p-2">

        <NavLink to="/app/dashboard" className={linkStyle}>
          Home
        </NavLink>

        <NavLink to="/app/vault" className={linkStyle}>
          Vault
        </NavLink>

        <NavLink to="/app/score" className={linkStyle}>
          Score
        </NavLink>

        <NavLink to="/app/accessibility" className={linkStyle}>
          Settings
        </NavLink>

      </div>
    </nav>
  );
}