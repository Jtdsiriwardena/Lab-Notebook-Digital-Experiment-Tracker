import { useState } from "react";
import api from "../api/axios";

const roleStyles = {
  owner:  { badge: "text-teal-400 bg-teal-500/10 border-teal-500/25",  avatar: "from-teal-500 to-cyan-600"   },
  editor: { badge: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",  avatar: "from-cyan-500 to-blue-600"   },
  viewer: { badge: "text-slate-400 bg-slate-700/40 border-slate-600/30", avatar: "from-slate-500 to-slate-600" },
};

const roleDescriptions = {
  viewer: "Can read and comment only",
  editor: "Can edit all experiment fields",
};

function getAvatarGrad(email = "") {
  const gradients = [
    "from-teal-500 to-cyan-600",
    "from-violet-500 to-purple-600",
    "from-amber-400 to-orange-500",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-blue-500 to-indigo-600",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function Collaborators({ experiment, onCollaboratorUpdate }) {
  const [collabEmail, setCollabEmail]     = useState("");
  const [collabRole, setCollabRole]       = useState("viewer");
  const [collabError, setCollabError]     = useState("");
  const [collabSuccess, setCollabSuccess] = useState("");
  const [isAdding, setIsAdding]           = useState(false);
  const [removingId, setRemovingId]       = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // user_id to confirm

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    setCollabError("");
    setCollabSuccess("");
    setIsAdding(true);
    try {
      await api.post(`/experiments/${experiment.id}/collaborators/`, {
        email: collabEmail,
        role: collabRole,
      });
      setCollabSuccess("Collaborator added successfully!");
      setCollabEmail("");
      setCollabRole("viewer");
      setTimeout(() => setCollabSuccess(""), 3000);
      const res = await api.get(`/experiments/${experiment.id}/`);
      onCollaboratorUpdate?.(res.data);
    } catch (err) {
      setCollabError(err.response?.data?.detail || "Error adding collaborator.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    setRemovingId(userId);
    try {
      await api.delete(`/experiments/${experiment.id}/collaborators/${userId}/remove/`);
      const res = await api.get(`/experiments/${experiment.id}/`);
      onCollaboratorUpdate?.(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
      setConfirmRemove(null);
    }
  };

  const collaborators = experiment.collaborators || [];

  return (
    <div className="space-y-5">

      {/* ── Confirm remove modal ── */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setConfirmRemove(null)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
              </svg>
            </div>
            <h3 className="font-mono font-bold text-slate-100 text-center mb-2">Remove Collaborator?</h3>
            <p className="font-mono text-xs text-slate-400 text-center mb-6">
              They will lose access to this experiment immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 font-mono text-sm text-slate-400 border border-slate-700 hover:border-slate-600 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveCollaborator(confirmRemove)}
                disabled={removingId === confirmRemove}
                className="flex-1 font-mono text-sm font-bold bg-red-500/90 hover:bg-red-500 text-white py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {removingId === confirmRemove ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Collaborator list ── */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-sm text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Current Members
          </h3>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
            {collaborators.length} {collaborators.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {collaborators.length > 0 ? (
          <div className="space-y-2">
            {collaborators.map((col) => {
              const rs = roleStyles[col.role?.toLowerCase()] || roleStyles.viewer;
              const avatarGrad = getAvatarGrad(col.user_email);
              const isCurrentUser = col.user_id === experiment.current_user;
              const isOwner = col.role?.toLowerCase() === "owner";

              return (
                <div
                  key={col.user_id}
                  className="group flex items-center justify-between px-4 py-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`w-9 h-9 bg-gradient-to-br ${avatarGrad} rounded-xl flex items-center justify-center font-mono font-bold text-sm text-white shadow-md shrink-0`}>
                      {(col.user_email || 'U').charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-sm text-slate-200 truncate">
                          {col.user_email}
                        </p>
                        {isCurrentUser && (
                          <span className="font-mono text-[9px] text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full border mt-1 ${rs.badge}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {col.role?.charAt(0).toUpperCase() + col.role?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Remove button — not for current user or owner */}
                  {!isCurrentUser && !isOwner && experiment.current_user_role === "owner" && (
                    <button
                      onClick={() => setConfirmRemove(col.user_id)}
                      disabled={removingId === col.user_id}
                      className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 shrink-0"
                      title="Remove collaborator"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 border border-slate-800 border-dashed rounded-xl text-center">
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-mono text-xs text-slate-500">No collaborators yet</p>
            <p className="font-mono text-[10px] text-slate-700 mt-1">Invite someone below to get started</p>
          </div>
        )}
      </div>

      {/* ── Add collaborator form ── */}
      {experiment.current_user_role === "owner" && (
        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-mono font-bold text-sm text-slate-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Invite Collaborator
          </h3>

          {/* Alerts */}
          {collabError && (
            <div className="mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-mono text-xs text-red-400">{collabError}</p>
            </div>
          )}
          {collabSuccess && (
            <div className="mb-4 flex items-start gap-2 bg-teal-500/10 border border-teal-500/25 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-mono text-xs text-teal-400">{collabSuccess}</p>
            </div>
          )}

          <form onSubmit={handleAddCollaborator} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-mono text-xs text-slate-500 uppercase tracking-[0.12em] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="colleague@institution.edu"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block font-mono text-xs text-slate-500 uppercase tracking-[0.12em] mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["viewer", "editor"].map((role) => {
                  const rs = roleStyles[role];
                  const selected = collabRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setCollabRole(role)}
                      className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border font-mono text-sm transition-all duration-200 ${
                        selected
                          ? `${rs.badge} shadow-md`
                          : "text-slate-500 border-slate-700 bg-slate-800/40 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? "border-current" : "border-slate-600"
                        }`}>
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                        <span className="font-bold capitalize">{role}</span>
                      </div>
                      <span className={`text-[10px] pl-5 ${selected ? "opacity-70" : "text-slate-600"}`}>
                        {roleDescriptions[role]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isAdding}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-sm py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-400/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isAdding ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Send Invitation
                </>
              )}
            </button>
          </form>

          {/* Info note */}
          <p className="mt-4 font-mono text-[10px] text-slate-700 flex items-start gap-1.5">
            <svg className="w-3 h-3 shrink-0 mt-0.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            The collaborator must already have a LabNote account registered with this email.
          </p>
        </div>
      )}
    </div>
  );
}