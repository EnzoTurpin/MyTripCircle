import { useState, useEffect } from "react";
import { Alert, Keyboard } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList, Booking } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { parseApiError } from "../utils/i18n";
import ApiService from "../services/ApiService";

type EditTripRouteProp = RouteProp<RootStackParamList, "EditTrip">;
type EditTripNavigationProp = StackNavigationProp<RootStackParamList, "EditTrip">;

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

export interface UseEditTripReturn {
  // Données formulaire
  formData:             EditTripFormData;
  setFormData:          React.Dispatch<React.SetStateAction<EditTripFormData>>;

  // État UI
  loading:              boolean;
  initialLoading:       boolean;
  isOwner:              boolean;

  // Calendrier
  showCalendar:         boolean;
  calendarPickingFor:   "start" | "end";
  calendarYear:         number;
  calendarMonth:        number;
  openCalendar:         (type: "start" | "end") => void;
  closeCalendar:        () => void;
  handleCalendarDayPress: (day: number) => void;
  goToPrevMonth:        () => void;
  goToNextMonth:        () => void;

  // Réservations
  bookings:             Booking[];
  showBookingForm:      boolean;
  editingBookingIndex:  number | null;
  handleAddBooking:     () => void;
  handleEditBooking:    (index: number) => void;
  handleDeleteBooking:  (index: number) => void;
  handleSaveBooking:    (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  closeBookingForm:     () => void;

  // Actions
  handlePickCoverPhoto: () => Promise<void>;
  handleUpdateTrip:     () => Promise<void>;
  handleDeleteTrip:     () => void;
  handleCancel:         () => void;
}

const useEditTrip = (): UseEditTripReturn => {
  const route      = useRoute<EditTripRouteProp>();
  const navigation = useNavigation<EditTripNavigationProp>();
  const { tripId } = route.params;

  const { updateTrip, deleteTrip, createBooking, updateBooking, deleteBooking } = useTrips();
  const { user }    = useAuth();
  const { t }       = useTranslation();

  // ── Formulaire ──────────────────────────────────────────────────────────────
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

  // ── UI ──────────────────────────────────────────────────────────────────────
  const [loading,        setLoading]        = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isOwner,        setIsOwner]        = useState(false);

  // ── Calendrier ──────────────────────────────────────────────────────────────
  const [showCalendar,       setShowCalendar]       = useState(false);
  const [calendarPickingFor, setCalendarPickingFor] = useState<"start" | "end">("start");
  const [calendarYear,       setCalendarYear]       = useState(new Date().getFullYear());
  const [calendarMonth,      setCalendarMonth]      = useState(new Date().getMonth());

  // ── Réservations ────────────────────────────────────────────────────────────
  const [bookings,            setBookings]            = useState<Booking[]>([]);
  const [showBookingForm,     setShowBookingForm]     = useState(false);
  const [editingBookingIndex, setEditingBookingIndex] = useState<number | null>(null);

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

        let visibility: "private" | "friends" | "public";
        if (tripData.visibility === "friends") {
          visibility = "friends";
        } else if (tripData.visibility === "public" || tripData.isPublic) {
          visibility = "public";
        } else {
          visibility = "private";
        }

        setFormData({
          title:       tripData.title,
          description: tripData.description || "",
          destination: tripData.destination,
          startDate,
          endDate,
          visibility,
          status: tripData.status === "validated" ? "validated" : "draft",
          coverImage: tripData.coverImage || "",
        });
        setIsOwner(tripData.ownerId === user?.id);
      }

      const mappedBookings: Booking[] = (bookingsData || []).map((b: any) => ({
        id:                 b._id,
        tripId:             b.tripId,
        type:               b.type,
        title:              b.title,
        description:        b.description,
        date:               new Date(b.date),
        endDate:            b.endDate ? new Date(b.endDate) : undefined,
        time:               b.time,
        address:            b.address,
        confirmationNumber: b.confirmationNumber,
        price:              b.price,
        currency:           b.currency,
        status:             b.status,
        attachments:        b.attachments,
        createdAt:          new Date(b.createdAt),
        updatedAt:          new Date(b.updatedAt),
      }));
      setBookings(mappedBookings);
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
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setFormData(p => ({ ...p, coverImage: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("[useEditTrip] Erreur lors de la sélection de la photo:", error);
    }
  };

  // ── Calendrier ───────────────────────────────────────────────────────────────
  const openCalendar = (type: "start" | "end") => {
    Keyboard.dismiss();
    if (showCalendar && calendarPickingFor === type) {
      setShowCalendar(false);
      return;
    }
    const ref = type === "start" ? formData.startDate : formData.endDate;
    setCalendarYear(ref.getFullYear());
    setCalendarMonth(ref.getMonth());
    setCalendarPickingFor(type);
    setShowCalendar(true);
  };

  const closeCalendar = () => setShowCalendar(false);

  const handleCalendarDayPress = (day: number) => {
    const selected = new Date(calendarYear, calendarMonth, day);
    if (calendarPickingFor === "start") {
      setFormData(p => ({
        ...p,
        startDate: selected,
        endDate:   selected > p.endDate ? selected : p.endDate,
      }));
      const endRef = selected > formData.endDate ? selected : formData.endDate;
      setCalendarYear(endRef.getFullYear());
      setCalendarMonth(endRef.getMonth());
      setCalendarPickingFor("end");
    } else {
      if (selected < formData.startDate) {
        setFormData(p => ({ ...p, startDate: selected, endDate: p.startDate }));
      } else {
        setFormData(p => ({ ...p, endDate: selected }));
      }
      setShowCalendar(false);
    }
  };

  const goToPrevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  // ── Validation & sauvegarde ──────────────────────────────────────────────────
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert(t("createTrip.error"), t("createTrip.titleRequired"));
      return false;
    }
    if (!formData.destination.trim()) {
      Alert.alert(t("createTrip.error"), t("createTrip.destinationRequired"));
      return false;
    }
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
      {
        text: t("editTrip.cancelModification"),
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  // ── Réservations ─────────────────────────────────────────────────────────────
  const handleAddBooking = () => {
    setEditingBookingIndex(null);
    setShowBookingForm(true);
  };

  const handleEditBooking = (index: number) => {
    setEditingBookingIndex(index);
    setShowBookingForm(true);
  };

  const handleDeleteBooking = (index: number) => {
    const booking = bookings[index];
    Alert.alert(t("common.confirm"), t("bookings.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.ok"),
        style: "destructive",
        onPress: async () => {
          if (booking.id) await deleteBooking(booking.id);
          setBookings(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleSaveBooking = async (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingBookingIndex === null) {
        const newBooking = await createBooking({ ...booking, tripId });
        setBookings(prev => [...prev, newBooking]);
      } else {
        const existing = bookings[editingBookingIndex];
        if (existing.id) {
          await updateBooking(existing.id, booking);
          const applyUpdate = (b: Booking, i: number) =>
            i === editingBookingIndex ? { ...b, ...booking, updatedAt: new Date() } : b;
          setBookings(prev => prev.map(applyUpdate));
        }
      }
      setShowBookingForm(false);
      setEditingBookingIndex(null);
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error) || t("editTrip.saveError"));
    }
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setEditingBookingIndex(null);
  };

  return {
    formData,
    setFormData,
    loading,
    initialLoading,
    isOwner,
    showCalendar,
    calendarPickingFor,
    calendarYear,
    calendarMonth,
    openCalendar,
    closeCalendar,
    handleCalendarDayPress,
    goToPrevMonth,
    goToNextMonth,
    bookings,
    showBookingForm,
    editingBookingIndex,
    handleAddBooking,
    handleEditBooking,
    handleDeleteBooking,
    handleSaveBooking,
    closeBookingForm,
    handlePickCoverPhoto,
    handleUpdateTrip,
    handleDeleteTrip,
    handleCancel,
  };
};

export default useEditTrip;
