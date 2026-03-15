import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-xl border-b border-teal-500/10 shadow-lg shadow-teal-900/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Testimonials", href: "#testimonials" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-200 hover:text-teal-400 font-mono text-sm tracking-wide transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-teal-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="font-mono text-sm text-slate-200 hover:text-teal-400 transition-colors duration-200 px-4 py-2"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="font-mono text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-200 hover:text-teal-400 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-teal-500/10 bg-slate-950/95 backdrop-blur-xl py-4 px-2 space-y-2">
            {["Features", "How It Works", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="block font-mono text-sm text-slate-200 hover:text-teal-400 px-4 py-2 rounded-lg hover:bg-teal-500/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2 px-4">
              <a href="/login" className="font-mono text-sm text-center text-slate-200 border border-slate-700 py-2 rounded-lg hover:border-teal-500/40 transition-colors">
                Sign In
              </a>
              <a href="/register" className="font-mono text-sm text-center bg-teal-500 text-slate-950 font-bold py-2 rounded-lg hover:bg-teal-400 transition-colors">
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}