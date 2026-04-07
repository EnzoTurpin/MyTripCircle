import i18n from "./i18n";

export type TabKey = "all" | "pending" | "sent";

export function getBannerGradient(seed: string): readonly [string, string] {
  const palettes: readonly (readonly [string, string])[] = [
    ["#5A8FAA", "#2A5F7F"],
    ["#C4714A", "#8B4513"],
    ["#6B8C5A", "#3D5C2A"],
    ["#8B70C0", "#5C3D90"],
    ["#C0A040", "#8B7020"],
  ] as const;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xff;
  return palettes[h % palettes.length];
}

export function formatRelative(raw: string | Date): string {
  const diff = Date.now() - new Date(raw).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return i18n.t("invitation.timeAgoJustNow");
  const h = Math.floor(m / 60);
  if (h < 24) return i18n.t("invitation.timeAgoHours", { count: h });
  const d = Math.floor(h / 24);
  if (d < 7) return i18n.t("invitation.timeAgoDays", { count: d });
  if (d < 30) return i18n.t("invitation.timeAgoWeeks", { count: Math.floor(d / 7) });
  return i18n.t("invitation.timeAgoMonths", { count: Math.floor(d / 30) });
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  const locale = i18n.language === "fr" ? "fr-FR" : "en-US";
  const s = new Date(start);
  const e = new Date(end);
  const sFmt = s.toLocaleDateString(locale, { day: "numeric", month: "short" });
  const eFmt = e.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  return `${sFmt} – ${eFmt}`;
}

export function tripDuration(start: string | Date, end: string | Date): number {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
}
