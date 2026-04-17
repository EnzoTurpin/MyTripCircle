import { request } from "./apiCore";

export type ReportReason = "inappropriate" | "spam" | "harassment" | "fake" | "other";

export const moderationApi = {
  reportUser: (userId: string, reason: ReportReason) =>
    request<{ success: boolean }>("/moderation/report", "POST", {
      targetType: "user",
      targetId: userId,
      reason,
    }),

  reportTrip: (tripId: string, reason: ReportReason) =>
    request<{ success: boolean }>("/moderation/report", "POST", {
      targetType: "trip",
      targetId: tripId,
      reason,
    }),

  blockUser: (userId: string) =>
    request<{ success: boolean }>(`/moderation/block/${userId}`, "POST"),

  unblockUser: (userId: string) =>
    request<{ success: boolean }>(`/moderation/block/${userId}`, "DELETE"),
};
