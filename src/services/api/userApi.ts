import { request } from "./apiCore";

export const userApi = {
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
};
