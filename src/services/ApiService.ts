import { API_URLS } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FriendRequest, Friend, FriendSuggestion } from "../types";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

let workingUrl: string | null = null;

async function findWorkingUrl(): Promise<string> {
  if (workingUrl) return workingUrl;

  console.log("[ApiService] Starting to find working URL...");

  for (const url of API_URLS) {
    try {
      console.log(`[ApiService] Trying ${url}...`);
      const response = await fetch(`${url}/health`, {
        method: "GET",
      });
      if (response.ok) {
        workingUrl = url;
        console.log(`[ApiService] ✅ Success! Using URL: ${url}`);
        return url;
      } else {
        console.log(
          `[ApiService] ❌ ${url} returned status: ${response.status}`,
        );
      }
    } catch (error: any) {
      console.log(
        `[ApiService] ❌ Failed to connect to ${url}: ${
          error?.message ?? String(error)
        }`,
      );
    }
  }

  console.log("[ApiService] ❌ No working URL found!");
  throw new Error(
    "No working API URL found. Make sure the backend is running.",
  );
}

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: any,
): Promise<T> {
  const baseUrl = await findWorkingUrl();
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errText = await res.text();
    // If 401, clear token so the app forces re-login
    if (res.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    // Try to parse as JSON first (for structured errors like requiresOtp)
    try {
      const errJson = JSON.parse(errText);
      throw new Error(JSON.stringify(errJson));
    } catch {
      // If not JSON, throw plain text error
      throw new Error(errText || `HTTP ${res.status}`);
    }
  }
  return (await res.json()) as T;
}

export const ApiService = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<{
      success: boolean;
      token?: string;
      user?: any;
      requiresOtp?: boolean;
      userId?: string;
      error?: string;
    }>(
      "/users/login",
      "POST",
      data,
    ),

  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    request<{
      success: boolean;
      token?: string;
      user?: any;
      userId?: string;
      error?: string;
      requiresOtp?: boolean;
    }>("/users/register", "POST", data),

  loginWithGoogle: (data: { accessToken: string }) =>
    request<{ success: boolean; token?: string; user?: any; error?: string }>(
      "/users/google",
      "POST",
      data,
    ),

  loginWithApple: (data: {
    identityToken: string;
    email?: string;
    fullName?: { givenName?: string | null; familyName?: string | null } | null;
  }) =>
    request<{ success: boolean; token?: string; user?: any; error?: string }>(
      "/users/apple",
      "POST",
      data,
    ),

  getTrips: () => request<any[]>("/trips"),
  getTripById: (id: string) => request<any>(`/trips/${id}`),
  getBookings: () => request<any[]>("/bookings"),
  getBookingById: (id: string) => request<any>(`/bookings/${id}`),
  getBookingsByTripId: (tripId: string) =>
    request<any[]>(`/bookings/trip/${tripId}`),
  getAddresses: () => request<any[]>("/addresses"),
  getAddressesByTripId: (tripId: string) =>
    request<any[]>(`/addresses/trip/${tripId}`),
  getAddressById: (id: string) => request<any>(`/addresses/${id}`),

  // Trips CRUD
  createTrip: (trip: {
    title: string;
    description?: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    collaborators?: any[];
    isPublic?: boolean;
    visibility?: "private" | "friends" | "public";
    tags?: string[];
    stats?: {
      totalBookings: number;
      totalAddresses: number;
      totalCollaborators: number;
    };
    location?: {
      type: "Point";
      coordinates: [number, number];
    };
  }) => request<any>("/trips", "POST", trip),

  updateTrip: (
    tripId: string,
    updates: {
      title?: string;
      description?: string;
      destination?: string;
      startDate?: Date;
      endDate?: Date;
      isPublic?: boolean;
      visibility?: "private" | "friends" | "public";
      status?: "draft" | "validated";
      coverImage?: string;
      tags?: string[];
    },
  ) => request<any>(`/trips/${tripId}`, "PUT", updates),

  deleteTrip: (tripId: string) =>
    request<any>(`/trips/${tripId}`, "DELETE"),

  // Bookings CRUD
  createBooking: (booking: {
    tripId: string;
    type: "flight" | "train" | "hotel" | "restaurant" | "activity";
    title: string;
    description?: string;
    date: Date;
    endDate?: Date;
    time?: string;
    address?: string;
    confirmationNumber?: string;
    price?: number;
    currency?: string;
    status?: "confirmed" | "pending" | "cancelled";
    attachments?: string[];
  }) => request<any>("/bookings", "POST", booking),

  updateBooking: (
    bookingId: string,
    updates: {
      tripId?: string;
      type?: "flight" | "train" | "hotel" | "restaurant" | "activity";
      title?: string;
      description?: string;
      date?: Date;
      endDate?: Date;
      time?: string;
      address?: string;
      confirmationNumber?: string;
      price?: number;
      currency?: string;
      status?: "confirmed" | "pending" | "cancelled";
      attachments?: string[];
    },
  ) => request<any>(`/bookings/${bookingId}`, "PUT", updates),

  deleteBooking: (bookingId: string) =>
    request<any>(`/bookings/${bookingId}`, "DELETE"),

  // Invitations
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

  respondToInvitation: (
    token: string,
    action: "accept" | "decline",
    userId?: string,
  ) => request<any>(`/invitations/${token}`, "PUT", { action, userId }),

  getTripInvitationLink: (tripId: string, force = false) =>
    request<{ token: string; link: string }>(`/invitations/trip-link/${tripId}`, "POST", { force }),

  // Amis
  sendFriendRequest: (data: {
    recipientEmail?: string;
    recipientPhone?: string;
    recipientId?: string;
  }) => request<{ autoAccepted?: boolean }>("/friends/request", "POST", data),

  getFriendRequests: () => request<FriendRequest[]>("/friends/requests", "GET"),

  respondToFriendRequest: (requestId: string, action: "accept" | "decline") =>
    request<{ success: boolean }>(`/friends/requests/${requestId}`, "PUT", { action }),

  cancelFriendRequest: (requestId: string) =>
    request<{ success: boolean }>(`/friends/requests/${requestId}`, "DELETE"),

  getFriends: () => request<Friend[]>("/friends", "GET"),

  removeFriend: (friendId: string) => request<{ success: boolean }>(`/friends/${friendId}`, "DELETE"),

  getFriendSuggestions: () => request<FriendSuggestion[]>("/friends/suggestions", "GET"),

  getFriendProfile: (friendId: string) => request<any>(`/friends/${friendId}/profile`, "GET"),

  lookupUser: (params: { email?: string; phone?: string }) => {
    const qs = params.email ? `email=${encodeURIComponent(params.email)}` : `phone=${encodeURIComponent(params.phone!)}`;
    return request<any>(`/users/lookup?${qs}`, "GET");
  },

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

  requestPasswordReset: (email: string) =>
    request<{ success: boolean; message?: string }>(
      "/users/forgot-password",
      "POST",
      { email },
    ),

  verifyResetToken: (code: string) =>
    request<{ success: boolean; error?: string }>(`/users/verify-reset-token?code=${encodeURIComponent(code)}`, "GET"),

  resetPassword: (code: string, newPassword: string) =>
    request<{ success: boolean; token?: string; user?: any }>("/users/reset-password", "POST", {
      code,
      newPassword,
    }),

  verifyOtp: (data: { userId: string; otp: string }) =>
    request<{ success: boolean; token?: string; user?: any; error?: string }>(
      "/users/verify-otp",
      "POST",
      data,
    ),

  resendOtp: (userId: string) =>
    request<{ success: boolean }>("/users/resend-otp", "POST", { userId }),

  // Batch get users by IDs
  getUsersByIds: (ids: string[]) =>
    request<any[]>("/users/batch", "POST", { ids }),

  // Addresses CRUD
  createAddress: (address: {
    type: "hotel" | "restaurant" | "activity" | "transport" | "other";
    name: string;
    address: string;
    city: string;
    country: string;
    phone?: string;
    website?: string;
    notes?: string;
    rating?: number;
    tripId?: string;
  }) => request<any>("/addresses", "POST", address),

  updateAddress: (
    addressId: string,
    updates: {
      type?: "hotel" | "restaurant" | "activity" | "transport" | "other";
      name?: string;
      address?: string;
      city?: string;
      country?: string;
      phone?: string;
      website?: string;
      notes?: string;
      rating?: number;
    },
  ) => request<any>(`/addresses/${addressId}`, "PUT", updates),

  deleteAddress: (addressId: string) =>
    request<any>(`/addresses/${addressId}`, "DELETE"),

  // Subscription
  getSubscription: () => request<any>("/subscriptions/me"),

  validatePurchase: (data: {
    receiptData: string;
    platform: string;
    productId: string;
    transactionId?: string;
  }) => request<{ success: boolean; message?: string }>("/subscriptions/validate", "POST", data),

  cancelSubscription: () =>
    request<{ success: boolean; message?: string }>("/subscriptions/cancel", "POST"),

  // Gestion des membres d'un voyage
  removeTripCollaborator: (tripId: string, userId: string) =>
    request<{ success: boolean }>(`/trips/${tripId}/collaborators/${userId}`, "DELETE"),

  transferTripOwnership: (tripId: string, newOwnerId: string) =>
    request<{ success: boolean }>(`/trips/${tripId}/transfer-ownership`, "PUT", { newOwnerId }),

  cancelInvitation: (invitationId: string) =>
    request<{ success: boolean }>(`/invitations/${invitationId}`, "DELETE"),

  // Liens d'invitation ami
  getFriendInviteLink: () =>
    request<{ token: string; link: string }>("/friends/invite-link", "POST"),

  getFriendInviteByToken: (token: string) =>
    request<{ userId: string; name: string; avatar: string | null }>(`/friends/invite-link/${token}`),

  acceptFriendInviteLink: (token: string) =>
    request<{ success: boolean }>(`/friends/invite-link/${token}/accept`, "POST"),

  generateItinerary: (data: { city: string; days: number }) =>
    request<{ cached: boolean; itinerary: any }>("/itinerary/generate", "POST", data),
};

export default ApiService;