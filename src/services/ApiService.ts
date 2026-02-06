import { API_URLS } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { updateProfile } from "../controllers/userController";

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
    }>("/users/register", "POST", data),

  getTrips: () => request<any[]>("/trips"),
  getTripById: (id: string) => request<any>(`/trips/${id}`),
  getBookings: () => request<any[]>("/bookings"),
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
    inviteeEmail: string;
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

  getSentInvitations: (userId: string, status?: string) => {
    const query = status ? `?status=${status}` : "";
    return request<any[]>(`/invitations/sent/${userId}${query}`);
  },

  getInvitationByToken: (token: string) =>
    request<any>(`/invitations/token/${token}`),

  respondToInvitation: (
    token: string,
    action: "accept" | "decline",
    userId?: string,
  ) => request<any>(`/invitations/${token}`, "PUT", { action, userId }),

  updateProfile: (data: { name: string; email: string }) =>
    request<{ success: boolean; user: any }>("/users/me", "PUT", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean }>("/users/change-password", "PUT", data),

  requestPasswordReset: (email: string) =>
    request<{ success: boolean; message?: string }>(
      "/users/forgot-password",
      "POST",
      { email },
    ),

  resetPassword: (token: string, newPassword: string) =>
    request<{ success: boolean }>("/users/reset-password", "POST", {
      token,
      newPassword,
    }),

  verifyOtp: (data: { userId: string; otp: string }) =>
    request<{ success: boolean; token?: string; user?: any; error?: string }>(
      "/users/verify-otp",
      "POST",
      data,
    ),

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
    },
  ) => request<any>(`/addresses/${addressId}`, "PUT", updates),
};

export default ApiService;
