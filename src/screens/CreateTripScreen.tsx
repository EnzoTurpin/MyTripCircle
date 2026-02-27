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
import { RootStackParamList, Trip } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate, parseApiError } from "../utils/i18n";
import i18n from "i18next";

type CreateTripScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CreateTrip"
>;

const CreateTripScreen: React.FC = () => {
  const navigation = useNavigation<CreateTripScreenNavigationProp>();
  const { createTrip } = useTrips();
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
    };
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        collaborators: [],
        isPublic: formData.isPublic,
        visibility: formData.visibility,
        status: "draft", // Créer le voyage en mode brouillon
        tags: [],
        stats: {
          totalBookings: 0,
          totalAddresses: 0,
          totalCollaborators: 0,
        },
        location: {
          type: "Point",
          coordinates: [0, 0], // Coordonnées par défaut
        },
      } as any);

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
      <LinearGradient 
        colors={['#2891FF', '#8869FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 64 : 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
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
    backgroundColor: '#2891FF',
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
});

export default CreateTripScreen;
