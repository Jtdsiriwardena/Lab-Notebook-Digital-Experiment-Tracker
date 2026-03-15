import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ── Helpers

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMin  = Math.floor((now - date) / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay  = Math.floor(diffHour / 24);
  if (diffMin  < 1)  return 'Just now';
  if (diffMin  < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay  < 7)  return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const roleStyles = {
  owner:     "text-teal-400   bg-teal-500/10   border-teal-500/25",
  editor:    "text-cyan-400   bg-cyan-500/10   border-cyan-500/25",
  admin:     "text-rose-400   bg-rose-500/10   border-rose-500/25",
  moderator: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  viewer:    "text-slate-400  bg-slate-700/40  border-slate-600/30",
};

// Colour-coded dot per field type
function FieldDot({ fieldName }) {
  const f = fieldName?.toLowerCase() || '';
  let cls = 'bg-slate-600';
  if (f.includes('name') || f.includes('title'))   cls = 'bg-teal-400';
  else if (f.includes('status') || f.includes('state')) cls = 'bg-cyan-400';
  else if (f.includes('date')  || f.includes('time'))  cls = 'bg-amber-400';
  else if (f.includes('objective'))                  cls = 'bg-violet-400';
  else if (f.includes('procedure'))                  cls = 'bg-blue-400';
  else if (f.includes('result'))                     cls = 'bg-emerald-400';
  return <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cls}`} />;
}

// Truncate long values
function truncate(str, len = 80) {
  if (!str) return 'empty';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// ── Skeleton loader
function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-start gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
      <div className="w-2 h-2 bg-slate-700 rounded-full mt-2 shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="h-3 bg-slate-700 rounded w-24" />
          <div className="h-3 bg-slate-800 rounded w-16" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 bg-slate-800 rounded-lg w-32" />
          <div className="h-3 bg-slate-700 rounded w-4" />
          <div className="h-6 bg-slate-800 rounded-lg w-32" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-slate-800 rounded-full w-6" />
          <div className="h-3 bg-slate-700 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

// ── Main component
export default function ChangeLogs({ experimentId }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [expanded, setExpanded] = useState(new Set());

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE_URL}/api/experiments/${experimentId}/change-logs/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.logs)
        ? res.data.logs
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch change logs:', err);
      setError(err.response?.data?.message || 'Failed to fetch change logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [experimentId]);

  useEffect(() => {
    if (experimentId) fetchLogs();
  }, [experimentId, fetchLogs]);

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Loading
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  // ── Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-14 bg-slate-900/40 border border-red-500/15 rounded-2xl text-center px-6">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-mono font-bold text-slate-300 mb-1">Failed to Load</h3>
        <p className="font-mono text-xs text-slate-500 mb-5 max-w-xs">{error}</p>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 font-mono text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-teal-500/20"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    );
  }

  // ── Empty
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl text-center px-6">
        <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-mono font-bold text-slate-400 mb-1">No Changes Yet</h3>
        <p className="font-mono text-xs text-slate-600 max-w-xs">
          When edits are made to this experiment, the full audit trail will appear here.
        </p>
      </div>
    );
  }

  // ── Log lis
  return (
    <div className="space-y-3">
      {/* Count badge */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] text-slate-600 uppercase tracking-[0.15em]">
          Audit Trail
        </span>
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
          {logs.length} {logs.length === 1 ? 'change' : 'changes'}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-teal-500/30 via-slate-700 to-transparent" />

        <div className="space-y-3">
          {logs.map((log, idx) => {
            const isExpanded = expanded.has(log.id ?? idx);
            const rs = roleStyles[log.edited_by_role?.toLowerCase()] || roleStyles.viewer;
            const fieldLabel = log.field_name?.replace(/_/g, ' ') || 'Unknown Field';

            return (
              <div
                key={log.id ?? idx}
                className="group relative flex items-start gap-4 pl-1"
              >
                {/* Timeline dot */}
                <div className="relative z-10 mt-1 shrink-0">
                  <FieldDot fieldName={log.field_name} />
                </div>

                {/* Card */}
                <div className="flex-1 min-w-0 bg-slate-900/60 border border-slate-800 group-hover:border-slate-700 rounded-2xl p-4 transition-all duration-200">

                  {/* Top row: field + timestamp */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-slate-200 capitalize">
                        {fieldLabel}
                      </span>
                      <span className="font-mono text-[10px] text-slate-600 border border-slate-800 px-2 py-0.5 rounded-full bg-slate-800/50">
                        FIELD EDIT
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600 shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span title={formatFullDate(log.timestamp)}>
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Diff: old → new */}
                  <div className="flex items-start gap-2 mb-3 flex-wrap">
                    <div className="flex-1 min-w-0 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                      <p className="font-mono text-[9px] text-red-500/70 uppercase tracking-[0.12em] mb-1">Before</p>
                      <p className="font-mono text-xs text-red-300 break-words leading-relaxed">
                        {truncate(log.old_value)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center shrink-0 mt-3">
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 bg-teal-500/8 border border-teal-500/20 rounded-xl px-3 py-2">
                      <p className="font-mono text-[9px] text-teal-500/70 uppercase tracking-[0.12em] mb-1">After</p>
                      <p className="font-mono text-xs text-teal-300 break-words leading-relaxed">
                        {truncate(log.new_value)}
                      </p>
                    </div>
                  </div>

                  {/* Edited by */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center font-mono font-bold text-[9px] text-slate-950 shrink-0">
                        {(log.edited_by || 'U')[0].toUpperCase()}
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        {log.edited_by || 'Unknown User'}
                      </span>
                      {log.edited_by_role && (
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${rs}`}>
                          {log.edited_by_role.charAt(0).toUpperCase() + log.edited_by_role.slice(1)}
                        </span>
                      )}
                    </div>

                    {/* Expand toggle if values are long */}
                    {((log.old_value?.length ?? 0) > 80 || (log.new_value?.length ?? 0) > 80) && (
                      <button
                        onClick={() => toggleExpand(log.id ?? idx)}
                        className="font-mono text-[10px] text-slate-600 hover:text-teal-400 transition-colors flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                            Collapse
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            Show full
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded full diff */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 gap-3">
                      <div className="bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
                        <p className="font-mono text-[9px] text-red-500/70 uppercase tracking-[0.12em] mb-1.5">Full — Before</p>
                        <p className="font-mono text-xs text-red-300 whitespace-pre-wrap leading-relaxed break-words">
                          {log.old_value || 'empty'}
                        </p>
                      </div>
                      <div className="bg-teal-500/5 border border-teal-500/15 rounded-xl px-4 py-3">
                        <p className="font-mono text-[9px] text-teal-500/70 uppercase tracking-[0.12em] mb-1.5">Full — After</p>
                        <p className="font-mono text-xs text-teal-300 whitespace-pre-wrap leading-relaxed break-words">
                          {log.new_value || 'empty'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}