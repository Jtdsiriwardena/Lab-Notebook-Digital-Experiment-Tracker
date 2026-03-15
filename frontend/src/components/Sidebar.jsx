
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  {
    to: "/dashboard",
    label: "Experiments",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    to: "/create-experiment",
    label: "New Experiment",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: true,
  },
  {
    to: "/profile",
    label: "My Profile",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        .font-mono { font-family: 'Space Mono', monospace; }
      `}</style>

      <div className="w-64 h-screen bg-slate-900 fixed top-0 left-0 flex flex-col border-r border-slate-800/60 z-40">

        {/* Top grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

        {/* ── Logo ── */}
        <div className="relative px-5 py-5 border-b border-slate-800/60">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0 bg-teal-400/20 rounded-lg blur-sm group-hover:bg-teal-400/30 transition-all" />
              <div className="relative w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/30">
                <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-mono font-bold text-slate-100 text-base tracking-tight leading-none">
                Lab<span className="text-teal-400">Note</span>
              </span>
              <div className="font-mono text-[9px] text-slate-600 tracking-[0.15em] uppercase mt-0.5">
                Digital Notebook
              </div>
            </div>
          </a>
        </div>

        {/* ── Nav label ── */}
        <div className="relative px-5 pt-5 pb-2">
          <span className="font-mono text-[9px] text-slate-600 tracking-[0.2em] uppercase">
            Navigation
          </span>
        </div>

        {/* ── Nav Items ── */}
        <nav className="relative flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-sm transition-all duration-200 group relative ${
                  isActive
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                    : item.accent
                    ? "text-slate-300 hover:bg-teal-500/5 hover:text-teal-400 border border-dashed border-slate-700 hover:border-teal-500/30"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-r-full" />
                  )}

                  {/* Icon */}
                  <span
                    className={`shrink-0 transition-colors duration-200 ${
                      isActive ? "text-teal-400" : item.accent ? "text-teal-500/70" : "text-slate-600 group-hover:text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span className="truncate">{item.label}</span>

                  {/* Active dot */}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}

        </nav>

        {/* ── User Panel ── */}
        <div className="relative border-t border-slate-800/60 p-3">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center font-mono font-bold text-xs text-slate-950 shrink-0 shadow-md shadow-teal-500/20">
                {(user.username || user.email || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold text-slate-200 truncate">
                  {user.username || "Researcher"}
                </div>
                <div className="font-mono text-[10px] text-slate-300 truncate">
                  {user.email || ""}
                </div>
              </div>
              <div className="ml-auto shrink-0 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/15 transition-all duration-200 group"
          >
            <svg className="w-4 h-4 shrink-0 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}