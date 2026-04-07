import { useCallback } from "react";
import { Trip, Booking, Address, TripInvitation } from "../types";
import ApiService from "../services/ApiService";
import {
  mapTrip,
  mapTripFromCreate,
  mapBooking,
  mapAddress,
  mapInvitation,
  mapInvitationWithExtras,
} from "../utils/tripMappers";

interface TripsApiSetters {
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  setInvitations: React.Dispatch<React.SetStateAction<TripInvitation[]>>;
  refreshData: () => Promise<void>;
}

export function useTripsApi(setters: TripsApiSetters) {
  const { setTrips, setBookings, setAddresses, setInvitations, refreshData } = setters;

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
            b.id === bookingId || (b as any)._id === bookingId
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
        throw error;
      }
    },
    [setBookings]
  );

  const createAddress = useCallback(
    async (address: Omit<Address, "id" | "createdAt" | "updatedAt">): Promise<Address> => {
      try {
        const result = await ApiService.createAddress(address);
        const mappedAddress = mapAddress(result);
        setAddresses((prev) => [...prev, mappedAddress]);
        return mappedAddress;
      } catch (error) {
        console.error("Error creating address:", error);
        throw error;
      }
    },
    [setAddresses]
  );

  const updateAddress = useCallback(
    async (addressId: string, updates: Partial<Address>): Promise<Address | null> => {
      try {
        const result = await ApiService.updateAddress(addressId, updates);
        if (!result) return null;
        const mappedAddress = mapAddress(result);
        setAddresses((prev) =>
          prev.map((a) => (a.id === addressId ? mappedAddress : a))
        );
        return mappedAddress;
      } catch (error) {
        console.error("Error updating address:", error);
        throw error;
      }
    },
    [setAddresses]
  );

  const deleteAddress = useCallback(
    async (addressId: string): Promise<boolean> => {
      try {
        await ApiService.deleteAddress(addressId);
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        return true;
      } catch (error) {
        console.error("Error deleting address:", error);
        throw error;
      }
    },
    [setAddresses]
  );

  const createInvitation = useCallback(
    async (invitation: {
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
    }): Promise<TripInvitation> => {
      try {
        const result = await ApiService.createInvitation(invitation);
        const mappedInvitation = mapInvitation(result);
        setInvitations((prev) => [...prev, mappedInvitation]);
        return mappedInvitation;
      } catch (error) {
        console.error("Error creating invitation:", error);
        throw error;
      }
    },
    [setInvitations]
  );

  const getUserInvitations = useCallback(
    async (email: string, status?: string): Promise<any[]> => {
      try {
        const result = await ApiService.getUserInvitations(email, status);
        return result.map((inv: any) => ({
          ...mapInvitation(inv),
          trip: inv.trip,
          inviter: inv.inviter,
        }));
      } catch (error) {
        console.error("Error getting user invitations:", error);
        throw error;
      }
    },
    []
  );

  const getSentInvitations = useCallback(
    async (userId: string, status?: string): Promise<TripInvitation[]> => {
      try {
        const result = await ApiService.getSentInvitations(userId, status);
        return result.map((inv: any) => mapInvitation(inv));
      } catch (error) {
        console.error("Error getting sent invitations:", error);
        throw error;
      }
    },
    []
  );

  const respondToInvitation = useCallback(
    async (token: string, action: "accept" | "decline", userId?: string): Promise<boolean> => {
      try {
        const result = await ApiService.respondToInvitation(token, action, userId);
        if (result.success) {
          setInvitations((prev) =>
            prev.map((inv) =>
              inv.token === token ? { ...inv, status: result.status } : inv
            )
          );
          if (action === "accept") {
            await refreshData();
          }
        }
        return result.success;
      } catch (error) {
        console.error("Error responding to invitation:", error);
        throw error;
      }
    },
    [setInvitations, refreshData]
  );

  const getInvitationByToken = useCallback(async (token: string): Promise<any> => {
    try {
      const result = await ApiService.getInvitationByToken(token);
      return mapInvitationWithExtras(result);
    } catch (error) {
      console.error("Error getting invitation by token:", error);
      throw error;
    }
  }, []);

  const getTripInvitationLink = useCallback(
    async (tripId: string, force = false): Promise<{ token: string; link: string }> => {
      try {
        return await ApiService.getTripInvitationLink(tripId, force);
      } catch (error) {
        console.error("Error getting trip invitation link:", error);
        throw error;
      }
    },
    []
  );

  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    try {
      const result = await ApiService.cancelInvitation(invitationId);
      return result.success;
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      throw error;
    }
  }, []);

  return {
    createTrip,
    updateTrip,
    validateTrip,
    deleteTrip,
    createBooking,
    updateBooking,
    deleteBooking,
    createAddress,
    updateAddress,
    deleteAddress,
    createInvitation,
    getUserInvitations,
    getSentInvitations,
    respondToInvitation,
    getInvitationByToken,
    getTripInvitationLink,
    cancelInvitation,
  };
}
