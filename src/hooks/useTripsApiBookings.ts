import { useCallback } from "react";
import { Booking } from "../types";
import ApiService from "../services/ApiService";
import { mapBooking } from "../utils/tripMappers";

interface BookingsSetters {
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

export function useTripsApiBookings({ setBookings }: BookingsSetters) {
  const createBooking = useCallback(
    async (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> => {
      try {
        const result = await ApiService.createBooking({
          tripId: booking.tripId || "",
          type: booking.type,
          title: booking.title,
          description: booking.description,
          date: booking.date,
          endDate: booking.endDate,
          time: booking.time,
          address: booking.address,
          confirmationNumber: booking.confirmationNumber,
          price: booking.price,
          currency: booking.currency || "EUR",
          status: booking.status || "pending",
          attachments: booking.attachments || [],
        });
        const mappedBooking = mapBooking(result);
        setBookings((prev) => [...prev, mappedBooking]);
        return mappedBooking;
      } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
      }
    },
    [setBookings]
  );

  const updateBooking = useCallback(
    async (bookingId: string, updates: Partial<Booking>): Promise<Booking | null> => {
      try {
        const updated = await ApiService.updateBooking(bookingId, updates);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId || (b as Booking & { _id?: string })._id === bookingId
              ? { ...b, ...updated }
              : b
          )
        );
        return updated;
      } catch (error) {
        console.error("Error updating booking:", error);
        throw error;
      }
    },
    [setBookings]
  );

  const deleteBooking = useCallback(
    async (bookingId: string): Promise<boolean> => {
      try {
        await ApiService.deleteBooking(bookingId);
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        return true;
      } catch (error) {
        console.error("Error deleting booking:", error);
        return false;
      }
    },
    [setBookings]
  );

  return { createBooking, updateBooking, deleteBooking };
}
