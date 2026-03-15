import { useEffect, useState } from "react";
import api from "../api/axios";

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase",     pass: /[A-Z]/.test(password) },
    { label: "Number",        pass: /[0-9]/.test(password) },
    { label: "Symbol",        pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][score];
  const barColor      = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-teal-400"][score];
  const labelColor    = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-teal-400"][score];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? barColor : "bg-slate-700"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
        {checks.map((c) => (
          <span key={c.label} className={`font-mono text-[10px] flex items-center gap-1 ${c.pass ? "text-teal-400" : "text-slate-600"}`}>
            {c.pass ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {c.label}
          </span>
        ))}
        <span className={`font-mono text-[10px] ml-auto ${labelColor}`}>{strengthLabel}</span>
      </div>
    </div>
  );
}

function EyeIcon({ visible }) {
  return visible ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message,     setMessage]     = useState({ text: "", type: "" });
  const [loading,     setLoading]     = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [passwordError,  setPasswordError]  = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile/");
        setForm((prev) => ({ ...prev, username: res.data.username, email: res.data.email }));
      } catch (err) {
        console.error("Failed to load profile", err);
        setMessage({ text: "Failed to load profile data.", type: "error" });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (message.text) setMessage({ text: "", type: "" });

    // Live password match validation
    if (e.target.name === "password") {
      setPasswordError(form.confirmPassword && e.target.value !== form.confirmPassword ? "Passwords do not match" : "");
    }
    if (e.target.name === "confirmPassword") {
      setPasswordError(e.target.value !== form.password ? "Passwords do not match" : "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) { setPasswordError("Passwords do not match"); return; }
      if (form.password.length < 8) { setPasswordError("Password must be at least 8 characters"); return; }
    }

    setLoading(true);
    try {
      const submitData = { username: form.username, email: form.email };
      if (form.password) submitData.password = form.password;
      await api.put("/auth/profile/", submitData);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setPasswordError("");
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || "Failed to update profile. Please try again.", type: "error" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch   = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  // ── Loading screen
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <p className="font-mono text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 py-10 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        .font-mono { font-family: 'Space Mono', monospace; }
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative w-12 h-12 shrink-0">
            <div className="absolute inset-0 bg-teal-400/20 rounded-xl blur-sm" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div>
            <span className="inline-block font-mono text-[10px] text-teal-400 tracking-[0.2em] uppercase border border-teal-500/30 px-2.5 py-1 rounded-full bg-teal-500/5 mb-1">
              ACCOUNT
            </span>
            <h1 className="font-mono font-bold text-2xl text-slate-100">Profile Settings</h1>
          </div>
        </div>

        {/* ── Avatar card ── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-4 flex items-center gap-5">
          {/* Big avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center font-mono font-bold text-2xl text-slate-950 shadow-xl shadow-teal-500/20">
              {(form.username || "U")[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-950" />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="font-mono font-bold text-lg text-slate-100 truncate">{form.username || "—"}</h2>
            <p className="font-mono text-xs text-slate-300 truncate">{form.email || "—"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/25 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Active Researcher
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Member since {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Alert ── */}
        {message.text && (
          <div className={`mb-4 flex items-start gap-3 rounded-2xl px-5 py-4 border ${
            message.type === "success"
              ? "bg-teal-500/10 border-teal-500/25"
              : "bg-red-500/10 border-red-500/25"
          }`}>
            {message.type === "success" ? (
              <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <p className={`font-mono text-xs ${message.type === "success" ? "text-teal-400" : "text-red-400"}`}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Account Info section ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="font-mono font-bold text-sm text-teal-400">Account Information</h2>
            </div>

            {/* Username */}
            <div>
              <label className="block font-mono text-xs text-slate-300 uppercase tracking-[0.12em] mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="your_username"
                  disabled={loading}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-mono text-xs text-slate-300 uppercase tracking-[0.12em] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@institution.edu"
                  disabled={loading}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* ── Security section ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="font-mono font-bold text-sm text-cyan-400">Change Password</h2>
                <p className="font-mono text-[10px] text-slate-400">Leave blank to keep your current password</p>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block font-mono text-xs text-slate-300 uppercase tracking-[0.12em] mb-2">
                New Password
                <span className="text-slate-500 ml-2 normal-case tracking-normal">(optional · min 8 chars)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  disabled={loading}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-12 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200 disabled:opacity-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-teal-400 transition-colors">
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password — only shows when typing new password */}
            {form.password && (
              <div>
                <label className="block font-mono text-xs text-slate-300 uppercase tracking-[0.12em] mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg
                      className={`w-4 h-4 transition-colors ${passwordsMatch ? "text-teal-500" : passwordsMismatch ? "text-red-500" : "text-slate-600"}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    >
                      {passwordsMatch ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      )}
                    </svg>
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your new password"
                    disabled={loading}
                    className={`w-full bg-slate-800/60 border rounded-xl pl-10 pr-12 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 transition-all duration-200 disabled:opacity-50 ${
                      passwordsMismatch
                        ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
                        : passwordsMatch
                        ? "border-teal-500/50 focus:border-teal-500/60 focus:ring-teal-500/20"
                        : "border-slate-700 focus:border-teal-500/60 focus:ring-teal-500/20"
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-teal-400 transition-colors">
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>

                {passwordsMismatch && (
                  <p className="mt-1.5 font-mono text-[10px] text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Passwords do not match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-1.5 font-mono text-[10px] text-teal-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Passwords match
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={loading}
              className="font-mono text-sm text-slate-300 border border-slate-700 hover:border-slate-600 px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!passwordError}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-sm py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Updating Profile...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── Security notice ── */}
        <div className="mt-4 flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4">
          <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="font-mono text-xs font-bold text-slate-300 mb-0.5">Security Notice</p>
            <p className="font-mono text-[11px] text-slate-400 leading-relaxed">
              Your profile data is securely stored and encrypted.
              {form.password ? " Your password will be updated immediately after saving." : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}