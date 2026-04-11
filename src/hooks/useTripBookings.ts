import { useState } from "react";
import { Alert } from "react-native";
import { Booking } from "../types";
import { parseApiError } from "../utils/i18n";

type BookingOmitKeys = "id" | "createdAt" | "updatedAt";

interface UseTripBookingsParams {
  tripId: string;
  createBooking: (data: Omit<Booking, BookingOmitKeys> & { tripId: string }) => Promise<Booking>;
  updateBooking: (id: string, data: Omit<Booking, BookingOmitKeys>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  t: (key: string) => string;
}

export interface UseTripBookingsReturn {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  showBookingForm: boolean;
  editingBookingIndex: number | null;
  handleAddBooking: () => void;
  handleEditBooking: (index: number) => void;
  handleDeleteBooking: (index: number) => void;
  handleSaveBooking: (booking: Omit<Booking, BookingOmitKeys>) => Promise<void>;
  closeBookingForm: () => void;
}

const useTripBookings = ({
  tripId,
  createBooking,
  updateBooking,
  deleteBooking,
  t,
}: UseTripBookingsParams): UseTripBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingIndex, setEditingBookingIndex] = useState<number | null>(null);

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
    const removeAtIndex = (prev: Booking[]) => prev.filter((_, i) => i !== index);

    const onConfirm = async () => {
      if (booking.id) await deleteBooking(booking.id);
      setBookings(removeAtIndex);
    };

    Alert.alert(t("common.confirm"), t("bookings.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.ok"), style: "destructive", onPress: onConfirm },
    ]);
  };

  const handleSaveBooking = async (
    booking: Omit<Booking, BookingOmitKeys>
  ) => {
    try {
      if (editingBookingIndex === null) {
        const newBooking = await createBooking({ ...booking, tripId });
        setBookings((prev) => [...prev, newBooking]);
      } else {
        const existing = bookings[editingBookingIndex];
        if (existing.id) {
          await updateBooking(existing.id, booking);
          setBookings((prev) =>
            prev.map((b, i) =>
              i === editingBookingIndex ? { ...b, ...booking, updatedAt: new Date() } : b
            )
          );
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
    bookings,
    setBookings,
    showBookingForm,
    editingBookingIndex,
    handleAddBooking,
    handleEditBooking,
    handleDeleteBooking,
    handleSaveBooking,
    closeBookingForm,
  };
};

export default useTripBookings;
