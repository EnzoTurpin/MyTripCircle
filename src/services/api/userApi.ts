import { request } from "./apiCore";

export interface ConsentPayload {
  data: true;
  location: boolean;
  notifications: boolean;
}

export const userApi = {
  updateConsent: (consents: ConsentPayload) =>
    request<{ success: boolean }>("/users/consent", "POST", {
      consents,
      version: "1.0",
      source: "mobile",
    }),

  updateProfile: (data: { name: string; email: string }) =>
    request<{ success: boolean; user: any }>("/users/me", "PUT", data),

  updateSettings: (data: { isPublicProfile: boolean }) =>
    request<{ success: boolean; user: any }>("/users/settings", "PUT", data),

  uploadAvatar: (avatar: string) =>
    request<{ success: boolean; user: any }>("/users/avatar", "PUT", { avatar }),

  updateLanguage: (language: "en" | "fr") =>
    request<{ success: boolean; language: string }>("/users/language", "PUT", { language }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean }>("/users/change-password", "PUT", data),

  deleteAccount: () => request<{ success: boolean }>("/users/me", "DELETE"),

  registerPushToken: (token: string) =>
    request<{ success: boolean }>("/users/push-token", "POST", { token, platform: "expo" }),
};
