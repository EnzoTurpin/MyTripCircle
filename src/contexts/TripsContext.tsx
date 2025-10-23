import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Trip, Booking, Address } from "../types";
import ApiService from "../services/ApiService";

interface TripsContextType {
  trips: Trip[];
  bookings: Booking[];
  addresses: Address[];
  loading: boolean;
  createTrip: (
    trip: Omit<Trip, "id" | "createdAt" | "updatedAt">
  ) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<Trip | null>;
  deleteTrip: (tripId: string) => Promise<boolean>;
  getTripById: (tripId: string) => Trip | null;
  createBooking: (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => Promise<Booking>;
  updateBooking: (
    bookingId: string,
    updates: Partial<Booking>
  ) => Promise<Booking | null>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  getBookingsByTripId: (tripId: string) => Booking[];
  createAddress: (
    address: Omit<Address, "id" | "createdAt" | "updatedAt">
  ) => Promise<Address>;
  updateAddress: (
    addressId: string,
    updates: Partial<Address>
  ) => Promise<Address | null>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  getAddressesByTripId: (tripId: string) => Address[];
  refreshData: () => Promise<void>;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error("useTrips must be used within a TripsProvider");
  }
  return context;
};

interface TripsProviderProps {
  children: ReactNode;
}

export const TripsProvider: React.FC<TripsProviderProps> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Données via API backend

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Petit délai pour s'assurer que le backend est prêt
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const [tripsData, bookingsData, addressesData] = await Promise.all([
        ApiService.getTrips(),
        ApiService.getBookings(),
        ApiService.getAddresses(),
      ]);

      // Mapper _id vers id et convertir les dates
      const mappedTrips = tripsData.map((trip) => {
        console.log("[TripsContext] Raw trip data:", {
          _id: trip._id,
          startDate: trip.startDate,
          endDate: trip.endDate,
          startDateType: typeof trip.startDate,
          endDateType: typeof trip.endDate,
        });

        return {
          ...trip,
          id: trip._id,
          _id: undefined,
          startDate: trip.startDate ? new Date(trip.startDate) : new Date(),
          endDate: trip.endDate ? new Date(trip.endDate) : new Date(),
          createdAt: trip.createdAt ? new Date(trip.createdAt) : new Date(),
          updatedAt: trip.updatedAt ? new Date(trip.updatedAt) : new Date(),
        };
      });

      const mappedBookings = bookingsData.map((booking) => ({
        ...booking,
        id: booking._id,
        _id: undefined,
        date: booking.date ? new Date(booking.date) : new Date(),
        createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date(),
      }));

      const mappedAddresses = addressesData.map((address) => ({
        ...address,
        id: address._id,
        _id: undefined,
        createdAt: address.createdAt ? new Date(address.createdAt) : new Date(),
        updatedAt: address.updatedAt ? new Date(address.updatedAt) : new Date(),
      }));

      setTrips(mappedTrips);
      setBookings(mappedBookings);
      setAddresses(mappedAddresses);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (
    trip: Omit<Trip, "id" | "createdAt" | "updatedAt">
  ): Promise<Trip> => {
    try {
      // Backend POST non implémenté ici; on met à jour localement
      const newTrip = {
        ...(trip as any),
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Trip;
      setTrips((prev) => [...prev, newTrip]);
      return newTrip;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  };

  const updateTrip = async (
    tripId: string,
    updates: Partial<Trip>
  ): Promise<Trip | null> => {
    try {
      // TODO: appeler backend PUT /trips/:id
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId ? { ...trip, ...updates } : trip
        )
      );
      return trips.find((t) => t.id === tripId) || null;
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  };

  const deleteTrip = async (tripId: string): Promise<boolean> => {
    try {
      // TODO: appeler backend DELETE /trips/:id
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      setBookings((prev) =>
        prev.filter((booking) => booking.tripId !== tripId)
      );
      setAddresses((prev) =>
        prev.filter((address) => address.tripId !== tripId)
      );
      return true;
    } catch (error) {
      console.error("Error deleting trip:", error);
      return false;
    }
  };

  const getTripById = (tripId: string): Trip | null => {
    return trips.find((trip) => trip.id === tripId) || null;
  };

  const createBooking = async (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ): Promise<Booking> => {
    try {
      // TODO: POST /bookings
      const newBooking = {
        ...(booking as any),
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Booking;
      setBookings((prev) => [...prev, newBooking]);
      return newBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  };

  const updateBooking = async (
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<Booking | null> => {
    try {
      // TODO: PUT /bookings/:id
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
        )
      );
      return bookings.find((b) => b.id === bookingId) || null;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  };

  const deleteBooking = async (bookingId: string): Promise<boolean> => {
    try {
      // TODO: DELETE /bookings/:id
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      return true;
    } catch (error) {
      console.error("Error deleting booking:", error);
      return false;
    }
  };

  const getBookingsByTripId = (tripId: string): Booking[] => {
    return bookings.filter((booking) => booking.tripId === tripId);
  };

  const createAddress = async (
    address: Omit<Address, "id" | "createdAt" | "updatedAt">
  ): Promise<Address> => {
    try {
      // TODO: POST /addresses
      const newAddress = {
        ...(address as any),
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Address;
      setAddresses((prev) => [...prev, newAddress]);
      return newAddress;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  };

  const updateAddress = async (
    addressId: string,
    updates: Partial<Address>
  ): Promise<Address | null> => {
    try {
      // TODO: PUT /addresses/:id
      setAddresses((prev) =>
        prev.map((address) =>
          address.id === addressId ? { ...address, ...updates } : address
        )
      );
      return addresses.find((a) => a.id === addressId) || null;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    try {
      // TODO: DELETE /addresses/:id
      setAddresses((prev) =>
        prev.filter((address) => address.id !== addressId)
      );
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  };

  const getAddressesByTripId = (tripId: string): Address[] => {
    return addresses.filter((address) => address.tripId === tripId);
  };

  const refreshData = async (): Promise<void> => {
    await loadData();
  };

  const value: TripsContextType = {
    trips,
    bookings,
    addresses,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingsByTripId,
    createAddress,
    updateAddress,
    deleteAddress,
    getAddressesByTripId,
    refreshData,
  };

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  );
};
