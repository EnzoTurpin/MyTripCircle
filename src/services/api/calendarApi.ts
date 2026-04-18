import { request } from "./apiCore";

export const calendarApi = {
  getToken: () =>
    request<{ success: boolean; token: string | null }>("/users/calendar/token", "GET"),

  generateToken: () =>
    request<{ success: boolean; token: string }>("/users/calendar/token", "POST"),

  revokeToken: () =>
    request<{ success: boolean }>("/users/calendar/token", "DELETE"),
};
