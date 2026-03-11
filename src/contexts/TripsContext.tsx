import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Trip, Booking, Address, TripInvitation } from "../types";
import ApiService from "../services/ApiService";
import { useAuth } from "./AuthContext";

interface TripsContextType {
  trips: Trip[];
  bookings: Booking[];
  addresses: Address[];
  invitations: TripInvitation[];
  loading: boolean;
  createTrip: (
    trip: Omit<Trip, "id" | "createdAt" | "updatedAt">
  ) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<Trip | null>;
  validateTrip: (tripId: string) => Promise<Trip | null>;
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

  // Invitations
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
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Track current user ID to prevent unnecessary reloads
  const currentUserIdRef = React.useRef<string | null>(null);
  const isLoadingRef = React.useRef(false);
  const hasLoadedOnceRef = React.useRef(false);

  const loadData = useCallback(async () => {
    if (!user || isLoadingRef.current) {
      setLoading(false);
      return;
    }

    isLoadingRef.current = true;

    try {
      setLoading(true);

      const [tripsData, bookingsData, addressesData] = await Promise.all([
        ApiService.getTrips(),
        ApiService.getBookings(),
        ApiService.getAddresses(),
      ]);

      // Mapper _id vers id et convertir les dates
      const mappedTrips = tripsData.map((trip) => ({
        ...trip,
        id: trip._id,
        _id: undefined,
        startDate: trip.startDate ? new Date(trip.startDate) : new Date(),
        endDate: trip.endDate ? new Date(trip.endDate) : new Date(),
        createdAt: trip.createdAt ? new Date(trip.createdAt) : new Date(),
        updatedAt: trip.updatedAt ? new Date(trip.updatedAt) : new Date(),
        status: trip.status || "validated",
        visibility: trip.visibility || (trip.isPublic ? "public" : "private"),
        stats: trip.stats || {
          totalBookings: 0,
          totalAddresses: 0,
          totalCollaborators: 0,
        },
        location: trip.location || {
          type: "Point",
          coordinates: [0, 0],
        },
        tags: trip.tags || [],
        collaborators: trip.collaborators
          ? trip.collaborators.map((collab: any) => {
              // Si le collaborateur est une chaîne, le convertir en objet
              if (typeof collab === "string") {
                return {
                  userId: collab,
                  role: "editor" as const,
                  joinedAt: new Date(),
                  permissions: {
                    canEdit: true,
                    canInvite: false,
                    canDelete: false,
                  },
                };
              }
              // Sinon, s'assurer que toutes les propriétés sont présentes
              return {
                userId: collab.userId || collab,
                role: collab.role || "editor",
                joinedAt: collab.joinedAt ? new Date(collab.joinedAt) : new Date(),
                permissions: collab.permissions || {
                  canEdit: true,
                  canInvite: false,
                  canDelete: false,
                },
                invitedBy: collab.invitedBy,
              };
            })
          : [],
      }));

      const mappedBookings = bookingsData.map((booking) => ({
        ...booking,
        id: booking._id,
        _id: undefined,
        date: booking.date ? new Date(booking.date) : new Date(),
        endDate: booking.endDate ? new Date(booking.endDate) : undefined,
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
      hasLoadedOnceRef.current = true;
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [user]);

  // Données via API backend - uniquement chargé si l'utilisateur est connecté
  useEffect(() => {
    const userId = user?.id || null;

    // Si déjà chargé et l'utilisateur n'a pas changé, ne rien faire
    if (hasLoadedOnceRef.current && currentUserIdRef.current === userId) {
      return;
    }

    // Update the ref
    currentUserIdRef.current = userId;

    if (user && !isLoadingRef.current) {
      loadData();
    } else {
      // Réinitialiser les données si l'utilisateur n'est pas connecté
      setTrips([]);
      setBookings([]);
      setAddresses([]);
      setInvitations([]);
      setLoading(false);
      hasLoadedOnceRef.current = false;
    }
  }, [user, loadData]);

  const createTrip = async (
    trip: Omit<Trip, "id" | "createdAt" | "updatedAt">
  ): Promise<Trip> => {
    try {
      const result = await ApiService.createTrip(trip);

      // Mapper les données MongoDB vers notre interface
      const mappedTrip: Trip = {
        id: result._id,
        title: result.title,
        description: result.description,
        destination: result.destination,
        startDate: new Date(result.startDate),
        endDate: new Date(result.endDate),
        ownerId: result.ownerId,
        collaborators: result.collaborators
          ? result.collaborators.map((collab: any) => {
              if (typeof collab === "string") {
                return {
                  userId: collab,
                  role: "editor" as const,
                  joinedAt: new Date(),
                  permissions: {
                    canEdit: true,
                    canInvite: false,
                    canDelete: false,
                  },
                };
              }
              return {
                userId: collab.userId || collab,
                role: collab.role || "editor",
                joinedAt: collab.joinedAt ? new Date(collab.joinedAt) : new Date(),
                permissions: collab.permissions || {
                  canEdit: true,
                  canInvite: false,
                  canDelete: false,
                },
                invitedBy: collab.invitedBy,
              };
            })
          : [],
        isPublic: result.isPublic,
        visibility: result.visibility || (result.isPublic ? "public" : "private"),
        status: result.status || "draft",
        stats: result.stats || {
          totalBookings: 0,
          totalAddresses: 0,
          totalCollaborators: 0,
        },
        location: result.location || {
          type: "Point",
          coordinates: [0, 0],
        },
        tags: result.tags || [],
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };

      setTrips((prev) => [...prev, mappedTrip]);
      return mappedTrip;
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
      // userId est récupéré depuis le token JWT côté backend
      const result = await ApiService.updateTrip(tripId, updates);

      // Mapper les données MongoDB vers notre interface
      const mappedTrip: Trip = {
        id: result._id,
        title: result.title,
        description: result.description,
        destination: result.destination,
        startDate: new Date(result.startDate),
        endDate: new Date(result.endDate),
        ownerId: result.ownerId,
        collaborators: result.collaborators
          ? result.collaborators.map((collab: any) => {
              if (typeof collab === "string") {
                return {
                  userId: collab,
                  role: "editor" as const,
                  joinedAt: new Date(),
                  permissions: {
                    canEdit: true,
                    canInvite: false,
                    canDelete: false,
                  },
                };
              }
              return {
                userId: collab.userId || collab,
                role: collab.role || "editor",
                joinedAt: collab.joinedAt ? new Date(collab.joinedAt) : new Date(),
                permissions: collab.permissions || {
                  canEdit: true,
                  canInvite: false,
                  canDelete: false,
                },
                invitedBy: collab.invitedBy,
              };
            })
          : [],
        isPublic: result.isPublic,
        visibility: result.visibility || (result.isPublic ? "public" : "private"),
        status: result.status || "draft",
        stats: result.stats || {
          totalBookings: 0,
          totalAddresses: 0,
          totalCollaborators: 0,
        },
        location: result.location || {
          type: "Point",
          coordinates: [0, 0],
        },
        tags: result.tags || [],
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };

      setTrips((prev) =>
        prev.map((trip) => (trip.id === tripId ? mappedTrip : trip))
      );
      return mappedTrip;
    } catch (error) {
      console.error("Error updating trip:", error);
      throw error;
    }
  };

  const validateTrip = async (tripId: string): Promise<Trip | null> => {
    try {
      const result = await updateTrip(tripId, { status: "validated" });
      return result;
    } catch (error) {
      console.error("Error validating trip:", error);
      throw error;
    }
  };

  const deleteTrip = async (tripId: string): Promise<boolean> => {
    try {
      // userId est récupéré depuis le token JWT côté backend
      await ApiService.deleteTrip(tripId);

      // Supprimer localement (les adresses sont indépendantes des voyages)
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      setBookings((prev) =>
        prev.filter((booking) => booking.tripId !== tripId)
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

      // Mapper les données MongoDB vers notre interface
      const mappedBooking: Booking = {
        id: result._id,
        tripId: result.tripId || "",
        type: result.type,
        title: result.title,
        description: result.description,
        date: new Date(result.date),
        endDate: result.endDate ? new Date(result.endDate) : undefined,
        time: result.time,
        address: result.address,
        confirmationNumber: result.confirmationNumber,
        price: result.price,
        currency: result.currency || "EUR",
        status: result.status || "pending",
        attachments: result.attachments || [],
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };

      setBookings((prev) => [...prev, mappedBooking]);
      return mappedBooking;
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
      const result = await ApiService.createAddress(address);
      const mappedAddress: Address = {
        id: result._id,
        type: result.type,
        name: result.name,
        address: result.address,
        city: result.city,
        country: result.country,
        phone: result.phone,
        website: result.website,
        notes: result.notes,
        createdAt: result.createdAt ? new Date(result.createdAt) : new Date(),
        updatedAt: result.updatedAt ? new Date(result.updatedAt) : new Date(),
      };
      setAddresses((prev) => [...prev, mappedAddress]);
      return mappedAddress;
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
      const result = await ApiService.updateAddress(addressId, updates);
      if (!result) {
        return null;
      }
      const mappedAddress: Address = {
        id: result._id,
        type: result.type,
        name: result.name,
        address: result.address,
        city: result.city,
        country: result.country,
        phone: result.phone,
        website: result.website,
        notes: result.notes,
        createdAt: result.createdAt ? new Date(result.createdAt) : new Date(),
        updatedAt: result.updatedAt ? new Date(result.updatedAt) : new Date(),
      };
      setAddresses((prev) =>
        prev.map((address) => (address.id === addressId ? mappedAddress : address))
      );
      return mappedAddress;
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

  const refreshData = useCallback(async (): Promise<void> => {
    await loadData();
  }, [loadData]);

  // ===== INVITATIONS METHODS =====

  const createInvitation = async (invitation: {
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

      // Mapper les données MongoDB vers notre interface
      const mappedInvitation: TripInvitation = {
        id: result._id,
        tripId: result.tripId,
        inviterId: result.inviterId,
        inviteeEmail: result.inviteeEmail,
        inviteePhone: result.inviteePhone,
        status: result.status,
        token: result.token,
        expiresAt: new Date(result.expiresAt),
        createdAt: new Date(result.createdAt),
      };

      setInvitations((prev) => [...prev, mappedInvitation]);
      return mappedInvitation;
    } catch (error) {
      console.error("Error creating invitation:", error);
      throw error;
    }
  };

  const getUserInvitations = async (
    email: string,
    status?: string
  ): Promise<any[]> => {
    try {
      const result = await ApiService.getUserInvitations(email, status);

      const mappedInvitations: any[] = result.map(
        (invitation: any) => ({
          id: invitation._id,
          tripId: invitation.tripId,
          inviterId: invitation.inviterId,
          inviteeEmail: invitation.inviteeEmail,
          status: invitation.status,
          token: invitation.token,
          expiresAt: new Date(invitation.expiresAt),
          createdAt: new Date(invitation.createdAt),
          trip: invitation.trip, // Conserver les infos du voyage
          inviter: invitation.inviter, // Conserver les infos de l'inviteur
        })
      );

      return mappedInvitations;
    } catch (error) {
      console.error("Error getting user invitations:", error);
      throw error;
    }
  };

  const getSentInvitations = async (
    userId: string,
    status?: string
  ): Promise<TripInvitation[]> => {
    try {
      const result = await ApiService.getSentInvitations(userId, status);

      const mappedInvitations: TripInvitation[] = result.map(
        (invitation: any) => ({
          id: invitation._id,
          tripId: invitation.tripId,
          inviterId: invitation.inviterId,
          inviteeEmail: invitation.inviteeEmail,
          status: invitation.status,
          token: invitation.token,
          expiresAt: new Date(invitation.expiresAt),
          createdAt: new Date(invitation.createdAt),
        })
      );

      return mappedInvitations;
    } catch (error) {
      console.error("Error getting sent invitations:", error);
      throw error;
    }
  };

  const respondToInvitation = async (
    token: string,
    action: "accept" | "decline",
    userId?: string
  ): Promise<boolean> => {
    try {
      const result = await ApiService.respondToInvitation(
        token,
        action,
        userId
      );

      if (result.success) {
        // Mettre à jour l'invitation locale
        setInvitations((prev) =>
          prev.map((invitation) =>
            invitation.token === token
              ? { ...invitation, status: result.status }
              : invitation
          )
        );

        // Si acceptée, rafraîchir les données pour mettre à jour les collaborateurs
        if (action === "accept") {
          await refreshData();
        }
      }

      return result.success;
    } catch (error) {
      console.error("Error responding to invitation:", error);
      throw error;
    }
  };

  const getInvitationByToken = async (token: string): Promise<any> => {
    try {
      const result = await ApiService.getInvitationByToken(token);

      // Mapper les données MongoDB vers notre interface
      const mappedInvitation = {
        id: result._id,
        tripId: result.tripId,
        inviterId: result.inviterId,
        inviteeEmail: result.inviteeEmail,
        status: result.status,
        token: result.token,
        expiresAt: new Date(result.expiresAt),
        createdAt: new Date(result.createdAt),
        permissions: result.permissions,
        trip: result.trip,
        inviter: result.inviter,
      };

      return mappedInvitation;
    } catch (error) {
      console.error("Error getting invitation by token:", error);
      throw error;
    }
  };

  const value: TripsContextType = {
    trips,
    bookings,
    addresses,
    invitations,
    loading,
    createTrip,
    updateTrip,
    validateTrip,
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
    createInvitation,
    getUserInvitations,
    getSentInvitations,
    respondToInvitation,
    getInvitationByToken,
  };

  return (
    <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
  );
};
