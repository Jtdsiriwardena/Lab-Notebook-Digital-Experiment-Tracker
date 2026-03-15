import { useState, useContext, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ── Section config
const sections = [
  {
    key: "objective",
    label: "Objective",
    placeholder: "Describe the goal and purpose of this experiment...",
    rows: 3,
    required: true,
    accent: { icon: "text-teal-400", iconBg: "bg-teal-500/10 border-teal-500/20", label: "text-teal-400", drag: "border-teal-500/40 bg-teal-500/5" },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "procedure",
    label: "Procedure",
    placeholder: "Detail the step-by-step process of your experiment...",
    rows: 5,
    required: true,
    accent: { icon: "text-cyan-400", iconBg: "bg-cyan-500/10 border-cyan-500/20", label: "text-cyan-400", drag: "border-cyan-500/40 bg-cyan-500/5" },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: "results",
    label: "Results",
    placeholder: "Document your findings, observations, and data...",
    rows: 5,
    required: true,
    accent: { icon: "text-violet-400", iconBg: "bg-violet-500/10 border-violet-500/20", label: "text-violet-400", drag: "border-violet-500/40 bg-violet-500/5" },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

// ── Image upload sub-component
function ImageUploadSection({ section, images, accent, onImagesChange, onRemove, onDescriptionSave, expandedSections, toggleSection }) {
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [editText, setEditText]     = useState("");
  const fileInputRef = useRef(null);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop      = (e) => { e.preventDefault(); setIsDragging(false); onImagesChange(e.dataTransfer.files); };
  const handleFileSelect = (e) => { if (e.target.files.length) onImagesChange(e.target.files); e.target.value = ""; };

  const startEdit = (id, text) => { setEditingId(id); setEditText(text); };
  const saveEdit  = ()         => { onDescriptionSave(section.key, editingId, editText); setEditingId(null); };
  const cancelEdit = ()        => setEditingId(null);

  const isExpanded = expandedSections[section.key];

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      {/* Collapse header */}
      <button
        type="button"
        onClick={() => toggleSection(section.key)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/70 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${accent.iconBg}`}>
            <span className={accent.icon}>{section.icon}</span>
          </div>
          <span className={`font-mono text-sm font-bold ${accent.label}`}>{section.label} Images</span>
          <span className="font-mono text-[10px] text-slate-600 border border-slate-700 bg-slate-800 px-2 py-0.5 rounded-full">
            {images.length} {images.length === 1 ? "file" : "files"}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-slate-900/30">
          {/* Image grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => {
                const isEditing = editingId === img.id;
                return (
                  <div key={img.id} className="group relative">
                    <div className="rounded-xl overflow-hidden border border-slate-700">
                      <img src={img.preview} alt="Preview" className="w-full h-32 object-cover" />
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => onRemove(section.key, img.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500/90 hover:bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Description */}
                    <div className="mt-1.5">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                            onBlur={saveEdit}
                            placeholder="Image description..."
                            autoFocus
                            className="w-full bg-slate-800 border border-teal-500/40 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/20 transition-all"
                          />
                          <p className="font-mono text-[9px] text-slate-700">Enter to save · Esc to cancel</p>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-between gap-1 group/desc cursor-pointer"
                          onClick={() => startEdit(img.id, img.description)}
                        >
                          <p className={`font-mono text-[10px] truncate ${img.description ? "text-slate-400 italic" : "text-slate-700"}`}>
                            {img.description || "Add description..."}
                          </p>
                          <svg className="w-3 h-3 text-slate-700 group-hover/desc:text-teal-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 ${
              isDragging ? accent.drag : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id={`image-upload-${section.key}`}
              ref={fileInputRef}
            />
            <label htmlFor={`image-upload-${section.key}`} className="cursor-pointer block">
              <div className={`w-10 h-10 rounded-xl border mx-auto mb-2 flex items-center justify-center transition-colors ${
                isDragging ? accent.iconBg : "bg-slate-800 border-slate-700"
              }`}>
                <svg className={`w-5 h-5 ${isDragging ? accent.icon : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-mono text-xs text-slate-300">
                Click to upload or drag & drop
              </p>
              <p className="font-mono text-[10px] text-slate-400 mt-1">PNG, JPG, GIF · up to 10MB</p>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page
export default function CreateExperimentPage() {
  const { token } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [name,      setName]      = useState("");
  const [objective, setObjective] = useState("");
  const [procedure, setProcedure] = useState("");
  const [results,   setResults]   = useState("");
  const [tags,      setTags]      = useState("");

  const [objectiveImages, setObjectiveImages] = useState([]);
  const [procedureImages, setProcedureImages] = useState([]);
  const [resultsImages,   setResultsImages]   = useState([]);

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    objective: true,
    procedure: true,
    results:   true,
  });

  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Image state helpers
  const imageStateMap = {
    objective: { get: objectiveImages, set: setObjectiveImages },
    procedure: { get: procedureImages, set: setProcedureImages },
    results:   { get: resultsImages,   set: setResultsImages   },
  };

  const handleImageSelect = (section, files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: "",
      section,
      id: Date.now() + Math.random(),
    }));
    imageStateMap[section].set((prev) => [...prev, ...newImages]);
  };

  const handleImageRemove = (section, imageId) => {
    const { get, set } = imageStateMap[section];
    const img = get.find((i) => i.id === imageId);
    if (img?.preview) URL.revokeObjectURL(img.preview);
    set((prev) => prev.filter((i) => i.id !== imageId));
  };

  const handleDescriptionSave = useCallback((section, imageId, description) => {
    imageStateMap[section].set((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, description } : img))
    );
  }, []);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      [...objectiveImages, ...procedureImages, ...resultsImages].forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const experimentResponse = await axios.post(
        "http://localhost:8000/api/experiments/",
        { name, objective, procedure, results, tags },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const experimentId = experimentResponse.data.id;

      const allImages = [
        ...objectiveImages.map((img) => ({ ...img, sectionKey: "objective" })),
        ...procedureImages.map((img) => ({ ...img, sectionKey: "procedure" })),
        ...resultsImages.map((img)   => ({ ...img, sectionKey: "results"   })),
      ];

      const uploadPromises = allImages.map((img) => {
        const formData = new FormData();
        formData.append("image",       img.file);
        formData.append("section",     img.sectionKey);
        formData.append("description", img.description);
        return axios.post(
          `http://localhost:8000/api/experiments/${experimentId}/section-images/`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
      });

      if (uploadPromises.length) await Promise.all(uploadPromises);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Failed to create experiment.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tag preview
  const safeTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-800 py-10 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        .font-mono { font-family: 'Space Mono', monospace; }
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Subtle background */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 font-mono text-xs text-slate-200 hover:text-teal-400 transition-colors mb-5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0">
              <div className="absolute inset-0 bg-teal-400/20 rounded-xl blur-sm" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="inline-block font-mono text-[10px] text-teal-400 tracking-[0.2em] uppercase border border-teal-500/30 px-2.5 py-1 rounded-full bg-teal-500/5 mb-1">
                NEW RECORD
              </span>
              <h1 className="font-mono font-bold text-2xl text-slate-100">Create Experiment</h1>
            </div>
          </div>
        </div>

        {/* ── Error alert ── */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-2xl px-5 py-4">
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-mono text-xs font-bold text-red-400 mb-0.5">Failed to create experiment</p>
              <p className="font-mono text-xs text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Experiment name ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <label className="block font-mono text-xs text-slate-300 uppercase tracking-[0.12em] mb-2">
              Experiment Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="e.g. CRISPR-Cas9 efficiency in HEK293T cells — Round 3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* ── Experiment sections ── */}
          {sections.map((section) => {
            const { accent } = section;
            const valueMap = { objective, procedure, results };
            const setterMap = { objective: setObjective, procedure: setProcedure, results: setResults };
            const imagesMap = { objective: objectiveImages, procedure: procedureImages, results: resultsImages };

            return (
              <div key={section.key} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                {/* Section label */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${accent.iconBg}`}>
                    <span className={accent.icon}>{section.icon}</span>
                  </div>
                  <label className={`font-mono font-bold text-sm ${accent.label}`}>
                    {section.label}
                    {section.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                </div>

                {/* Textarea */}
                <textarea
                  placeholder={section.placeholder}
                  value={valueMap[section.key]}
                  onChange={(e) => setterMap[section.key](e.target.value)}
                  required={section.required}
                  disabled={loading}
                  rows={section.rows}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 font-sans text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 resize-none transition-all duration-200 disabled:opacity-50 leading-relaxed"
                />

                {/* Image uploader */}
                <ImageUploadSection
                  section={section}
                  accent={accent}
                  images={imagesMap[section.key]}
                  onImagesChange={(files) => handleImageSelect(section.key, files)}
                  onRemove={handleImageRemove}
                  onDescriptionSave={handleDescriptionSave}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              </div>
            );
          })}

          {/* ── Tags ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs text-slate-300 uppercase tracking-[0.12em]">
                Tags
                <span className="text-slate-500 ml-2 normal-case tracking-normal">(optional)</span>
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="CRISPR, gene-editing, HEK293T, round-3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200 disabled:opacity-50"
              />
            </div>
            <p className="font-mono text-[10px] text-slate-700 mt-2">
              Separate tags with commas — used to filter and find experiments later
            </p>

            {/* Live tag preview */}
            {safeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {safeTags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1 pb-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
              className="flex-1 font-mono text-sm text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-slate-300 py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Creating Experiment...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Create Experiment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}