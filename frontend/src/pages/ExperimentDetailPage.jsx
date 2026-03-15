import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ExperimentContent from "../components/ExperimentContent";
import ChangeLogs from "../components/ChangeLogs";
import Collaborators from "../components/Collaborators";
import ViewerMode from "../components/ViewerMode";
import PDFExportButton from "../components/PDFExportButton";
import CollaboratorPresence from "../components/CollaboratorPresence";

const tabs = [
  {
    id: "experiment",
    label: "Experiment",
    roles: ["owner", "editor", "viewer"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    id: "changelogs",
    label: "Change Logs",
    roles: ["owner", "editor", "viewer"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "collaborators",
    label: "Collaborators",
    roles: ["owner", "editor", "viewer"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "viewer",
    label: "Viewer Mode",
    roles: ["owner", "editor"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

const roleStyles = {
  owner: { text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  editor: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  viewer: { text: "text-slate-400", bg: "bg-slate-700/40", border: "border-slate-600/40" },
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-teal-500/30 border-t-teal-400/60 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <p className="font-mono text-sm text-slate-500 tracking-wide">Loading experiment...</p>
      </div>
    </div>
  );
}

export default function ExperimentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const experimentRef = useRef(null);

  const [experiment, setExperiment] = useState(null);
  const [editable, setEditable] = useState(false);
  const [activeTab, setActiveTab] = useState("experiment");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/experiments/${id}/`);
        setExperiment(res.data);
        setEditable(["owner", "editor"].includes(res.data.current_user_role));
      } catch (err) {
        console.error("Failed to fetch experiment", err);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/experiments/${id}/`);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const handleExperimentUpdate = (updatedExperiment) => {
    setExperiment(updatedExperiment);
  };

  if (!experiment) return <LoadingScreen />;

  const visibleTabs = tabs.filter((tab) =>
    tab.roles.includes(experiment.current_user_role)
  );

  const role = experiment.current_user_role;
  const rs = roleStyles[role] || roleStyles.viewer;

  return (
    <div className="min-h-screen bg-slate-800 text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        .font-mono { font-family: 'Space Mono', monospace; }
        body { font-family: 'DM Sans', sans-serif; }
        @media print { .pdf-only { display: block !important; } }
      `}</style>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-slate-950/80">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-mono font-bold text-slate-100 text-center mb-2">Delete Experiment?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              This will permanently delete <span className="text-slate-200 font-medium">"{experiment.name}"</span> and all its data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 font-mono text-sm text-slate-200 border border-slate-700 hover:border-slate-600 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 font-mono text-sm font-bold bg-red-500/90 hover:bg-red-500 text-white py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <div className="relative bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 mb-5 overflow-hidden">

          {/* Subtle corner glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-5">

            {/* ── Top Row: Breadcrumb ── */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="font-mono text-xs text-slate-600 hover:text-teal-400 transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Experiments
              </button>

              <span className="text-slate-700 font-mono text-xs">/</span>

              <span className="font-mono text-xs text-slate-500 break-words line-clamp-1">
                {experiment.name}
              </span>
            </div>

            {/* ── Title ── */}
            <h1
              className="font-mono font-bold text-xl sm:text-2xl text-slate-100
      leading-tight break-words line-clamp-2"
            >
              {experiment.name}
            </h1>

            {/* ── Meta + Actions Row ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              {/* Left: Meta */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Role badge */}
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full border ${rs.bg} ${rs.text} ${rs.border}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>

                {/* Experiment ID */}
                <span className="font-mono text-[10px] text-slate-300 tracking-wide">
                  ID: EXP-{String(experiment.id).padStart(4, "0")}
                </span>

                {/* Tags */}
                {experiment.tags &&
                  experiment.tags.split(",").map((tag, i) => (
                    <span
                      key={i}
                      className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0">

                 <CollaboratorPresence experimentId={experiment.id} />

                <PDFExportButton experiment={experiment} />

                {experiment.current_user_role === "owner" && (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-2 font-mono text-xs text-slate-300
              hover:text-red-400 border border-slate-700 hover:border-red-500/30
              bg-slate-800/60 hover:bg-red-500/5 px-4 py-2.5 rounded-xl
              transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* ── Tab Nav ── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl mb-5 overflow-hidden">
          <nav className="flex">
            {visibleTabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-4 font-mono text-sm transition-all duration-200 border-b-2 ${activeTab === tab.id
                    ? "text-teal-400 border-teal-500 bg-teal-500/5"
                    : "text-slate-200 border-transparent hover:text-slate-300 hover:bg-slate-800/40"
                  } ${i !== 0 ? "border-l border-l-slate-800" : ""}`}
              >
                <span className={`transition-colors duration-200 ${activeTab === tab.id ? "text-teal-400" : "text-slate-300"}`}>
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>

                {/* Active dot */}
                {activeTab === tab.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Content ── */}
        <div
          id="experiment-content-for-pdf"
          ref={experimentRef}
          className="transition-all duration-300"
        >
          {/* Experiment Tab */}
          {activeTab === "experiment" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-3">
                <ExperimentContent
                  experiment={experiment}
                  editable={editable}
                  onExperimentUpdate={handleExperimentUpdate}
                />
              </div>

              {/* Quick Info Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-mono font-bold text-slate-300 text-sm mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Quick Info
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Created",
                        value: new Date(experiment.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
                        icon: (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Last Updated",
                        value: new Date(experiment.updated_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
                        icon: (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ),
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className="mt-0.5 text-teal-500/60 shrink-0">{item.icon}</div>
                        <div>
                          <p className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.1em] mb-0.5">{item.label}</p>
                          <p className="font-mono text-xs text-slate-300">{item.value}</p>
                        </div>
                      </div>
                    ))}

                    {/* Role */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-teal-500/60 shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-slate-300 uppercase tracking-[0.1em] mb-0.5">Your Role</p>
                        <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${rs.bg} ${rs.text} ${rs.border}`}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {experiment.tags && (
                      <div>
                        <p className="font-mono text-[10px] text-slate-300 uppercase tracking-[0.1em] mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {experiment.tags.split(",").map((tag, i) => (
                            <span key={i} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF-only export info */}
                <div className="hidden pdf-only bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="font-mono text-xs text-slate-300">Exported: {new Date().toLocaleDateString()}</p>
                  <p className="font-mono text-xs text-slate-300">ID: EXP-{String(experiment.id).padStart(4, "0")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Change Logs Tab */}
          {activeTab === "changelogs" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-mono font-bold text-slate-100">Change History</h2>
                  <p className="font-mono text-[11px] text-slate-300">Full audit trail of all edits</p>
                </div>
              </div>
              <ChangeLogs experimentId={experiment.id} />
            </div>
          )}

          {/* Collaborators Tab */}
          {activeTab === "collaborators" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-mono font-bold text-slate-100">Collaborators</h2>
                  <p className="font-mono text-[11px] text-slate-300">Manage access and permissions</p>
                </div>
              </div>
              <Collaborators
                experiment={experiment}
                onCollaboratorUpdate={handleExperimentUpdate}
              />
            </div>
          )}

          {/* Viewer Mode Tab */}
          {activeTab === "viewer" && (
            <ViewerMode
              experiment={experiment}
              onExitViewerMode={() => setActiveTab("experiment")}
            />
          )}
        </div>

        {/* PDF Footer */}
        <div className="hidden pdf-only mt-8 pt-4 border-t border-slate-700 text-center">
          <p className="font-mono text-xs text-slate-300">Generated from LabNote — Digital Lab Notebook</p>
          <p className="font-mono text-xs text-slate-300">© {new Date().getFullYear()} — All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}