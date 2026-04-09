import { request } from "./apiCore";

export const invitationsApi = {
  createInvitation: (invitation: {
    tripId: string;
    inviteeEmail?: string;
    inviteePhone?: string;
    message?: string;
    permissions?: {
      role: "viewer" | "editor";
      canEdit: boolean;
      canInvite: boolean;
      canDelete: boolean;
    };
  }) => request<any>("/invitations", "POST", invitation),

  getUserInvitations: (email: string, status?: string) => {
    const query = status ? `?status=${status}` : "";
    return request<any[]>(`/invitations/user/${email}${query}`);
  },

  getSentInvitations: (_userId: string, status?: string) => {
    const query = status ? `?status=${status}` : "";
    return request<any[]>(`/invitations/sent${query}`);
  },

  getInvitationByToken: (token: string) =>
    request<any>(`/invitations/token/${token}`),

  respondToInvitation: (token: string, action: "accept" | "decline", userId?: string) =>
    request<any>(`/invitations/${token}`, "PUT", { action, userId }),

  getTripInvitationLink: (tripId: string, force = false) =>
    request<{ token: string; link: string }>(`/invitations/trip-link/${tripId}`, "POST", { force }),

  cancelInvitation: (invitationId: string) =>
    request<{ success: boolean }>(`/invitations/${invitationId}`, "DELETE"),
};
