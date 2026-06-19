const AVATAR_COLORS = ['#6C5CE7', '#2D9CDB', '#F2994A', '#1ABC9C', '#E0529B', '#9B51E0'];

// Deterministic hash so the same member always gets the same color across
// the whole app, without needing to store a color per member.
export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
