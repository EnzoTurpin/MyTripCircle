import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Trip, Booking, Address } from "../types";
import DataService from "../services/DataService";

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

  const dataService = DataService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, bookingsData, addressesData] = await Promise.all([
        dataService.getTrips(),
        dataService.getBookings(),
        dataService.getAddresses(),
      ]);
      setTrips(tripsData);
      setBookings(bookingsData);
      setAddresses(addressesData);
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
      const newTrip = await dataService.createTrip(trip);
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
      const updatedTrip = await dataService.updateTrip(tripId, updates);
      if (updatedTrip) {
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? updatedTrip : trip))
        );
      }
      return updatedTrip;
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  };

  const deleteTrip = async (tripId: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteTrip(tripId);
      if (success) {
        setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
        setBookings((prev) =>
          prev.filter((booking) => booking.tripId !== tripId)
        );
        setAddresses((prev) =>
          prev.filter((address) => address.tripId !== tripId)
        );
      }
      return success;
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
      const newBooking = await dataService.createBooking(booking);
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
      const updatedBooking = await dataService.updateBooking(
        bookingId,
        updates
      );
      if (updatedBooking) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? updatedBooking : booking
          )
        );
      }
      return updatedBooking;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  };

  const deleteBooking = async (bookingId: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteBooking(bookingId);
      if (success) {
        setBookings((prev) =>
          prev.filter((booking) => booking.id !== bookingId)
        );
      }
      return success;
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
      const newAddress = await dataService.createAddress(address);
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
      const updatedAddress = await dataService.updateAddress(
        addressId,
        updates
      );
      if (updatedAddress) {
        setAddresses((prev) =>
          prev.map((address) =>
            address.id === addressId ? updatedAddress : address
          )
        );
      }
      return updatedAddress;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteAddress(addressId);
      if (success) {
        setAddresses((prev) =>
          prev.filter((address) => address.id !== addressId)
        );
      }
      return success;
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
