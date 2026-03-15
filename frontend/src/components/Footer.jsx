export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Product: ["Features", "How It Works", "Changelog", "Roadmap"],
    Resources: ["Documentation", "API Reference", "Security", "Status"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="relative bg-slate-950 border-t border-teal-500/10 overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Main footer content */}
        <div className="pt-16 pb-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-teal-400/20 rounded-lg blur-sm" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-100 tracking-tight text-lg">
                Lab<span className="text-teal-400">Note</span>
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              The digital lab notebook built for modern research teams. Structured, collaborative, and designed to reflect how science actually works.
            </p>

            {/* Newsletter */}
            <div>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-[0.15em] mb-3">
                Stay updated
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@institution.edu"
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-300 font-mono placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                />
                <button className="shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-xs px-4 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(links).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
                  {category}
                </h4>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-mono text-sm text-slate-500 hover:text-teal-400 transition-colors duration-200"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/60 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-600">
            © {year} LabNote. Built for scientists who care about their data.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* GitHub */}
            <a href="#" className="text-slate-600 hover:text-teal-400 transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" className="text-slate-600 hover:text-teal-400 transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="text-slate-600 hover:text-teal-400 transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-600">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}