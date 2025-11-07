import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip, Booking } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import BookingForm from "../components/BookingForm";

type EditTripScreenRouteProp = RouteProp<RootStackParamList, "EditTrip">;
type EditTripScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditTrip"
>;

const EditTripScreen: React.FC = () => {
  const route = useRoute<EditTripScreenRouteProp>();
  const navigation = useNavigation<EditTripScreenNavigationProp>();
  const { tripId } = route.params;
  const { updateTrip, getTripById, getBookingsByTripId, createBooking, updateBooking, deleteBooking } = useTrips();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: new Date(),
    endDate: new Date(),
    isPublic: false,
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingIndex, setEditingBookingIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = () => {
    const trip = getTripById(tripId);
    if (trip) {
      setFormData({
        title: trip.title,
        description: trip.description || "",
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        isPublic: trip.isPublic,
      });
      // Charger les réservations existantes
      const existingBookings = getBookingsByTripId(tripId);
      setBookings(existingBookings);
    }
    setInitialLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (
    event: any,
    selectedDate?: Date,
    type: "start" | "end" = "start"
  ) => {
    if (Platform.OS === "android") {
      if (type === "start") {
        setShowStartDatePicker(false);
      } else {
        setShowEndDatePicker(false);
      }
    }

    if (selectedDate) {
      if (type === "start") {
        setFormData((prev) => {
          const newStartDate = selectedDate;
          // Si la date de fin est antérieure à la nouvelle date de début, la mettre à jour
          if (newStartDate >= prev.endDate) {
            return {
              ...prev,
              startDate: newStartDate,
              endDate: new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000),
            };
          }
          return { ...prev, startDate: newStartDate };
        });
      } else {
        setFormData((prev) => ({ ...prev, endDate: selectedDate }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert(t("createTrip.error"), t("createTrip.titleRequired"));
      return false;
    }

    if (!formData.destination.trim()) {
      Alert.alert(t("createTrip.error"), t("createTrip.destinationRequired"));
      return false;
    }

    if (formData.startDate >= formData.endDate) {
      Alert.alert(t("createTrip.error"), t("createTrip.invalidDates"));
      return false;
    }

    // Vérifier que la date de début n'est pas dans le passé (en ignorant l'heure)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateOnly = new Date(formData.startDate);
    startDateOnly.setHours(0, 0, 0, 0);

    if (startDateOnly < today) {
      Alert.alert(t("createTrip.error"), t("createTrip.startDatePast"));
      return false;
    }

    return true;
  };

  const handleUpdateTrip = async () => {
    if (!validateForm() || !user) return;

    try {
      setLoading(true);

      await updateTrip(tripId, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        destination: formData.destination.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isPublic: formData.isPublic,
      });

      // Mettre à jour les statistiques du voyage avec le nombre de réservations
      // (Cette logique devrait être gérée côté backend, mais on peut l'ajouter ici si nécessaire)

      Alert.alert(t("editTrip.success"), t("editTrip.successMessage"), [
        {
          text: t("common.ok"),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error updating trip:", error);
      Alert.alert(
        t("common.error"),
        (error as Error).message || t("editTrip.errorMessage")
      );
    } finally {
      setLoading(false);
    }
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

  const handleAddBooking = () => {
    setEditingBookingIndex(null);
    setShowBookingForm(true);
  };

  const handleEditBooking = (index: number) => {
    setEditingBookingIndex(index);
    setShowBookingForm(true);
  };

  const handleDeleteBooking = async (index: number) => {
    const booking = bookings[index];
    Alert.alert(
      t("common.confirm"),
      t("bookings.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
          style: "destructive",
          onPress: async () => {
            if (booking.id) {
              // Supprimer la réservation existante
              await deleteBooking(booking.id);
            }
            setBookings((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleSaveBooking = async (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingBookingIndex !== null) {
        // Modifier une réservation existante
        const existingBooking = bookings[editingBookingIndex];
        if (existingBooking.id) {
          await updateBooking(existingBooking.id, booking);
          setBookings((prev) =>
            prev.map((b, i) =>
              i === editingBookingIndex
                ? { ...b, ...booking, updatedAt: new Date() }
                : b
            )
          );
        }
      } else {
        // Créer une nouvelle réservation
        const newBooking = await createBooking({
          ...booking,
          tripId,
        });
        setBookings((prev) => [...prev, newBooking]);
      }
      setShowBookingForm(false);
      setEditingBookingIndex(null);
    } catch (error) {
      console.error("Error saving booking:", error);
      Alert.alert(t("common.error"), (error as Error).message || "Erreur lors de la sauvegarde");
    }
  };

  const getTypeIcon = (type: Booking["type"]) => {
    switch (type) {
      case "flight":
        return "airplane";
      case "train":
        return "train";
      case "hotel":
        return "bed";
      case "restaurant":
        return "restaurant";
      case "activity":
        return "ticket";
      default:
        return "receipt";
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("editTrip.loading")}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("editTrip.title")}</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Titre du voyage */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("createTrip.tripTitle")} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
              placeholder={t("createTrip.tripTitlePlaceholder")}
              maxLength={100}
            />
          </View>

          {/* Destination */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("createTrip.destination")} *</Text>
            <TextInput
              style={styles.input}
              value={formData.destination}
              onChangeText={(value) => handleInputChange("destination", value)}
              placeholder={t("createTrip.destinationPlaceholder")}
              maxLength={100}
            />
          </View>

          {/* Dates */}
          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>{t("createTrip.startDate")} *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {formData.startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>{t("createTrip.endDate")} *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {formData.endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("createTrip.description")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              placeholder={t("createTrip.descriptionPlaceholder")}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {formData.description.length}/500
            </Text>
          </View>

          {/* Visibilité */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("createTrip.visibility")}</Text>
            <TouchableOpacity
              style={styles.visibilityButton}
              onPress={() => handleInputChange("isPublic", !formData.isPublic)}
            >
              <View style={styles.visibilityContent}>
                <Ionicons
                  name={formData.isPublic ? "globe" : "lock-closed"}
                  size={20}
                  color="#666"
                />
                <Text style={styles.visibilityText}>
                  {formData.isPublic
                    ? t("createTrip.public")
                    : t("createTrip.private")}
                </Text>
              </View>
              <Ionicons
                name={
                  formData.isPublic
                    ? "checkmark-circle"
                    : "checkmark-circle-outline"
                }
                size={24}
                color={formData.isPublic ? "#34C759" : "#ccc"}
              />
            </TouchableOpacity>
            <Text style={styles.visibilityDescription}>
              {formData.isPublic
                ? t("createTrip.publicDescription")
                : t("createTrip.privateDescription")}
            </Text>
          </View>

          {/* Réservations */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>{t("bookings.header")}</Text>
              <TouchableOpacity
                style={styles.addBookingButton}
                onPress={handleAddBooking}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.addBookingText}>
                  {t("bookings.addBooking")}
                </Text>
              </TouchableOpacity>
            </View>
            {bookings.length === 0 ? (
              <View style={styles.emptyBookings}>
                <Ionicons name="receipt-outline" size={40} color="#ccc" />
                <Text style={styles.emptyBookingsText}>
                  {t("bookings.emptyAll")}
                </Text>
              </View>
            ) : (
              <View style={styles.bookingsList}>
                {bookings.map((booking, index) => (
                  <View key={booking.id || index} style={styles.bookingItem}>
                    <View style={styles.bookingHeader}>
                      <View
                        style={[
                          styles.bookingTypeIcon,
                          { backgroundColor: "#007AFF" },
                        ]}
                      >
                        <Ionicons
                          name={getTypeIcon(booking.type) as any}
                          size={16}
                          color="white"
                        />
                      </View>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.bookingTitle}>{booking.title}</Text>
                        <Text style={styles.bookingDate}>
                          {booking.date.toLocaleDateString()}
                          {booking.time && ` • ${booking.time}`}
                        </Text>
                      </View>
                      <View style={styles.bookingActions}>
                        <TouchableOpacity
                          onPress={() => handleEditBooking(index)}
                        >
                          <Ionicons name="pencil" size={18} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteBooking(index)}
                        >
                          <Ionicons name="trash" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdateTrip}
          disabled={loading}
        >
          {loading ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <Ionicons name="checkmark" size={20} color="white" />
          )}
          <Text style={styles.updateButtonText}>
            {loading ? t("editTrip.updating") : t("editTrip.updateTrip")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => handleDateChange(event, date, "start")}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 an max
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => handleDateChange(event, date, "end")}
          minimumDate={formData.startDate}
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 an max
        />
      )}

      {/* Booking Form Modal */}
      <BookingForm
        visible={showBookingForm}
        onClose={() => {
          setShowBookingForm(false);
          setEditingBookingIndex(null);
        }}
        onSave={handleSaveBooking}
        initialBooking={
          editingBookingIndex !== null
            ? bookings[editingBookingIndex]
            : undefined
        }
        tripStartDate={formData.startDate}
        tripEndDate={formData.endDate}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  headerSpacer: {
    width: 39, // Pour centrer le titre
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateGroup: {
    flex: 1,
    marginRight: 10,
  },
  dateButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  visibilityButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visibilityContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  visibilityText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  visibilityDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  actionContainer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  updateButton: {
    flex: 2,
    backgroundColor: "#34C759",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  updateButtonDisabled: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addBookingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBookingText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyBookings: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyBookingsText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },
  bookingsList: {
    gap: 12,
  },
  bookingItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: "#666",
  },
  bookingActions: {
    flexDirection: "row",
    gap: 12,
  },
});

export default EditTripScreen;
