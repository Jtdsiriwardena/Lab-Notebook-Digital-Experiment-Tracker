
import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login/", {
        username,
        password,
      });
      login(res.data.access);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        .font-mono { font-family: 'Space Mono', monospace; }
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp 0.6s ease both; }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 1s linear infinite; }
      `}</style>

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Radial glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative corner lines */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-teal-500/20 rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-teal-500/20 rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-teal-500/20 rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-teal-500/20 rounded-br-lg" />

      <div className="relative w-full max-w-md fade-in">

        {/* Logo / Back to home */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-teal-400/20 rounded-lg blur-sm group-hover:bg-teal-400/30 transition-all" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
                <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <span className="font-mono font-bold text-slate-100 text-lg tracking-tight">
              Lab<span className="text-teal-400">Note</span>
            </span>
          </a>

          <a
            href="/"
            className="flex items-center gap-1.5 font-mono text-xs text-slate-500 hover:text-teal-400 transition-colors duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </a>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-slate-950/60">

          {/* Header */}
          <div className="mb-8">
            <span className="inline-block font-mono text-[10px] text-teal-400 tracking-[0.2em] uppercase border border-teal-500/30 px-3 py-1 rounded-full bg-teal-500/5 mb-4">
              SECURE ACCESS
            </span>
            <h1 className="font-mono font-bold text-2xl text-slate-100 mb-1">
              Welcome back
            </h1>
            <p className="text-slate-400 text-sm">
              Sign in to access your lab notebooks and experiments.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username field */}
            <div>
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-[0.12em] mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 focus:bg-slate-800 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-mono text-xs text-slate-400 uppercase tracking-[0.12em]">
                  Password
                </label>
                <a href="/forgot-password" className="font-mono text-[10px] text-slate-500 hover:text-teal-400 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-12 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 focus:bg-slate-800 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-teal-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5 active:translate-y-0 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Lab
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="font-mono text-[10px] text-slate-600 tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-mono font-bold text-teal-400 hover:text-teal-300 transition-colors duration-200 underline underline-offset-2 decoration-teal-500/30 hover:decoration-teal-400"
            >
              Create one →
            </a>
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-center font-mono text-[10px] text-slate-700 mt-6 tracking-wide">
          SECURE · PRIVATE · YOUR DATA STAYS YOURS
        </p>
      </div>
    </div>
  );
}