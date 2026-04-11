import { request } from "./apiCore";

export const tripsApi = {
  getTrips: () => request<any[]>("/trips"),

  getTripById: (id: string) => request<any>(`/trips/${id}`),

  createTrip: (trip: {
    title: string;
    description?: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    collaborators?: any[];
    isPublic?: boolean;
    visibility?: "private" | "friends" | "public";
    coverImage?: string;
    tags?: string[];
    stats?: { totalBookings: number; totalAddresses: number; totalCollaborators: number };
    location?: { type: "Point"; coordinates: [number, number] };
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

  deleteTrip: (tripId: string) => request<any>(`/trips/${tripId}`, "DELETE"),

  removeTripCollaborator: (tripId: string, userId: string) =>
    request<{ success: boolean }>(`/trips/${tripId}/collaborators/${userId}`, "DELETE"),

  transferTripOwnership: (tripId: string, newOwnerId: string) =>
    request<{ success: boolean }>(`/trips/${tripId}/transfer-ownership`, "PUT", { newOwnerId }),
};
