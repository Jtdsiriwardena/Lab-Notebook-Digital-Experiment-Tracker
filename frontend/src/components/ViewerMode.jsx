import { useState, useEffect } from "react";
import CommentsSection from "./CommentsSection";

const sections = [
  {
    key: "objective",
    label: "Objective",
    emptyText: "No objective specified",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: { icon: "text-teal-400", iconBg: "bg-teal-500/10 border-teal-500/20", label: "text-teal-400" },
  },
  {
    key: "procedure",
    label: "Procedure",
    emptyText: "No procedure specified",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    accent: { icon: "text-cyan-400", iconBg: "bg-cyan-500/10 border-cyan-500/20", label: "text-cyan-400" },
  },
  {
    key: "results",
    label: "Results",
    emptyText: "No results recorded",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: { icon: "text-violet-400", iconBg: "bg-violet-500/10 border-violet-500/20", label: "text-violet-400" },
  },
];

function ImageGrid({ images }) {
  if (!images.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      {images.map((img) => (
        <div key={img.id} className="rounded-xl overflow-hidden border border-slate-700">
          <img
            src={img.image}
            alt={img.description || "Section image"}
            className="w-full h-40 object-cover"
          />
          {img.description && (
            <div className="px-3 py-1.5 bg-slate-800/90 border-t border-slate-700">
              <p className="font-mono text-[10px] text-slate-400 italic truncate">{img.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ViewerMode({ experiment, onExitViewerMode }) {
  const [viewerData, setViewerData] = useState(null);

  useEffect(() => {
    setViewerData({
      ...experiment,
      collaborators: undefined,
      current_user_role: "viewer",
    });
  }, [experiment]);

  if (!viewerData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const safeTags =
    typeof viewerData.tags === "string"
      ? viewerData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  const getImagesForSection = (section) =>
    viewerData.section_images?.filter((img) => img.section === section) || [];

  return (
    <div className="space-y-5">

      {/* ── Viewer mode banner ── */}
      <div className="relative flex items-center justify-between gap-4 bg-amber-500/8 border border-amber-500/25 rounded-2xl px-5 py-4 overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-amber-400">Viewer Mode Active</h3>
            <p className="font-mono text-[10px] text-amber-500/70">
              Preview exactly what a Viewer sees — read-only, no edit controls
            </p>
          </div>
        </div>

        <button
          onClick={onExitViewerMode}
          className="relative shrink-0 flex items-center gap-2 font-mono text-xs font-bold text-amber-400 border border-amber-500/30 hover:border-amber-400/50 bg-amber-500/10 hover:bg-amber-500/15 px-4 py-2 rounded-xl transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          Exit Viewer Mode
        </button>
      </div>

      {/* ── Experiment header ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.2em]">
                Experiment
              </span>
              <span className="font-mono text-[10px] text-slate-700">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-full border text-slate-400 bg-slate-700/40 border-slate-600/30">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                Viewer
              </span>
            </div>
            <h1 className="font-mono font-bold text-xl sm:text-2xl text-slate-100 leading-tight mb-4">
              {viewerData.name}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-5">
              {[
                {
                  label: "Created",
                  value: new Date(viewerData.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  label: "Last Updated",
                  value: new Date(viewerData.updated_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-teal-500/50">{item.icon}</span>
                  <div>
                    <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.1em]">{item.label}</p>
                    <p className="font-mono text-xs text-slate-400">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="lg:w-64 shrink-0">
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.2em] mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {safeTags.length > 0 ? (
                safeTags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="font-mono text-xs text-slate-600">No tags</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content sections ── */}
      {sections.map((section) => {
        const { accent } = section;
        const images = getImagesForSection(section.key);
        const content = viewerData[section.key];

        return (
          <div key={section.key} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${accent.iconBg}`}>
                <span className={accent.icon}>{section.icon}</span>
              </div>
              <div>
                <h2 className={`font-mono font-bold text-base ${accent.label}`}>{section.label}</h2>
                <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.12em]">Read only</p>
              </div>
            </div>

            {/* Images */}
            <ImageGrid images={images} />

            {/* Content */}
            <div className="bg-slate-800/40 rounded-xl px-5 py-4 border border-slate-700/50">
              {content ? (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {content}
                </p>
              ) : (
                <p className="font-mono text-xs text-slate-600 italic">{section.emptyText}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Comments ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="font-mono font-bold text-base text-amber-400">Comments</h2>
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.12em]">Team discussion · viewer perspective</p>
          </div>
        </div>
        <CommentsSection experimentId={experiment.id} />
      </div>

      {/* ── Read-only notice ── */}
      <div className="flex items-center justify-center gap-3 py-3">
        <div className="h-px flex-1 bg-slate-800" />
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-700 px-3">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Viewer mode — no edits can be made
        </div>
        <div className="h-px flex-1 bg-slate-800" />
      </div>
    </div>
  );
}