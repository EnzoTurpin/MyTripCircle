import { useCallback } from "react";
import { Trip, Booking } from "../types";
import ApiService from "../services/ApiService";
import { mapTripFromCreate } from "../utils/tripMappers";

interface TripsSetters {
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

export function useTripsApiTrips({ setTrips, setBookings }: TripsSetters) {
  const createTrip = useCallback(
    async (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">): Promise<Trip> => {
      try {
        const result = await ApiService.createTrip(trip);
        const mappedTrip = mapTripFromCreate(result);
        setTrips((prev) => [...prev, mappedTrip]);
        return mappedTrip;
      } catch (error) {
        console.error("Error creating trip:", error);
        throw error;
      }
    },
    [setTrips]
  );

  const updateTrip = useCallback(
    async (tripId: string, updates: Partial<Trip>): Promise<Trip | null> => {
      try {
        const result = await ApiService.updateTrip(tripId, updates);
        const mappedTrip = mapTripFromCreate(result);
        setTrips((prev) => prev.map((t) => (t.id === tripId ? mappedTrip : t)));
        return mappedTrip;
      } catch (error) {
        console.error("Error updating trip:", error);
        throw error;
      }
    },
    [setTrips]
  );

  const validateTrip = useCallback(
    async (tripId: string): Promise<Trip | null> => {
      try {
        return await updateTrip(tripId, { status: "validated" });
      } catch (error) {
        console.error("Error validating trip:", error);
        throw error;
      }
    },
    [updateTrip]
  );

  const deleteTrip = useCallback(
    async (tripId: string): Promise<boolean> => {
      try {
        await ApiService.deleteTrip(tripId);
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
        setBookings((prev) => prev.filter((b) => b.tripId !== tripId));
        return true;
      } catch (error) {
        console.error("Error deleting trip:", error);
        return false;
      }
    },
    [setTrips, setBookings]
  );

  return { createTrip, updateTrip, validateTrip, deleteTrip };
}
