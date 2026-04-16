import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList, Trip, Booking, Address } from "../types";
import { useTrips } from "../contexts/TripsContext";
import ApiService from "../services/ApiService";
import { parseApiError } from "../utils/i18n";

type NavigationProp = StackNavigationProp<RootStackParamList, "TripDetails">;

export function useTripData(tripId: string) {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { validateTrip, createBooking, createAddress, bookings: allBookings, addresses: allAddresses } = useTrips();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

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

  const handleAddBooking = () => {
    if (!trip) return;
    setShowBookingForm(true);
  };

  const handleSaveBooking = async (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newBooking = await createBooking({ ...booking, tripId });
      setBookings((prev) => [...prev, newBooking]);
      setShowBookingForm(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert(t("common.error"), parseApiError(error) || t("tripDetails.createBookingError"));
    }
  };

  const handleAddAddress = () => {
    navigation.navigate("AddressForm", { tripId });
  };

  const handleEditAddress = (address: Address) => {
    navigation.navigate("AddressDetails", { addressId: address.id });
  };

  const handleCopyBooking = async (booking: Booking) => {
    try {
      const { id, createdAt, updatedAt, attachments, ...data } = booking;
      const newBooking = await createBooking({ ...data, tripId });
      setBookings((prev) => [...prev, newBooking]);
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error) || t("tripDetails.createBookingError"));
    }
  };

  const handleCopyAddress = async (address: Address) => {
    try {
      const { id, createdAt, updatedAt, ...data } = address;
      const newAddress = await createAddress({ ...data, tripId });
      setAddresses((prev) => [...prev, newAddress]);
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error));
    }
  };

  const handleValidateTrip = async () => {
    Alert.alert(t("tripDetails.validateTrip"), t("tripDetails.validateTripMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.validate"),
        style: "default",
        onPress: async () => {
          try {
            const validatedTrip = await validateTrip(tripId);
            if (validatedTrip) {
              setTrip(validatedTrip);
              Alert.alert(
                t("tripDetails.tripValidated"),
                t("tripDetails.tripValidatedMessage"),
                [
                  {
                    text: t("common.ok"),
                    onPress: () => {
                      (navigation as any).reset({ index: 0, routes: [{ name: "Main" }] });
                    },
                  },
                ],
              );
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
    ]);
  };

  // Éléments d'autres voyages disponibles pour copie
  const otherBookings = allBookings.filter((b) => b.tripId !== tripId);
  const otherAddresses = allAddresses.filter((a) => a.tripId !== tripId);

  return {
    trip,
    bookings,
    addresses,
    loading,
    showBookingForm,
    setShowBookingForm,
    loadTripData,
    handleAddBooking,
    handleSaveBooking,
    handleCopyBooking,
    handleCopyAddress,
    handleAddAddress,
    handleEditAddress,
    handleValidateTrip,
    otherBookings,
    otherAddresses,
  };
}
