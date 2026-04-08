import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, Animated } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList, Trip, Booking, Address, Collaborator } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import { parseApiError } from "../utils/i18n";

type NavigationProp = StackNavigationProp<RootStackParamList, "TripDetails">;

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useTripDetails(tripId: string, showToastParam?: boolean) {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { validateTrip, createBooking, createAddress, updateAddress } = useTrips();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "addresses" | "members">("bookings");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const [collaboratorUsers, setCollaboratorUsers] = useState<Map<string, any>>(new Map());
  const [showToast, setShowToast] = useState(false);
  const [countdown, setCountdown] = useState<CountdownValue | null>(null);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOwner = trip && user ? trip.ownerId === user.id : false;
  const userCollaborator = trip?.collaborators?.find((c: Collaborator) => c.userId === user?.id);
  const canInvite = isOwner || userCollaborator?.permissions?.canInvite;
  const totalMembers = trip ? trip.collaborators.length + 1 : 0;
  const totalBudget = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const progressPercent = (() => {
    if (!trip) return 0;
    const now = Date.now();
    const start = new Date(trip.startDate).getTime();
    const end = new Date(trip.endDate).getTime();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  })();

  const durationDays = trip
    ? Math.round(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const daysPassed = trip
    ? Math.max(
        0,
        Math.min(
          durationDays,
          Math.round(
            (Date.now() - new Date(trip.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
      )
    : 0;

  useEffect(() => {
    if (!trip) return;
    const loadCollaboratorInfo = async () => {
      const idsToFetch = new Set<string>();
      if (trip.collaborators) {
        trip.collaborators.forEach((c: Collaborator) => {
          if (c.userId !== user?.id) idsToFetch.add(c.userId);
          if (c.invitedBy && c.invitedBy !== user?.id) idsToFetch.add(c.invitedBy);
        });
      }
      if (trip.ownerId && trip.ownerId !== user?.id) idsToFetch.add(trip.ownerId);
      if (idsToFetch.size === 0) return;
      try {
        const users = await ApiService.getUsersByIds(Array.from(idsToFetch));
        const usersMap = new Map();
        users.forEach((u: any) => { usersMap.set(u._id?.toString() || u.id, u); });
        setCollaboratorUsers(usersMap);
      } catch (error) {
        console.error("Error loading collaborator info:", error);
      }
    };
    loadCollaboratorInfo();
  }, [trip, user]);

  useEffect(() => {
    if (!trip) return;
    const updateCountdown = () => {
      const now = Date.now();
      const start = new Date(trip.startDate).getTime();
      const diff = start - now;
      if (diff <= 0) {
        setCountdown(null);
        if (countdownRef.current) clearInterval(countdownRef.current);
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [trip?.startDate]);

  useFocusEffect(
    useCallback(() => {
      loadTripData();
      if (showToastParam) {
        displayToast();
      }
    }, [tripId, showToastParam]),
  );

  const loadTripData = async () => {
    try {
      setLoading(true);
      const [tripData, bookingsData, addressesData] = await Promise.all([
        ApiService.getTripById(tripId),
        ApiService.getBookingsByTripId(tripId).catch(() => []),
        ApiService.getAddressesByTripId(tripId).catch(() => []),
      ]);

      const mappedTrip: Trip = {
        id: tripData._id,
        title: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        startDate: new Date(tripData.startDate),
        endDate: new Date(tripData.endDate),
        ownerId: tripData.ownerId,
        collaborators: tripData.collaborators?.map((collab: any) => {
          if (typeof collab === "string") {
            return {
              userId: collab,
              role: "editor" as const,
              joinedAt: new Date(),
              permissions: { canEdit: true, canInvite: false, canDelete: false },
            };
          }
          return {
            userId: collab.userId || collab,
            role: collab.role || "editor",
            joinedAt: collab.joinedAt ? new Date(collab.joinedAt) : new Date(),
            permissions: collab.permissions || { canEdit: true, canInvite: false, canDelete: false },
            invitedBy: collab.invitedBy,
          };
        }) || [],
        isPublic: tripData.isPublic,
        visibility: tripData.visibility || (tripData.isPublic ? "public" : "private"),
        status: tripData.status || "draft",
        stats: tripData.stats || { totalBookings: 0, totalAddresses: 0, totalCollaborators: 0 },
        location: tripData.location || { type: "Point", coordinates: [0, 0] },
        tags: tripData.tags || [],
        createdAt: new Date(tripData.createdAt),
        updatedAt: new Date(tripData.updatedAt),
      };

      const mappedBookings: Booking[] = bookingsData.map((booking: any) => ({
        id: booking._id,
        tripId: booking.tripId,
        type: booking.type,
        title: booking.title,
        description: booking.description,
        date: new Date(booking.date),
        endDate: booking.endDate ? new Date(booking.endDate) : undefined,
        time: booking.time,
        address: booking.address,
        confirmationNumber: booking.confirmationNumber,
        price: booking.price,
        currency: booking.currency,
        status: booking.status,
        attachments: booking.attachments,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt),
      }));

      const mappedAddresses: Address[] = addressesData.map((address: any) => ({
        id: address._id,
        type: address.type,
        name: address.name,
        address: address.address,
        city: address.city,
        country: address.country,
        phone: address.phone,
        website: address.website,
        notes: address.notes,
        tripId: address.tripId,
        userId: address.userId,
        createdAt: new Date(address.createdAt),
        updatedAt: new Date(address.updatedAt),
      }));

      setTrip(mappedTrip);
      setBookings(mappedBookings);
      setAddresses(mappedAddresses);
    } catch (error) {
      console.error("Error loading trip data:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayToast = () => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setShowToast(false));
  };

  const handleInviteFriends = () => { navigation.navigate("InviteFriends", { tripId }); };

  const handleAddBooking = () => { if (!trip) { return; } setShowBookingForm(true); };

  const handleSaveBooking = async (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newBooking = await createBooking({ ...booking, tripId });
      setBookings((prev) => [...prev, newBooking]);
      setShowBookingForm(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert(
        t("common.error"),
        parseApiError(error) || t("tripDetails.createBookingError"),
      );
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (addressData: Omit<Address, "id" | "createdAt" | "updatedAt">) => {
    if (editingAddress) {
      const updated = await updateAddress(editingAddress.id, addressData);
      if (updated) {
        setAddresses((prev) => prev.map((a) => (a.id === editingAddress.id ? updated : a)));
      }
    } else {
      const newAddress = await createAddress({ ...addressData, tripId });
      setAddresses((prev) => [...prev, newAddress]);
    }
  };

  const handleValidateTrip = async () => {
    Alert.alert(
      t("tripDetails.validateTrip"),
      t("tripDetails.validateTripMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.validate"),
          style: "default",
          onPress: async () => {
            try {
              const validatedTrip = await validateTrip(tripId);
              if (validatedTrip) {
                setTrip(validatedTrip);
                Alert.alert(t("tripDetails.tripValidated"), t("tripDetails.tripValidatedMessage"), [
                  {
                    text: t("common.ok"),
                    onPress: () => {
                      (navigation as any).reset({ index: 0, routes: [{ name: "Main" }] });
                    },
                  },
                ]);
              }
            } catch (error) {
              console.error("Error validating trip:", error);
              Alert.alert(
                t("common.error"),
                parseApiError(error) || t("tripDetails.validateError"),
              );
            }
          },
        },
      ],
    );
  };

  return {
    trip,
    bookings,
    addresses,
    loading,
    activeTab,
    setActiveTab,
    showBookingForm,
    setShowBookingForm,
    showAddressForm,
    setShowAddressForm,
    editingAddress,
    setEditingAddress,
    collaboratorUsers,
    showToast,
    setShowToast,
    toastOpacity,
    countdown,
    isOwner,
    userCollaborator,
    canInvite,
    totalMembers,
    totalBudget,
    progressPercent,
    durationDays,
    daysPassed,
    handleInviteFriends,
    handleAddBooking,
    handleSaveBooking,
    handleAddAddress,
    handleEditAddress,
    handleSaveAddress,
    handleValidateTrip,
  };
}
