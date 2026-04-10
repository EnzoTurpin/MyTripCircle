import { Booking } from "../../types";

export const getTypeLabels = (t: (key: string) => string): Record<string, string> => ({
  flight:     t("bookings.typeLabels.flight"),
  hotel:      t("bookings.typeLabels.hotel"),
  train:      t("bookings.typeLabels.train"),
  restaurant: t("bookings.typeLabels.restaurant"),
  activity:   t("bookings.typeLabels.activity"),
});

export const TYPE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  flight:     { border: "#5A8FAA", bg: "#DCF0F5", text: "#5A8FAA" },
  hotel:      { border: "#6B8C5A", bg: "#E2EDD9", text: "#6B8C5A" },
  train:      { border: "#C4714A", bg: "#F5E5DC", text: "#C4714A" },
  restaurant: { border: "#C4714A", bg: "#F5E5DC", text: "#C4714A" },
  activity:   { border: "#8B70C0", bg: "#EDE8F5", text: "#8B70C0" },
};

export const STATUS_COLORS: Record<string, string> = {
  confirmed: "#6B8C5A",
  pending:   "#FF9500",
  cancelled: "#C04040",
};

export const STATUSES: Booking["status"][] = ["confirmed", "pending", "cancelled"];

export const statusLabel = (t: (key: string) => string, s: string): string =>
  t(`bookings.status.${s}`) || s;

export function getSafeDate(date: unknown): Date {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
}
