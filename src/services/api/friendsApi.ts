import { FriendRequest, Friend, FriendSuggestion } from "../../types";
import { request } from "./apiCore";

export const friendsApi = {
  sendFriendRequest: (data: {
    recipientEmail?: string;
    recipientPhone?: string;
    recipientId?: string;
  }) => request<{ autoAccepted?: boolean }>("/friends/request", "POST", data),

  getFriendRequests: () => request<FriendRequest[]>("/friends/requests"),

  respondToFriendRequest: (requestId: string, action: "accept" | "decline") =>
    request<{ success: boolean }>(`/friends/requests/${requestId}`, "PUT", { action }),

  cancelFriendRequest: (requestId: string) =>
    request<{ success: boolean }>(`/friends/requests/${requestId}`, "DELETE"),

  getFriends: () => request<Friend[]>("/friends"),

  removeFriend: (friendId: string) =>
    request<{ success: boolean }>(`/friends/${friendId}`, "DELETE"),

  getFriendSuggestions: () => request<FriendSuggestion[]>("/friends/suggestions"),

  getFriendProfile: (friendId: string) => request<any>(`/friends/${friendId}/profile`),

  getFriendInviteLink: () =>
    request<{ token: string; link: string }>("/friends/invite-link", "POST"),

  getFriendInviteByToken: (token: string) =>
    request<{ userId: string; name: string; avatar: string | null }>(`/friends/invite-link/${token}`),

  acceptFriendInviteLink: (token: string) =>
    request<{ success: boolean }>(`/friends/invite-link/${token}/accept`, "POST"),
};
