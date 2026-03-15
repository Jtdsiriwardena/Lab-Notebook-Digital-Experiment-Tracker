const testimonials = [
  {
    quote:
      "We used to lose hours every week digging through shared drives for old experiment notes. LabNote changed that overnight — everything is searchable, structured, and shared with the right people.",
    name: "Dr. Sarah Chen",
    role: "Principal Investigator",
    org: "BioSynth Labs",
    avatar: "SC",
    accent: "teal",
    stars: 5,
  },
  {
    quote:
      "The role-based access is exactly what we needed. PhD students can log their work, postdocs can edit, and I as the PI can review everything without chaos. Comments keep all discussions in context.",
    name: "Prof. Marcus Okonkwo",
    role: "Department Head, Biochemistry",
    org: "University of Edinburgh",
    avatar: "MO",
    accent: "cyan",
    stars: 5,
  },
  {
    quote:
      "Finally an ELN that doesn't feel like it was designed in 2005. The interface is clean, the structure makes sense, and the audit trail satisfies our compliance requirements perfectly.",
    name: "Priya Ramesh",
    role: "Research Scientist",
    org: "Novagen Therapeutics",
    avatar: "PR",
    accent: "teal",
    stars: 5,
  },
  {
    quote:
      "I manage three simultaneous projects with different collaborators. LabNote keeps them cleanly separated while letting me share individual experiments across teams. It's genuinely impressive.",
    name: "Dr. James Holloway",
    role: "CTO & Co-founder",
    org: "CatalystX",
    avatar: "JH",
    accent: "cyan",
    stars: 5,
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-28 bg-slate-950 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block font-mono text-xs text-teal-400 tracking-[0.2em] uppercase mb-4 border border-teal-500/30 px-3 py-1 rounded-full bg-teal-500/5">
            TESTIMONIALS
          </span>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Trusted by researchers
            <br />
            <span className="text-teal-400">across disciplines</span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            From academic labs to biotech startups — here's what scientists are saying.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="relative group p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/10"
            >
              {/* Quote mark */}
              <div className="absolute top-6 right-6 font-mono text-6xl leading-none text-slate-800 group-hover:text-teal-900 transition-colors duration-300 select-none">
                "
              </div>

              <StarRating count={t.stars} />

              <blockquote className="mt-4 mb-6 text-slate-300 text-[15px] leading-relaxed relative z-10">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center font-mono font-bold text-sm text-slate-950 shadow-lg shadow-teal-500/20">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-mono font-bold text-slate-100 text-sm">{t.name}</div>
                  <div className="font-mono text-xs text-slate-500">
                    {t.role} · <span className="text-teal-500/80">{t.org}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "2,400+", label: "Researchers" },
            { value: "38,000+", label: "Experiments Logged" },
            { value: "120+", label: "Institutions" },
            { value: "4.9 / 5", label: "Average Rating" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center py-5 px-4 rounded-xl bg-slate-900/40 border border-slate-800"
            >
              <div className="font-mono text-2xl font-bold text-teal-400 mb-1">{stat.value}</div>
              <div className="font-mono text-xs text-slate-500 tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}