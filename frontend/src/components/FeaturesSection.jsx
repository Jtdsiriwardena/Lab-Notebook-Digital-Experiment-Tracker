import { useState } from "react";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    tag: "CORE",
    title: "Structured Experiment Logging",
    description:
      "Document every experiment with purpose-built fields: hypotheses, protocols, observations, raw data, and conclusions. No more unstructured Word documents or scattered spreadsheets.",
    highlight: "Timestamped & version-controlled",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tag: "COLLABORATE",
    title: "Role-Based Collaborators",
    description:
      "Invite teammates as Editors or Viewers. Editors can contribute and annotate; Viewers have read-only access. Full control over who sees and touches your research.",
    highlight: "Editors & Viewers",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    tag: "DISCUSS",
    title: "Contextual Comments",
    description:
      "Leave comments directly on experiments. Discuss methodology, flag anomalies, or suggest improvements — all in context, not buried in email threads.",
    highlight: "Threaded discussions",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    tag: "SECURE",
    title: "Private by Default",
    description:
      "Your research stays yours. Experiments are private until you explicitly share them. Fine-grained permissions ensure sensitive data never leaks outside your team.",
    highlight: "You control access",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    tag: "ORGANIZE",
    title: "Tags & Smart Search",
    description:
      "Tag experiments by compound, technique, or project. Full-text search across all your notebooks instantly surfaces the experiment you need, even from months ago.",
    highlight: "Find anything instantly",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    tag: "INSIGHTS",
    title: "Audit Trail & History",
    description:
      "Every edit is logged with who made it and when. Full version history means you can always roll back, comply with research integrity requirements, and trace every decision.",
    highlight: "Complete change history",
  },
];

export default function FeaturesSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="features" className="relative py-28 bg-slate-950 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <span className="inline-block font-mono text-xs text-teal-400 tracking-[0.2em] uppercase mb-4 border border-teal-500/30 px-3 py-1 rounded-full bg-teal-500/5">
            CAPABILITIES
          </span>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-slate-100 leading-tight mb-4">
            Everything a lab team
            <br />
            <span className="text-teal-400">actually needs</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed font-sans">
            Built for scientists, by engineers who understand research workflows.
            No bloat — just the tools that matter.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`relative group p-6 rounded-xl border transition-all duration-300 cursor-default ${
                hovered === i
                  ? "border-teal-500/40 bg-teal-500/5 shadow-lg shadow-teal-900/20"
                  : "border-slate-800/60 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              {/* Tag */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] tracking-[0.2em] text-slate-600">
                  {feature.tag}
                </span>
                <div
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    hovered === i
                      ? "bg-teal-400/15 text-teal-400"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="font-mono font-bold text-slate-100 text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-sans mb-4">
                {feature.description}
              </p>

              {/* Highlight */}
              <div
                className={`inline-flex items-center gap-1.5 text-xs font-mono transition-colors duration-300 ${
                  hovered === i ? "text-teal-400" : "text-slate-600"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    hovered === i ? "bg-teal-400" : "bg-slate-700"
                  }`}
                />
                {feature.highlight}
              </div>

              {/* Corner accent */}
              {hovered === i && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-xl pointer-events-none">
                  <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-teal-400/60 to-transparent" />
                  <div className="absolute top-0 right-0 h-px w-8 bg-gradient-to-l from-teal-400/60 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}