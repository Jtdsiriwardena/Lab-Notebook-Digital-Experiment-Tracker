const steps = [
  {
    number: "01",
    title: "Create Your Notebook",
    description:
      "Sign up and create a project notebook. Organise experiments by topic, date, or custom categories. Your digital workspace is ready in seconds.",
    detail: "Unlimited notebooks on any plan",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Log Experiments",
    description:
      "Record experiments with structured fields: goals, procedures, materials, results, and conclusions. Attach files, add data tables, write rich notes.",
    detail: "Rich text + file attachments",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Invite Collaborators",
    description:
      "Add team members as Editors or Viewers. Editors contribute and edit; Viewers can read and comment without modifying your records.",
    detail: "Granular permission control",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Discuss & Iterate",
    description:
      "Team members leave comments on specific experiments. Discuss results, flag issues, suggest repeats — all tied directly to the experiment record.",
    detail: "Contextual threaded comments",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 bg-slate-900 overflow-hidden">
      {/* Diagonal accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block font-mono text-xs text-teal-400 tracking-[0.2em] uppercase mb-4 border border-teal-500/30 px-3 py-1 rounded-full bg-teal-500/5">
            WORKFLOW
          </span>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            From idea to record
            <br />
            <span className="text-teal-400">in four steps</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            LabNote fits into how science actually works — no steep learning curve, no workflow disruption.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-slate-800 via-teal-500/30 to-slate-800" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Number badge */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-teal-400/10 rounded-2xl blur-md group-hover:bg-teal-400/20 transition-all duration-300" />
                  <div className="relative w-28 h-28 rounded-2xl bg-slate-800 border border-slate-700 group-hover:border-teal-500/40 transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-xl">
                    <span className="font-mono text-[10px] text-teal-500/70 tracking-[0.2em]">STEP</span>
                    <div className="text-teal-400 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-500">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-mono font-bold text-slate-100 text-base mb-2 group-hover:text-teal-400 transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3 max-w-[220px]">
                  {step.description}
                </p>
                <span className="font-mono text-[11px] text-teal-500/70 tracking-wide">
                  → {step.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 rounded-2xl border border-teal-500/20 bg-gradient-to-r from-slate-800/50 via-teal-900/20 to-slate-800/50 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-mono font-bold text-slate-100 text-lg mb-1">
              Ready to modernize your lab records?
            </h3>
            <p className="text-slate-400 text-sm">
              Join research teams already using LabNote to document their science.
            </p>
          </div>
          <a
            href="/register"
            className="shrink-0 font-mono font-bold text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5 whitespace-nowrap"
          >
            Start Free Today →
          </a>
        </div>
      </div>
    </section>
  );
}