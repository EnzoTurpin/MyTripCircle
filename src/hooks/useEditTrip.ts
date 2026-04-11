import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList, Booking } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { parseApiError } from "../utils/i18n";
import ApiService from "../services/ApiService";
import useCalendarPicker, { UseCalendarPickerReturn } from "./useCalendarPicker";
import useTripBookings, { UseTripBookingsReturn } from "./useTripBookings";
import { fetchDestinationPhotoUrl } from "../utils/destinationPhoto";

type EditTripRouteProp = RouteProp<RootStackParamList, "EditTrip">;
type EditTripNavigationProp = StackNavigationProp<RootStackParamList, "EditTrip">;

function parseVisibility(
  val: string | undefined,
  isPublic?: boolean,
): "private" | "friends" | "public" {
  if (val === "friends") return "friends";
  if (val === "public" || isPublic) return "public";
  return "private";
}

export interface EditTripFormData {
  title:       string;
  description: string;
  destination: string;
  startDate:   Date;
  endDate:     Date;
  visibility:  "private" | "friends" | "public";
  status:      "draft" | "validated";
  coverImage:  string;
}

export type UseEditTripReturn = {
  formData: EditTripFormData;
  setFormData: React.Dispatch<React.SetStateAction<EditTripFormData>>;
  loading: boolean;
  initialLoading: boolean;
  isOwner: boolean;
  handlePickCoverPhoto: () => Promise<void>;
  handleUpdateTrip: () => Promise<void>;
  handleDeleteTrip: () => void;
  handleCancel: () => void;
} & UseCalendarPickerReturn & UseTripBookingsReturn;

const useEditTrip = (): UseEditTripReturn => {
  const route      = useRoute<EditTripRouteProp>();
  const navigation = useNavigation<EditTripNavigationProp>();
  const { tripId } = route.params;

  const { updateTrip, deleteTrip, createBooking, updateBooking, deleteBooking } = useTrips();
  const { user } = useAuth();
  const { t }    = useTranslation();

  const [formData, setFormData] = useState<EditTripFormData>({
    title:       "",
    description: "",
    destination: "",
    startDate:   new Date(),
    endDate:     new Date(),
    visibility:  "private",
    status:      "draft",
    coverImage:  "",
  });
  const [loading,        setLoading]        = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isOwner,        setIsOwner]        = useState(false);
  // true si l'utilisateur a choisi manuellement une photo (ne pas écraser)
  const isManualCover = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calendar = useCalendarPicker({
    startDate: formData.startDate,
    endDate:   formData.endDate,
    onDatesChange: (start, end) => setFormData((p) => ({ ...p, startDate: start, endDate: end })),
  });

  const bookingsState = useTripBookings({
    tripId,
    createBooking,
    updateBooking,
    deleteBooking,
    t,
  });

  // ── Auto-fetch photo si destination change et pas de photo manuelle ─────────
  useEffect(() => {
    if (isManualCover.current) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (formData.destination.trim().length < 3) return;

    debounceTimer.current = setTimeout(async () => {
      if (isManualCover.current || formData.coverImage) return;
      const url = await fetchDestinationPhotoUrl(formData.destination);
      if (url && !isManualCover.current) {
        setFormData((p) => ({ ...p, coverImage: url }));
      }
    }, 600);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [formData.destination]);

  // ── Chargement initial ──────────────────────────────────────────────────────
  useEffect(() => { loadTripData(); }, [tripId]);

  const loadTripData = async () => {
    try {
      const [tripData, bookingsData] = await Promise.all([
        ApiService.getTripById(tripId),
        ApiService.getBookingsByTripId(tripId),
      ]);

      if (tripData) {
        const startDate = new Date(tripData.startDate);
        const endDate   = new Date(tripData.endDate);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return;

        const visibility = parseVisibility(tripData.visibility, tripData.isPublic);

        const existingCover = tripData.coverImage || "";
        if (existingCover) isManualCover.current = true;

        setFormData({
          title:       tripData.title,
          description: tripData.description || "",
          destination: tripData.destination,
          startDate,
          endDate,
          visibility,
          status: tripData.status === "validated" ? "validated" : "draft",
          coverImage: existingCover,
        });
        setIsOwner(tripData.ownerId === user?.id);

        // Pas de photo existante → auto-fetch depuis la destination
        if (!existingCover && tripData.destination) {
          const url = await fetchDestinationPhotoUrl(tripData.destination);
          if (url) setFormData((p) => ({ ...p, coverImage: url }));
        }
      }

      const mappedBookings: Booking[] = (bookingsData || []).map((b: any) => ({
        id: b._id, tripId: b.tripId, type: b.type, title: b.title,
        description: b.description, date: new Date(b.date),
        endDate: b.endDate ? new Date(b.endDate) : undefined,
        time: b.time, address: b.address, confirmationNumber: b.confirmationNumber,
        price: b.price, currency: b.currency, status: b.status,
        attachments: b.attachments, createdAt: new Date(b.createdAt), updatedAt: new Date(b.updatedAt),
      }));
      bookingsState.setBookings(mappedBookings);
    } catch (error) {
      console.error("[useEditTrip] Erreur lors du chargement des données:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // ── Photo de couverture ──────────────────────────────────────────────────────
  const handlePickCoverPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("common.error"), t("editTrip.coverPermissionDenied"));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", allowsEditing: true, aspect: [16, 9], quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        isManualCover.current = true;
        setFormData((p) => ({ ...p, coverImage: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("[useEditTrip] Erreur lors de la sélection de la photo:", error);
    }
  };

  // ── Sauvegarde & actions ─────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    if (!formData.title.trim()) { Alert.alert(t("createTrip.error"), t("createTrip.titleRequired")); return false; }
    if (!formData.destination.trim()) { Alert.alert(t("createTrip.error"), t("createTrip.destinationRequired")); return false; }
    return true;
  };

  const handleUpdateTrip = async () => {
    if (!validateForm() || !user) return;
    try {
      setLoading(true);
      await updateTrip(tripId, {
        title:       formData.title.trim(),
        description: formData.description.trim(),
        destination: formData.destination.trim(),
        startDate:   formData.startDate,
        endDate:     formData.endDate,
        isPublic:    formData.visibility === "public",
        visibility:  formData.visibility,
        status:      formData.status,
        coverImage:  formData.coverImage || undefined,
      });
      navigation.navigate("TripDetails", { tripId, showToast: true });
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = () => {
    Alert.alert(t("editTrip.deleteTrip"), t("editTrip.deleteConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTrip(tripId);
            (navigation as any).reset({ index: 0, routes: [{ name: "Main" }] });
          } catch (error) {
            Alert.alert(t("common.error"), parseApiError(error));
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(t("editTrip.cancelTitle"), t("editTrip.cancelMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("editTrip.cancelModification"), style: "destructive", onPress: () => navigation.goBack() },
    ]);
  };

  return {
    formData, setFormData,
    loading, initialLoading, isOwner,
    handlePickCoverPhoto, handleUpdateTrip, handleDeleteTrip, handleCancel,
    ...calendar,
    ...bookingsState,
  };
};

export default useEditTrip;
