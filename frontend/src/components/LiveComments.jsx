import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const roleStyles = {
  owner: "text-teal-400 bg-teal-500/10 border-teal-500/25",
  editor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
  viewer: "text-slate-400 bg-slate-700/40 border-slate-600/30",
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
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

export default function LiveComments({ experimentId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [likedIds, setLikedIds] = useState(new Set());
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const token = localStorage.getItem('token');
  const MAX_LENGTH = 500;
  const textareaRef = useRef(null);
  
  const {
    isConnected,
    typingUsers,
    sendComment,
    sendTyping,
    sendMessage
  } = useWebSocket(experimentId);

  // Set up global WebSocket handlers
  useEffect(() => {
    window.onNewComment = (newComment) => {
      setComments(prev => [newComment, ...prev]);
    };

    window.onEditComment = (editedComment) => {
      setComments(prev => 
        prev.map(c => c.id === editedComment.id ? editedComment : c)
      );
    };

    window.onDeleteComment = (commentId) => {
      setComments(prev => prev.filter(c => c.id !== commentId));
    };

    return () => {
      delete window.onNewComment;
      delete window.onEditComment;
      delete window.onDeleteComment;
    };
  }, []);

  // Fetch initial comments
  useEffect(() => {
    if (!experimentId || !token) return;
    
    fetch(`${API_BASE_URL}/api/experiments/${experimentId}/comments/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const commentsArray = Array.isArray(data) ? data : data.results || [];
        setComments(commentsArray);
      })
      .catch(err => {
        console.error("Failed to fetch comments:", err);
        setError("Failed to load comments.");
      });
  }, [experimentId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setError("");
    
    // Send via WebSocket
    sendComment(content);

    try {
      await fetch(`${API_BASE_URL}/api/experiments/${experimentId}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
    } catch (err) {
      console.error("Failed to save comment:", err);
      setError("Failed to save comment. It may not appear for others.");
    }
    
    setContent("");
    setIsSubmitting(false);
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    
    sendMessage({
      type: 'edit_comment',
      comment_id: editingId,
      content: editContent
    });
    
    try {
      await fetch(`${API_BASE_URL}/api/experiments/${experimentId}/comments/${editingId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
    
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    
    sendMessage({
      type: 'delete_comment',
      comment_id: commentId
    });
    
    try {
      await fetch(`${API_BASE_URL}/api/experiments/${experimentId}/comments/${commentId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleTyping = (e) => {
    setContent(e.target.value);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Send typing indicator
    sendTyping(true);
    
    // Set timeout to stop typing indicator
    setTypingTimeout(setTimeout(() => {
      sendTyping(false);
    }, 2000));
  };

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const typingUsersList = Object.entries(typingUsers)
    .filter(([_, data]) => data && data.username)
    .map(([userId, data]) => data.username);

  return (
    <div className="space-y-6">
      {/* Connection status */}
      {!isConnected && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
          <p className="font-mono text-xs text-amber-400 flex items-center gap-2">
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Reconnecting to live comments...
          </p>
        </div>
      )}

      {/* Compose */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
        <h3 className="font-mono font-bold text-sm text-slate-300 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
          </svg>
          Add a Comment
        </h3>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-mono text-xs text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTyping}
              onBlur={() => sendTyping(false)}
              placeholder="Share thoughts, observations, or questions about this experiment..."
              rows={4}
              required
              disabled={isSubmitting}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 resize-none transition-all duration-200 leading-relaxed disabled:opacity-50"
            />
            <div className={`absolute bottom-3 right-3 font-mono text-[10px] transition-colors ${content.length > MAX_LENGTH * 0.85 ? "text-amber-400" : "text-slate-600"}`}>
              {content.length}/{MAX_LENGTH}
            </div>
          </div>

          {/* Typing indicator */}
          {typingUsersList.length > 0 && (
            <div className="text-xs text-slate-500 animate-pulse">
              {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-slate-600 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Visible to all collaborators
              {isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/30 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-teal-500/20 hover:shadow-teal-400/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Discussion list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-sm text-slate-400 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Discussion
          </h3>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>

        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => {
              const userName = comment.user || comment.user_email || 'Anonymous';
              const initials = getUserInitials(userName);
              const avatarGrad = getAvatarColor(userName);
              const rs = roleStyles[comment.user_role?.toLowerCase()] || roleStyles.viewer;
              const liked = likedIds.has(comment.id);
              const isEditing = editingId === comment.id;

              if (isEditing) {
                return (
                  <div key={comment.id} className="bg-slate-900/60 border border-teal-500/30 rounded-2xl p-5">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500/60 mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-teal-500 text-slate-950 rounded-xl text-xs font-mono font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={comment.id}
                  className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 bg-gradient-to-br ${avatarGrad} rounded-xl flex items-center justify-center font-mono font-bold text-xs text-white shadow-md shrink-0`}>
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="font-mono font-bold text-sm text-slate-200 truncate">
                          {userName}
                        </span>
                        {comment.user_role && (
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${rs}`}>
                            {comment.user_role.charAt(0).toUpperCase() + comment.user_role.slice(1)}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-slate-600 ml-auto flex items-center gap-1 shrink-0">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => toggleLike(comment.id)}
                          className={`flex items-center gap-1.5 font-mono text-xs transition-colors duration-200 ${
                            liked ? "text-rose-400" : "text-slate-600 hover:text-rose-400"
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill={liked ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {liked ? "Liked" : "Like"}
                        </button>

                        {/* Edit/Delete buttons for own comments */}
                        {comment.user === localStorage.getItem('username') && (
                          <>
                            <button
                              onClick={() => handleEdit(comment)}
                              className="flex items-center gap-1.5 font-mono text-xs text-slate-600 hover:text-teal-400 transition-colors duration-200"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="flex items-center gap-1.5 font-mono text-xs text-slate-600 hover:text-red-400 transition-colors duration-200"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-mono font-bold text-slate-400 mb-1">No comments yet</h3>
            <p className="font-mono text-xs text-slate-600 text-center max-w-xs">
              Be the first to share observations or questions about this experiment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const API_BASE_URL = 'http://localhost:8000';