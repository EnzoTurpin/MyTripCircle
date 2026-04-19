import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { Trip, Booking, Address, TripInvitation } from "../types";
import ApiService from "../services/ApiService";
import { useAuth } from "./AuthContext";
import { useTripsApi } from "../hooks/useTripsApi";
import { mapTrip, mapBooking, mapAddress } from "../utils/tripMappers";
import { CacheManager, CACHE_KEYS, CACHE_TTL } from "../utils/cacheManager";

type NewEntityFields = "id" | "createdAt" | "updatedAt";

interface TripsContextType {
  trips: Trip[];
  bookings: Booking[];
  addresses: Address[];
  invitations: TripInvitation[];
  loading: boolean;
  createTrip: (
    trip: Omit<Trip, NewEntityFields>
  ) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<Trip | null>;
  validateTrip: (tripId: string) => Promise<Trip | null>;
  deleteTrip: (tripId: string) => Promise<boolean>;
  getTripById: (tripId: string) => Trip | null;
  createBooking: (
    booking: Omit<Booking, NewEntityFields>
  ) => Promise<Booking>;
  updateBooking: (
    bookingId: string,
    updates: Partial<Booking>
  ) => Promise<Booking | null>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  getBookingsByTripId: (tripId: string) => Booking[];
  createAddress: (
    address: Omit<Address, NewEntityFields>
  ) => Promise<Address>;
  updateAddress: (
    addressId: string,
    updates: Partial<Address>
  ) => Promise<Address | null>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  getAddressesByTripId: (tripId: string) => Address[];
  refreshData: () => Promise<void>;
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
  }) => Promise<TripInvitation>;
  getUserInvitations: (
    email: string,
    status?: string
  ) => Promise<TripInvitation[]>;
  getSentInvitations: (
    userId: string,
    status?: string
  ) => Promise<TripInvitation[]>;
  respondToInvitation: (
    token: string,
    action: "accept" | "decline",
    userId?: string
  ) => Promise<boolean>;
  getInvitationByToken: (token: string) => Promise<any>;
  getTripInvitationLink: (tripId: string, force?: boolean) => Promise<{ token: string; link: string }>;
  cancelInvitation: (invitationId: string) => Promise<boolean>;
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
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserIdRef = React.useRef<string | null>(null);
  const isLoadingRef = React.useRef(false);
  const hasLoadedOnceRef = React.useRef(false);

  // Sync state mutations to cache automatically after any CRUD operation
  useEffect(() => {
    if (!hasLoadedOnceRef.current) return;
    CacheManager.set(CACHE_KEYS.TRIPS, trips, CACHE_TTL.TRIPS).catch(() => {});
  }, [trips]);

  useEffect(() => {
    if (!hasLoadedOnceRef.current) return;
    CacheManager.set(CACHE_KEYS.BOOKINGS, bookings, CACHE_TTL.BOOKINGS).catch(() => {});
  }, [bookings]);

  useEffect(() => {
    if (!hasLoadedOnceRef.current) return;
    CacheManager.set(CACHE_KEYS.ADDRESSES, addresses, CACHE_TTL.ADDRESSES).catch(() => {});
  }, [addresses]);

  const loadData = useCallback(async () => {
    if (!user || isLoadingRef.current) {
      setLoading(false);
      return;
    }

    isLoadingRef.current = true;

    // On first load: hydrate from cache instantly so the UI renders immediately
    if (!hasLoadedOnceRef.current) {
      const [cachedTrips, cachedBookings, cachedAddresses] = await Promise.all([
        CacheManager.getStale<Trip[]>(CACHE_KEYS.TRIPS),
        CacheManager.getStale<Booking[]>(CACHE_KEYS.BOOKINGS),
        CacheManager.getStale<Address[]>(CACHE_KEYS.ADDRESSES),
      ]);

      const hasCachedData = !!(cachedTrips || cachedBookings || cachedAddresses);
      if (cachedTrips) setTrips(cachedTrips);
      if (cachedBookings) setBookings(cachedBookings);
      if (cachedAddresses) setAddresses(cachedAddresses);

      // Show cached data immediately; keep spinner only if nothing in cache
      setLoading(!hasCachedData);
    }

    try {
      const [tripsData, bookingsData, addressesData] = await Promise.all([
        ApiService.getTrips(),
        ApiService.getBookings(),
        ApiService.getAddresses(),
      ]);

      // Mark as loaded BEFORE state updates so the cache-sync useEffects fire correctly
      hasLoadedOnceRef.current = true;
      setTrips(tripsData.map(mapTrip));
      setBookings(bookingsData.map(mapBooking));
      setAddresses(addressesData.map(mapAddress));
    } catch (error) {
      console.error("Error loading data:", error);
      // Keep showing whatever cached data was set above — user stays functional offline
      if (!hasLoadedOnceRef.current) {
        hasLoadedOnceRef.current = true;
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    // Auth still resolving from storage — don't touch the cache yet
    if (authLoading) return;

    const userId = user?.id || null;

    if (hasLoadedOnceRef.current && currentUserIdRef.current === userId) {
      return;
    }

    currentUserIdRef.current = userId;

    if (user && !isLoadingRef.current) {
      loadData();
    } else {
      // Auth is resolved and user is null → confirmed logout, safe to clear
      setTrips([]);
      setBookings([]);
      setAddresses([]);
      setInvitations([]);
      setLoading(false);
      hasLoadedOnceRef.current = false;
      Promise.all([
        CacheManager.invalidate(CACHE_KEYS.TRIPS),
        CacheManager.invalidate(CACHE_KEYS.BOOKINGS),
        CacheManager.invalidate(CACHE_KEYS.ADDRESSES),
      ]).catch(() => {});
    }
  }, [user, loadData, authLoading]);

  const refreshData = useCallback(async (): Promise<void> => {
    await loadData();
  }, [loadData]);

  const api = useTripsApi({
    setTrips,
    setBookings,
    setAddresses,
    setInvitations,
    refreshData,
  });

  const getTripById = (tripId: string): Trip | null =>
    trips.find((trip) => trip.id === tripId) || null;

  const getBookingsByTripId = (tripId: string): Booking[] =>
    bookings.filter((booking) => booking.tripId === tripId);

  const getAddressesByTripId = (tripId: string): Address[] =>
    addresses.filter((address) => address.tripId === tripId);

  const value: TripsContextType = useMemo(
    () => ({
      trips, bookings, addresses, invitations, loading,
      createTrip: api.createTrip, updateTrip: api.updateTrip,
      validateTrip: api.validateTrip, deleteTrip: api.deleteTrip,
      getTripById, createBooking: api.createBooking,
      updateBooking: api.updateBooking, deleteBooking: api.deleteBooking,
      getBookingsByTripId, createAddress: api.createAddress,
      updateAddress: api.updateAddress, deleteAddress: api.deleteAddress,
      getAddressesByTripId, refreshData,
      createInvitation: api.createInvitation,
      getUserInvitations: api.getUserInvitations,
      getSentInvitations: api.getSentInvitations,
      respondToInvitation: api.respondToInvitation,
      getInvitationByToken: api.getInvitationByToken,
      getTripInvitationLink: api.getTripInvitationLink,
      cancelInvitation: api.cancelInvitation,
    }),
    [trips, bookings, addresses, invitations, loading], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  );
};
