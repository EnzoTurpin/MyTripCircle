import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip, Booking } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import BookingForm from "../components/BookingForm";

type CreateTripScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CreateTrip"
>;

const CreateTripScreen: React.FC = () => {
  const navigation = useNavigation<CreateTripScreenNavigationProp>();
  const { createTrip, createBooking } = useTrips();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours plus tard
    isPublic: false,
    visibility: "private" as "private" | "friends" | "public",
    tags: [] as string[],
    tagInput: "",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<
    Omit<Booking, "id" | "createdAt" | "updatedAt">[]
  >([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingIndex, setEditingBookingIndex] = useState<number | null>(
    null
  );

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (
      formData.tagInput.trim() &&
      !formData.tags.includes(formData.tagInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: "",
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddBooking = () => {
    setEditingBookingIndex(null);
    setShowBookingForm(true);
  };

  const handleEditBooking = (index: number) => {
    setEditingBookingIndex(index);
    setShowBookingForm(true);
  };

  const handleDeleteBooking = (index: number) => {
    Alert.alert(
      t("common.confirm"),
      t("bookings.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.ok"),
          style: "destructive",
          onPress: () => {
            setBookings((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleSaveBooking = (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingBookingIndex !== null) {
      setBookings((prev) =>
        prev.map((b, i) => (i === editingBookingIndex ? booking : b))
      );
    } else {
      setBookings((prev) => [...prev, booking]);
    }
    setShowBookingForm(false);
    setEditingBookingIndex(null);
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

  const handleVisibilityChange = (
    visibility: "private" | "friends" | "public"
  ) => {
    setFormData((prev) => ({
      ...prev,
      visibility,
      isPublic: visibility === "public",
    }));
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

  const handleCreateTrip = async () => {
    if (!validateForm() || !user) return;

    try {
      setLoading(true);

      const newTrip = await createTrip({
        title: formData.title.trim(),
        description: formData.description.trim(),
        destination: formData.destination.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        ownerId: user.id,
        collaborators: [],
        isPublic: formData.isPublic,
        visibility: formData.visibility,
        status: "draft", // Créer le voyage en mode brouillon
        tags: formData.tags,
        stats: {
          totalBookings: bookings.length,
          totalAddresses: 0,
          totalCollaborators: 0,
        },
        location: {
          type: "Point",
          coordinates: [0, 0], // Coordonnées par défaut
        },
      });

      // Créer les réservations associées
      for (const booking of bookings) {
        try {
          await createBooking({
            ...booking,
            tripId: newTrip.id,
          });
        } catch (error) {
          console.error("Error creating booking:", error);
        }
      }

      Alert.alert(t("createTrip.success"), t("createTrip.successMessage"), [
        {
          text: t("common.ok"),
          onPress: () =>
            navigation.navigate("TripDetails", {
              tripId: newTrip.id,
              showValidateButton: true,
            }),
        },
      ]);
    } catch (error) {
      console.error("Error creating trip:", error);
      Alert.alert(
        t("common.error"),
        (error as Error).message || t("createTrip.errorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(t("createTrip.cancelTitle"), t("createTrip.cancelMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.discard"),
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("createTrip.title")}</Text>
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
            <View style={styles.visibilityOptions}>
              {[
                {
                  value: "private",
                  icon: "lock-closed",
                  label: t("createTrip.private"),
                },
                {
                  value: "friends",
                  icon: "people",
                  label: t("createTrip.friends"),
                },
                {
                  value: "public",
                  icon: "globe",
                  label: t("createTrip.public"),
                },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.visibilityOption,
                    formData.visibility === option.value &&
                      styles.visibilityOptionSelected,
                  ]}
                  onPress={() => handleVisibilityChange(option.value as any)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={
                      formData.visibility === option.value ? "#007AFF" : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.visibilityOptionText,
                      formData.visibility === option.value &&
                        styles.visibilityOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("createTrip.tags")}</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={formData.tagInput}
                onChangeText={(value) => handleInputChange("tagInput", value)}
                placeholder={t("createTrip.addTag")}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={handleAddTag}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {formData.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {formData.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
                  <View key={index} style={styles.bookingItem}>
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
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateTrip}
          disabled={loading}
        >
          {loading ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <Ionicons name="add" size={20} color="white" />
          )}
          <Text style={styles.createButtonText}>
            {loading ? t("createTrip.creating") : t("createTrip.createTrip")}
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
  visibilityOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  visibilityOption: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 4,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  visibilityOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  visibilityOptionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  visibilityOptionTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tagInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  addTagButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontSize: 14,
    color: "#1976D2",
    marginRight: 6,
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
  createButton: {
    flex: 2,
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  createButtonDisabled: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  createButtonText: {
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

export default CreateTripScreen;
