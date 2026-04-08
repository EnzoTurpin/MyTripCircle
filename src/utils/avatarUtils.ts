export const AVATAR_COLORS = ["#C4714A", "#5A8FAA", "#8B70C0", "#6B8C5A", "#C0A040"];

export function getInitials(name: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + (parts.at(-1)?.charAt(0) ?? "")).toUpperCase();
}

export function getAvatarColor(name: string): string {
  if (!name?.trim()) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (name.codePointAt(i) ?? 0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
