import i18n from "./i18n";

export const timeAgo = (raw: string): string => {
  const diff = Date.now() - new Date(raw).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return i18n.t("notifications.timeAgo.justNow");
  if (m < 60) return i18n.t("notifications.timeAgo.minutes", { count: m });
  const h = Math.floor(m / 60);
  if (h < 24) return i18n.t("notifications.timeAgo.hours", { count: h });
  const d = Math.floor(h / 24);
  if (d === 1) return i18n.t("notifications.timeAgo.yesterday");
  return i18n.t("notifications.timeAgo.days", { count: d });
};

export const iconForStatus = (status: string): { emoji: string; bg: string } => {
  if (status === "accepted") return { emoji: "✅", bg: "#E2EDD9" };
  if (status === "declined") return { emoji: "❌", bg: "#FDEAEA" };
  return { emoji: "✈️", bg: "#F5E5DC" };
};

export const titleForInvitation = (inv: any): string => {
  const inviter = inv.inviterName ?? inv.inviter?.name ?? i18n.t("invitation.someoneRef");
  if (inv.status === "accepted") return i18n.t("notifications.inviteAccepted", { inviter });
  if (inv.status === "declined") return i18n.t("notifications.inviteDeclined", { inviter });
  return i18n.t("notifications.inviteReceived", { inviter });
};

export const subtitleForInvitation = (inv: any, date: string): string => {
  const trip = inv.tripName ?? inv.trip?.title ?? inv.trip?.name ?? "";
  return trip ? `${trip} · ${date}` : date;
};
