import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const roleStyles = {
  owner:  "text-teal-400 bg-teal-500/10 border-teal-500/25",
  editor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
  viewer: "text-slate-400 bg-slate-700/40 border-slate-600/30",
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffInMinutes < 1)    return 'Just now';
  if (diffInMinutes < 60)   return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getUserInitials(user) {
  if (!user) return 'A';
  const parts = user.split(' ');
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : user.charAt(0).toUpperCase();
}

//avatar colour from username
const avatarColors = [
  "from-teal-500 to-cyan-600",
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-blue-500 to-indigo-600",
];
function getAvatarColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function CommentsSection({ experimentId }) {
  const [comments, setComments]       = useState([]);
  const [content, setContent]         = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState("");
  const [likedIds, setLikedIds]       = useState(new Set());

  const token = localStorage.getItem('token');
  const MAX_LENGTH = 500;

  useEffect(() => {
    if (!experimentId || !token) return;
    axios
      .get(`${API_BASE_URL}/api/experiments/${experimentId}/comments/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
          ? res.data.results
          : [];
        setComments(data);
      })
      .catch((err) => {
        console.error("Failed to fetch comments:", err);
        setComments([]);
        setError("Failed to load comments.");
      });
  }, [experimentId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !token) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/experiments/${experimentId}/comments/`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setContent("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">

      {/* ── Compose ── */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
        <h3 className="font-mono font-bold text-sm text-slate-300 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
          </svg>
          Add a Comment
        </h3>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-mono text-xs text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="Share thoughts, observations, or questions about this experiment..."
              rows={4}
              required
              disabled={isSubmitting}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 resize-none transition-all duration-200 leading-relaxed disabled:opacity-50"
            />
            {/* Character counter */}
            <div className={`absolute bottom-3 right-3 font-mono text-[10px] transition-colors ${content.length > MAX_LENGTH * 0.85 ? "text-amber-400" : "text-slate-600"}`}>
              {content.length}/{MAX_LENGTH}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-slate-300 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Visible to all collaborators
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/30 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-teal-500/20 hover:shadow-teal-400/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Discussion list ── */}
      <div className="space-y-4">
        {/* List header */}
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-sm text-slate-400 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Discussion
          </h3>
          <span className="font-mono text-[10px] text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>

        {/* Comments */}
        {Array.isArray(comments) && comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment, idx) => {
              const userName = comment.user || comment.user_email || 'Anonymous';
              const initials = getUserInitials(userName);
              const avatarGrad = getAvatarColor(userName);
              const rs = roleStyles[comment.user_role?.toLowerCase()] || roleStyles.viewer;
              const liked = likedIds.has(comment.id);

              return (
                <div
                  key={comment.id}
                  className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-9 h-9 bg-gradient-to-br ${avatarGrad} rounded-xl flex items-center justify-center font-mono font-bold text-xs text-white shadow-md shrink-0`}>
                      {initials}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="font-mono font-bold text-sm text-slate-200 truncate">
                          {userName}
                        </span>
                        {comment.user_role && (
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${rs}`}>
                            {comment.user_role.charAt(0).toUpperCase() + comment.user_role.slice(1)}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-400 ml-auto flex items-center gap-1 shrink-0">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => toggleLike(comment.id)}
                          className={`flex items-center gap-1.5 font-mono text-xs transition-colors duration-200 ${
                            liked ? "text-rose-400" : "text-slate-300 hover:text-rose-400"
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill={liked ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {liked ? "Liked" : "Like"}
                        </button>

                        <button className="flex items-center gap-1.5 font-mono text-xs text-slate-300 hover:text-teal-400 transition-colors duration-200">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Reply
                        </button>

                        {/* Separator dot */}
                        <span className="text-slate-400 text-xs">·</span>

                        <span className="font-mono text-[10px] text-slate-400">
                          EXP thread
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-14 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-mono font-bold text-slate-300 mb-1">No comments yet</h3>
            <p className="font-mono text-xs text-slate-400 text-center max-w-xs">
              Be the first to share observations or questions about this experiment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}