import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";

// Animated typing effect for the hero subtitle
function TypingText({ phrases }) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), 60);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), 35);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((p) => (p + 1) % phrases.length);
    }

    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases]);

  return (
    <span className="text-teal-400">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Mock notebook UI card for the hero visual
function NotebookCard() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-teal-500/10 rounded-3xl blur-2xl scale-110" />

      <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 shadow-2xl shadow-slate-950/80 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <div className="w-3 h-3 rounded-full bg-slate-700" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-slate-800 rounded-md px-3 py-1 font-mono text-xs text-slate-300 text-center">
              labnote.io / experiments / EXP-2024-047
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 space-y-4">
          {/* Experiment header */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-teal-500/80 tracking-[0.15em] uppercase">
                EXP-2024-047
              </span>
              <span className="font-mono text-[10px] text-slate-600">Dec 14, 2024 · 09:41</span>
            </div>
            <h3 className="font-mono font-bold text-slate-100 text-base">
              CRISPR-Cas9 efficiency in HEK293T cells — Round 3
            </h3>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {["CRISPR", "Gene Editing", "HEK293T", "Round 3"].map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {[
              {
                label: "Hypothesis",
                value: "Optimised sgRNA concentration will increase on-target efficiency by >15%.",
              },
              {
                label: "Outcome",
                value: "Achieved 23.4% improvement. Off-target events within acceptable bounds.",
                highlight: true,
              },
            ].map((field) => (
              <div key={field.label} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.12em] mb-1">
                  {field.label}
                </div>
                <p
                  className={`font-sans text-xs leading-relaxed ${
                    field.highlight ? "text-teal-300" : "text-slate-400"
                  }`}
                >
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          {/* Collaborators + comment */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["SC", "MO", "PR"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-700 border-2 border-slate-900 flex items-center justify-center font-mono text-[9px] font-bold text-slate-950"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="font-mono text-[10px] text-slate-600">3 collaborators</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              7 comments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        .font-mono { font-family: 'Space Mono', monospace; }
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .float-anim { animation: float 5s ease-in-out infinite; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.7s ease both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Radial glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-900/20 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative data lines */}
        <div className="absolute left-6 top-1/3 hidden xl:flex flex-col gap-1 opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-px bg-teal-400 rounded"
              style={{ width: `${20 + (i % 3) * 15}px` }}
            />
          ))}
        </div>
        <div className="absolute right-6 bottom-1/3 hidden xl:flex flex-col gap-1 opacity-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-px bg-cyan-400 rounded"
              style={{ width: `${15 + (i % 4) * 10}px` }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <div className="fade-in-up inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 rounded-full px-4 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="font-mono text-xs text-teal-400 tracking-wide">
                  Digital Lab Notebook for Modern Research
                </span>
              </div>

              {/* Headline */}
              <h1 className="fade-in-up delay-100 font-mono font-bold text-4xl md:text-5xl xl:text-6xl leading-[1.1] text-slate-100 mb-6">
                Document science.
                <br />
                <span className="text-teal-400">Collaborate</span> better.
                <br />
                <span className="text-slate-500">Ship results.</span>
              </h1>

              {/* Subheadline with typing effect */}
              <p className="fade-in-up delay-200 text-slate-400 text-lg leading-relaxed mb-4 max-w-lg">
                LabNote is the structured digital lab notebook for scientists and research teams. Log experiments, manage collaborators, and keep all your science in one place —
              </p>
              <p className="fade-in-up delay-200 font-mono text-base text-slate-300 mb-8">
                Built for{" "}
                <TypingText
                  phrases={[
                    "biochemistry labs.",
                    "pharmacology teams.",
                    "material scientists.",
                    "genomics researchers.",
                    "academic institutions.",
                  ]}
                />
              </p>

              {/* CTA Buttons */}
              <div className="fade-in-up delay-300 flex flex-col sm:flex-row gap-4 mb-10">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-sm px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-teal-500/25 hover:shadow-teal-400/30 hover:-translate-y-1 group"
                >
                  Start for Free
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm px-8 py-4 rounded-xl transition-all duration-200 border border-slate-700 hover:border-teal-500/30 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In to Your Lab
                </a>
              </div>

              {/* Trust indicators */}
              <div className="fade-in-up delay-400 flex flex-wrap items-center gap-6">
                {[
                  { icon: "🔒", text: "Private by default" },
                  { icon: "✓", text: "No credit card required" },
                  { icon: "⚡", text: "Set up in 2 minutes" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <span className="text-teal-400 text-sm">{item.icon}</span>
                    <span className="font-mono text-xs text-slate-500">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="fade-in-up delay-500 float-anim">
              <NotebookCard />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <span className="font-mono text-[10px] text-slate-600 tracking-[0.15em] uppercase">Scroll</span>
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Features Section ── */}
      <FeaturesSection />

      {/* ── How It Works Section ── */}
      <HowItWorksSection />

      {/* ── Testimonials Section ── */}
      <TestimonialsSection />

      {/* ── Final CTA Section ── */}
      <section className="relative py-28 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-cyan-900/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block font-mono text-xs text-teal-400 tracking-[0.2em] uppercase mb-6 border border-teal-500/30 px-3 py-1 rounded-full bg-teal-500/5">
            GET STARTED
          </span>
          <h2 className="font-mono text-4xl md:text-5xl font-bold text-slate-100 mb-6 leading-tight">
            Your lab deserves
            <br />
            <span className="text-teal-400">better records.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Stop losing experiments in email chains and shared drives.
            Start documenting science the way it deserves to be documented.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-sm px-10 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-teal-500/25 hover:shadow-teal-400/30 hover:-translate-y-1 group"
            >
              Create Free Account
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-teal-500/40 text-slate-300 font-mono font-bold text-sm px-10 py-4 rounded-xl transition-all duration-200 hover:bg-teal-500/5 hover:-translate-y-0.5"
            >
              Already have an account? Sign In
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}