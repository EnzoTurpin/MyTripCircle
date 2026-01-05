import { API_URLS } from "../config/api";

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
          `[ApiService] ❌ ${url} returned status: ${response.status}`
        );
      }
    } catch (error) {
      console.log(
        `[ApiService] ❌ Failed to connect to ${url}: ${error.message}`
      );
    }
  }

  console.log("[ApiService] ❌ No working URL found!");
  throw new Error(
    "No working API URL found. Make sure the backend is running."
  );
}

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: any
): Promise<T> {
  const baseUrl = await findWorkingUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const ApiService = {
  getTrips: () => request<any[]>("/trips"),
  getTripById: (id: string) => request<any>(`/trips/${id}`),
  getBookings: () => request<any[]>("/bookings"),
  getBookingsByTripId: (tripId: string) =>
    request<any[]>(`/bookings/trip/${tripId}`),
  getAddresses: () => request<any[]>("/addresses"),
  getAddressesByTripId: (tripId: string) =>
    request<any[]>(`/addresses/trip/${tripId}`),

  // AUTH

  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => request<{ success: boolean; userId: string }>("/users/register", "POST", data),

  verifyOtp: (data: {
    userId: string;
    otp: string;
  }) => request<{ success: boolean; user: any; token: string }>("/users/verify-otp", "POST", data),

  login: (data: {
    email: string;
    password: string;
  }) => request<{ success: boolean; user: any; token: string }>("/users/login", "POST", data),


  // Trips CRUD
  createTrip: (trip: {
    title: string;
    description?: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    ownerId: string;
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
      userId: string;
    }
  ) => request<any>(`/trips/${tripId}`, "PUT", updates),

  deleteTrip: (tripId: string, userId: string) =>
    request<any>(`/trips/${tripId}`, "DELETE", { userId }),

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
    }
  ) => request<any>(`/bookings/${bookingId}`, "PUT", updates),

  deleteBooking: (bookingId: string) =>
    request<any>(`/bookings/${bookingId}`, "DELETE"),

  // Invitations
  createInvitation: (invitation: {
    tripId: string;
    inviterId: string;
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

  respondToInvitation: (
    token: string,
    action: "accept" | "decline",
    userId?: string
  ) => request<any>(`/invitations/${token}`, "PUT", { action, userId }),
};

export default ApiService;
