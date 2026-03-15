import { useState } from "react";
import api from "../api/axios";
import CommentsSection from "./CommentsSection";
import SectionImageUploader from "./SectionImageUploader";

// ── Section config
const sections = [
  {
    key: "objective",
    label: "Objective",
    placeholder: "Describe the experiment's objective...",
    rows: 4,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "teal",
  },
  {
    key: "procedure",
    label: "Procedure",
    placeholder: "Describe the experimental procedure step by step...",
    rows: 7,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    accent: "cyan",
  },
  {
    key: "results",
    label: "Results",
    placeholder: "Document the experimental results and observations...",
    rows: 7,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: "violet",
  },
];

const accentMap = {
  teal:   { icon: "text-teal-400",   iconBg: "bg-teal-500/10 border-teal-500/20",   tag: "text-teal-400 bg-teal-500/10 border-teal-500/20",   label: "text-teal-400"  },
  cyan:   { icon: "text-cyan-400",   iconBg: "bg-cyan-500/10 border-cyan-500/20",   tag: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",   label: "text-cyan-400"  },
  violet: { icon: "text-violet-400", iconBg: "bg-violet-500/10 border-violet-500/20", tag: "text-violet-400 bg-violet-500/10 border-violet-500/20", label: "text-violet-400" },
};

// ── Image grid
function SectionImages({ images, editable, onDelete }) {
  if (!images.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      {images.map((img) => (
        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-700">
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
          {editable && (
            <button
              onClick={() => onDelete(img.id)}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 hover:bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component
export default function ExperimentContent({ experiment, editable, onExperimentUpdate }) {
  const [form, setForm] = useState({
    name:      experiment.name,
    objective: experiment.objective,
    procedure: experiment.procedure,
    results:   experiment.results,
    tags:      experiment.tags || "",
  });
  const [saving, setSaving]           = useState(false);
  const [message, setMessage]         = useState({ text: "", type: "" });
  const [sectionImages, setSectionImages] = useState(experiment.section_images || []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await api.put(`/experiments/${experiment.id}/`, form);
      setMessage({ text: "Changes saved successfully.", type: "success" });
      onExperimentUpdate?.({ ...experiment, ...form });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: "Failed to save changes. Please try again.", type: "error" });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploaded = (newImage, deletedImageId) => {
    if (deletedImageId) {
      setSectionImages((prev) => prev.filter((img) => img.id !== deletedImageId));
    } else if (newImage) {
      setSectionImages((prev) => [...prev, newImage]);
    }
  };

  const getImagesForSection = (section) =>
    sectionImages.filter((img) => img.section === section);

  const safeTags =
    typeof form.tags === "string"
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  return (
    <div className="space-y-5">

      {/* ── Header card ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">

          {/* Experiment name */}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.2em] mb-2">
              Experiment Name
            </p>
            {editable ? (
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 font-mono font-bold text-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200"
                placeholder="Experiment name..."
              />
            ) : (
              <h1 className="font-mono font-bold text-xl text-slate-100 leading-snug">
                {experiment.name}
              </h1>
            )}
          </div>

          {/* Tags */}
          <div className="lg:w-72 shrink-0">
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.2em] mb-2">
              Tags
            </p>
            {editable ? (
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200"
                placeholder="comma, separated, tags"
              />
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
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
                  <span className="font-mono text-xs text-slate-600">No tags added</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save message */}
        {message.text && (
          <div
            className={`mt-5 flex items-center gap-3 rounded-xl px-4 py-3 border ${
              message.type === "success"
                ? "bg-teal-500/10 border-teal-500/25 text-teal-400"
                : "bg-red-500/10 border-red-500/25 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <p className="font-mono text-xs">{message.text}</p>
          </div>
        )}
      </div>

      {/* ── Experiment sections ── */}
      {sections.map((section) => {
        const ac = accentMap[section.accent];
        const imgs = getImagesForSection(section.key);

        return (
          <div
            key={section.key}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 group"
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${ac.iconBg}`}>
                <span className={ac.icon}>{section.icon}</span>
              </div>
              <div>
                <h2 className={`font-mono font-bold text-base ${ac.label}`}>
                  {section.label}
                </h2>
                <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.12em]">
                  {editable ? "Editing" : "Read only"}
                </p>
              </div>
            </div>

            {/* Images */}
            <SectionImages
              images={imgs}
              editable={editable}
              onDelete={(id) => handleImageUploaded(null, id)}
            />

            {/* Text area / read-only */}
            {editable ? (
              <>
                <textarea
                  name={section.key}
                  value={form[section.key]}
                  onChange={handleChange}
                  rows={section.rows}
                  placeholder={section.placeholder}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 font-sans text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 resize-none transition-all duration-200 leading-relaxed"
                />
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <SectionImageUploader
                    experimentId={experiment.id}
                    section={section.key}
                    onImageUploaded={handleImageUploaded}
                    existingImages={imgs}
                  />
                </div>
              </>
            ) : (
              <div className="bg-slate-800/40 rounded-xl px-5 py-4 border border-slate-700/50">
                {form[section.key] ? (
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {form[section.key]}
                  </p>
                ) : (
                  <p className="font-mono text-xs text-slate-600 italic">
                    No {section.label.toLowerCase()} specified
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Save button ── */}
      {editable && (
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4">
          <p className="font-mono text-xs text-slate-600">
            {saving ? "Saving changes..." : "All unsaved changes will be lost on navigation"}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Saving...
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
      )}

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
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.12em]">
              Team discussion
            </p>
          </div>
        </div>
        <CommentsSection experimentId={experiment.id} />
      </div>
    </div>
  );
}