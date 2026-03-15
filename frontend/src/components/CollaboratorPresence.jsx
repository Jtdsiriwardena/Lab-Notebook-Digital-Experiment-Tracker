import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

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

function getUserInitials(user) {
  if (!user) return '?';
  const parts = user.split(' ');
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : user.charAt(0).toUpperCase();
}

export default function CollaboratorPresence({ experimentId }) {
  const { activeCollaborators, isConnected } = useWebSocket(experimentId);

  if (!isConnected && activeCollaborators.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Connection status dot */}
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="font-mono text-[10px] text-slate-500">
          {isConnected ? 'Live' : 'Reconnecting...'}
        </span>
      </div>

      {/* Active collaborators */}
      {activeCollaborators.length > 0 && (
        <div className="flex items-center -space-x-2">
          {activeCollaborators.map((collaborator) => {
            const color = getAvatarColor(collaborator.username);
            const initials = getUserInitials(collaborator.username);
            
            return (
              <div
                key={collaborator.user_id}
                className="group relative"
                title={`${collaborator.username} is viewing`}
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center font-mono font-bold text-xs text-white ring-2 ring-slate-800 hover:ring-teal-500/50 transition-all cursor-default`}>
                  {initials}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <p className="font-mono text-xs text-slate-300">
                    {collaborator.username}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Viewer count */}
      {activeCollaborators.length > 0 && (
        <span className="font-mono text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
          {activeCollaborators.length} {activeCollaborators.length === 1 ? 'viewer' : 'viewers'}
        </span>
      )}
    </div>
  );
}