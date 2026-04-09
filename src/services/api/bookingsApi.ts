import { request } from "./apiCore";

export const bookingsApi = {
  getBookings: () => request<any[]>("/bookings"),

  getBookingById: (id: string) => request<any>(`/bookings/${id}`),

  getBookingsByTripId: (tripId: string) => request<any[]>(`/bookings/trip/${tripId}`),

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

  deleteBooking: (bookingId: string) => request<any>(`/bookings/${bookingId}`, "DELETE"),
};
