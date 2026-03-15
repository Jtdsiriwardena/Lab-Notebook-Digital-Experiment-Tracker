
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][score];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-teal-400"][score];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? strengthColor : "bg-slate-700"
            }`}
          />
        ))}
      </div>
      {/* Checks */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`font-mono text-[10px] flex items-center gap-1 transition-colors duration-200 ${
              c.pass ? "text-teal-400" : "text-slate-600"
            }`}
          >
            {c.pass ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {c.label}
          </span>
        ))}
        <span className={`font-mono text-[10px] ml-auto ${strengthColor.replace("bg-", "text-")}`}>
          {strengthLabel}
        </span>
      </div>
    </div>
  );
}

function InputField({ label, type, placeholder, value, onChange, required, icon, rightElement, hint }) {
  return (
    <div>
      <label className="block font-mono text-xs text-slate-400 uppercase tracking-[0.12em] mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-12 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 focus:bg-slate-800 transition-all duration-200"
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {hint && <p className="mt-1.5 font-mono text-[10px] text-slate-600">{hint}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/register/", {
        email,
        username,
        password,
      });
      console.log(res.data);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }) =>
    visible ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden px-4 py-10">

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
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative corner lines */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-teal-500/20 rounded-tl-lg" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-teal-500/20 rounded-tr-lg" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-teal-500/20 rounded-bl-lg" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-teal-500/20 rounded-br-lg" />

      <div className="relative w-full max-w-md fade-in">

        {/* Logo / Back */}
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
              NEW ACCOUNT
            </span>
            <h1 className="font-mono font-bold text-2xl text-slate-100 mb-1">
              Create your lab
            </h1>
            <p className="text-slate-400 text-sm">
              Set up your account and start documenting your research.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-5 flex items-start gap-3 bg-teal-500/10 border border-teal-500/25 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-mono text-xs text-teal-400">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Email */}
            <InputField
              label="Email Address"
              type="email"
              placeholder="you@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            {/* Username */}
            <InputField
              label="Username"
              type="text"
              placeholder="dr_researcher"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              hint="Used to log in. Letters, numbers, and underscores only."
              icon={
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            {/* Password */}
            <div>
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-[0.12em] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-[0.12em] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg
                    className={`w-4 h-4 transition-colors duration-200 ${
                      passwordsMatch ? "text-teal-500" : passwordsMismatch ? "text-red-500" : "text-slate-600"
                    }`}
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
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={`w-full bg-slate-800/60 border rounded-xl pl-10 pr-12 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:bg-slate-800 transition-all duration-200 ${
                    passwordsMismatch
                      ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
                      : passwordsMatch
                      ? "border-teal-500/50 focus:border-teal-500/60 focus:ring-teal-500/20"
                      : "border-slate-700 focus:border-teal-500/60 focus:ring-teal-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-teal-400 transition-colors duration-200"
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {passwordsMismatch && (
                <p className="mt-1.5 font-mono text-[10px] text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1.5 font-mono text-[10px] text-teal-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || passwordsMismatch}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5 active:translate-y-0 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Lab Account
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

          {/* Login link */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-mono font-bold text-teal-400 hover:text-teal-300 transition-colors duration-200 underline underline-offset-2 decoration-teal-500/30 hover:decoration-teal-400"
            >
              Sign in →
            </a>
          </p>
        </div>

        {/* Bottom note */}
        <p className="text-center font-mono text-[10px] text-slate-700 mt-6 tracking-wide">
          FREE TO USE · NO CREDIT CARD · CANCEL ANYTIME
        </p>
      </div>
    </div>
  );
}