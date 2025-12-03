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
  Modal,
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
import { formatDate, parseApiError } from "../utils/i18n";
import i18n from "i18next";

type CreateTripScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CreateTrip"
>;

const CreateTripScreen: React.FC = () => {
  const navigation = useNavigation<CreateTripScreenNavigationProp>();
  const { createTrip, createBooking, updateBooking, bookings: allBookings } = useTrips();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours plus tard
    return {
      title: "",
      description: "",
      destination: "",
      startDate: now,
      endDate: endDate,
      isPublic: false,
      visibility: "private" as "private" | "friends" | "public",
      tags: [] as string[],
      tagInput: "",
    };
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<
    Omit<Booking, "id" | "createdAt" | "updatedAt">[]
  >([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBookingSelector, setShowBookingSelector] = useState(false);
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
    setShowBookingSelector(true);
  };

  const handleSelectExistingBooking = (booking: Booking) => {
    // Convertir la réservation existante en format pour le voyage en cours
    const bookingForTrip: Omit<Booking, "id" | "createdAt" | "updatedAt"> = {
      tripId: "", // Sera défini lors de la création du voyage
      type: booking.type,
      title: booking.title,
      description: booking.description,
      date: booking.date,
      time: booking.time,
      address: booking.address,
      confirmationNumber: booking.confirmationNumber,
      price: booking.price,
      currency: booking.currency,
      status: booking.status,
    };
    setBookings((prev) => [...prev, bookingForTrip]);
    setShowBookingSelector(false);
  };

  const handleCreateNewBooking = () => {
    setEditingBookingIndex(null);
    setShowBookingSelector(false);
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

  const handleSaveBooking = async (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Créer la réservation globalement (elle sera liée au voyage lors de la création du voyage)
      // Pour l'instant, on la sauvegarde sans tripId pour qu'elle soit visible dans la section Réservations
      const newBooking = await createBooking({
        ...booking,
        tripId: "", // Sera mis à jour lors de la création du voyage
      });
      
      if (editingBookingIndex !== null) {
        setBookings((prev) =>
          prev.map((b, i) => (i === editingBookingIndex ? { ...booking, id: newBooking.id } : b))
        );
      } else {
        // Ajouter la réservation au voyage en cours de création avec son ID pour pouvoir la mettre à jour plus tard
        setBookings((prev) => [...prev, { ...booking, id: newBooking.id } as any]);
      }
      setShowBookingForm(false);
      setEditingBookingIndex(null);
    } catch (error) {
      console.error("Error saving booking:", error);
      Alert.alert(t("common.error"), t("bookings.saveError") || "Erreur lors de la sauvegarde de la réservation");
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
    console.log("[CreateTripScreen] handleDateChange - Called", { 
      type, 
      selectedDate, 
      selectedDateType: typeof selectedDate,
      selectedDateIsDate: selectedDate instanceof Date,
      selectedDateTime: selectedDate?.getTime(),
      selectedDateString: selectedDate?.toISOString(),
      platform: Platform.OS
    });
    
    if (Platform.OS === "android") {
      if (type === "start") {
        setShowStartDatePicker(false);
      } else {
        setShowEndDatePicker(false);
      }
    }

    if (selectedDate && !isNaN(selectedDate.getTime())) {
      console.log("[CreateTripScreen] handleDateChange - Valid date, updating", { type, selectedDate });
      if (type === "start") {
        setFormData((prev) => {
          console.log("[CreateTripScreen] handleDateChange - Previous startDate:", prev.startDate, "New startDate:", selectedDate);
          return { ...prev, startDate: selectedDate };
        });
      } else {
        setFormData((prev) => {
          console.log("[CreateTripScreen] handleDateChange - Previous endDate:", prev.endDate, "New endDate:", selectedDate);
          return { ...prev, endDate: selectedDate };
        });
      }
    } else {
      console.error("[CreateTripScreen] handleDateChange - Invalid date:", selectedDate);
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

    // Validation des dates supprimée pour permettre n'importe quelle date

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

      // Créer ou mettre à jour les réservations associées
      for (const booking of bookings) {
        try {
          // Si la réservation a déjà un ID (créée précédemment), on la met à jour avec le tripId
          // Sinon, on la crée
          if ((booking as any).id) {
            // Mettre à jour la réservation existante avec le tripId
            await updateBooking((booking as any).id, { tripId: newTrip.id });
          } else {
            // Créer une nouvelle réservation liée au voyage
            await createBooking({
              ...booking,
              tripId: newTrip.id,
            });
          }
        } catch (error) {
          console.error("Error creating/updating booking:", error);
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
      Alert.alert(t("common.error"), parseApiError(error));
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
                onPress={() => {
                  console.log("[CreateTripScreen] Opening start date picker", {
                    startDate: formData.startDate,
                    startDateType: typeof formData.startDate,
                    startDateIsDate: formData.startDate instanceof Date,
                    startDateTime: formData.startDate?.getTime(),
                    startDateString: formData.startDate?.toISOString?.(),
                    isValid: formData.startDate instanceof Date && !isNaN(formData.startDate.getTime())
                  });
                  setShowStartDatePicker(true);
                }}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {(() => {
                    console.log("[CreateTripScreen] Rendering start date text:", {
                      startDate: formData.startDate,
                      startDateTime: formData.startDate?.getTime(),
                      startDateIsValid: formData.startDate instanceof Date && !isNaN(formData.startDate.getTime()),
                      formatted: formatDate(formData.startDate)
                    });
                    return formatDate(formData.startDate);
                  })()}
                </Text>
              </TouchableOpacity>
              {Platform.OS === "ios" && showStartDatePicker && (
                <Modal
                  visible={showStartDatePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowStartDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.pickerModalContent}>
                      <Text style={styles.pickerModalTitle}>
                        {t("createTrip.startDate")}
                      </Text>
                      <View style={styles.pickerWrapper}>
                        <DateTimePicker
                          value={formData.startDate}
                          mode="date"
                          display="spinner"
                          onChange={(event, date) => handleDateChange(event, date, "start")}
                          textColor="#000000"
                          locale={i18n.language === "fr" ? "fr_FR" : "en_US"}
                        />
                      </View>
                      <View style={styles.pickerButtons}>
                        <TouchableOpacity
                          style={styles.pickerCancelButton}
                          onPress={() => setShowStartDatePicker(false)}
                        >
                          <Text style={styles.pickerCancelText}>
                            {t("common.cancel")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.pickerConfirmButton}
                          onPress={() => {
                            console.log("[CreateTripScreen] Confirming start date", {
                              startDate: formData.startDate,
                              startDateType: typeof formData.startDate,
                              startDateIsDate: formData.startDate instanceof Date,
                              startDateTime: formData.startDate?.getTime(),
                              isValid: formData.startDate instanceof Date && !isNaN(formData.startDate.getTime())
                            });
                            // S'assurer que la date est bien mise à jour avant de fermer
                            if (formData.startDate) {
                              setFormData((prev) => {
                                console.log("[CreateTripScreen] Updating startDate in state", {
                                  prevStartDate: prev.startDate,
                                  prevStartDateTime: prev.startDate?.getTime(),
                                  newStartDate: prev.startDate,
                                  newStartDateTime: prev.startDate?.getTime()
                                });
                                return { ...prev, startDate: prev.startDate };
                              });
                            }
                            setShowStartDatePicker(false);
                          }}
                        >
                          <Text style={styles.pickerConfirmText}>
                            {t("common.confirm")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>{t("createTrip.endDate")} *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  console.log("[CreateTripScreen] Opening end date picker", {
                    endDate: formData.endDate,
                    endDateType: typeof formData.endDate,
                    endDateIsDate: formData.endDate instanceof Date,
                    endDateTime: formData.endDate?.getTime(),
                    endDateString: formData.endDate?.toISOString?.(),
                    isValid: formData.endDate instanceof Date && !isNaN(formData.endDate.getTime())
                  });
                  setShowEndDatePicker(true);
                }}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {(() => {
                    console.log("[CreateTripScreen] Rendering end date text:", {
                      endDate: formData.endDate,
                      endDateTime: formData.endDate?.getTime(),
                      endDateIsValid: formData.endDate instanceof Date && !isNaN(formData.endDate.getTime()),
                      formatted: formatDate(formData.endDate)
                    });
                    return formatDate(formData.endDate);
                  })()}
                </Text>
              </TouchableOpacity>
              {Platform.OS === "ios" && showEndDatePicker && (
                <Modal
                  visible={showEndDatePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowEndDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.pickerModalContent}>
                      <Text style={styles.pickerModalTitle}>
                        {t("createTrip.endDate")}
                      </Text>
                      <View style={styles.pickerWrapper}>
                        <DateTimePicker
                          value={formData.endDate}
                          mode="date"
                          display="spinner"
                          onChange={(event, date) => handleDateChange(event, date, "end")}
                          textColor="#000000"
                          locale={i18n.language === "fr" ? "fr_FR" : "en_US"}
                        />
                      </View>
                      <View style={styles.pickerButtons}>
                        <TouchableOpacity
                          style={styles.pickerCancelButton}
                          onPress={() => setShowEndDatePicker(false)}
                        >
                          <Text style={styles.pickerCancelText}>
                            {t("common.cancel")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.pickerConfirmButton}
                          onPress={() => {
                            console.log("[CreateTripScreen] Confirming end date", {
                              endDate: formData.endDate,
                              endDateType: typeof formData.endDate,
                              endDateIsDate: formData.endDate instanceof Date,
                              endDateTime: formData.endDate?.getTime(),
                              isValid: formData.endDate instanceof Date && !isNaN(formData.endDate.getTime())
                            });
                            // S'assurer que la date est bien mise à jour avant de fermer
                            if (formData.endDate) {
                              setFormData((prev) => {
                                console.log("[CreateTripScreen] Updating endDate in state", {
                                  prevEndDate: prev.endDate,
                                  prevEndDateTime: prev.endDate?.getTime(),
                                  newEndDate: prev.endDate,
                                  newEndDateTime: prev.endDate?.getTime()
                                });
                                return { ...prev, endDate: prev.endDate };
                              });
                            }
                            setShowEndDatePicker(false);
                          }}
                        >
                          <Text style={styles.pickerConfirmText}>
                            {t("common.confirm")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
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
                          {formatDate(booking.date)}
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

      {/* Date Pickers Android */}
      {Platform.OS === "android" && showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, "start")}
        />
      )}

        {Platform.OS === "android" && showEndDatePicker && (
          <DateTimePicker
            value={formData.endDate}
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, "end")}
          />
        )}

      {/* Booking Selector Modal */}
      <Modal
        visible={showBookingSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBookingSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectorModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("bookings.selectOrCreate") || "Sélectionner ou créer une réservation"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowBookingSelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.selectorContent}>
              {/* Bouton pour créer une nouvelle réservation */}
              <TouchableOpacity
                style={styles.createNewButton}
                onPress={handleCreateNewBooking}
              >
                <Ionicons name="add-circle" size={24} color="#007AFF" />
                <Text style={styles.createNewButtonText}>
                  {t("bookings.createNew") || "Créer une nouvelle réservation"}
                </Text>
              </TouchableOpacity>

              {/* Liste des réservations existantes */}
              <Text style={styles.existingBookingsTitle}>
                {t("bookings.existingBookings") || "Réservations existantes"}
              </Text>
              
              {allBookings.length === 0 ? (
                <View style={styles.emptyBookingsList}>
                  <Ionicons name="receipt-outline" size={40} color="#ccc" />
                  <Text style={styles.emptyBookingsListText}>
                    {t("bookings.noExistingBookings") || "Aucune réservation existante"}
                  </Text>
                </View>
              ) : (
                allBookings.map((booking) => (
                  <TouchableOpacity
                    key={booking.id}
                    style={styles.existingBookingItem}
                    onPress={() => handleSelectExistingBooking(booking)}
                  >
                    <View style={styles.existingBookingHeader}>
                      <Ionicons
                        name={getTypeIcon(booking.type) as any}
                        size={24}
                        color="#007AFF"
                      />
                      <View style={styles.existingBookingInfo}>
                        <Text style={styles.existingBookingTitle}>
                          {booking.title}
                        </Text>
                        <Text style={styles.existingBookingDate}>
                          {formatDate(booking.date)}
                          {booking.time && ` • ${booking.time}`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
      {console.log("[CreateTripScreen] BookingForm props:", {
        visible: showBookingForm,
        tripStartDate: formData.startDate,
        tripStartDateType: typeof formData.startDate,
        tripStartDateIsDate: formData.startDate instanceof Date,
        tripStartDateTime: formData.startDate?.getTime(),
        tripEndDate: formData.endDate,
        tripEndDateType: typeof formData.endDate,
        tripEndDateIsDate: formData.endDate instanceof Date,
        tripEndDateTime: formData.endDate?.getTime(),
        initialBooking: editingBookingIndex !== null ? bookings[editingBookingIndex] : undefined
      })}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  pickerWrapper: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  pickerCancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pickerCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerConfirmButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pickerConfirmText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  selectorModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  selectorContent: {
    padding: 20,
    maxHeight: 600,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
  },
  createNewButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  existingBookingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  emptyBookingsList: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyBookingsListText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  existingBookingItem: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  existingBookingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  existingBookingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  existingBookingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  existingBookingDate: {
    fontSize: 14,
    color: "#666",
  },
  closeButton: {
    padding: 4,
  },
});

export default CreateTripScreen;
