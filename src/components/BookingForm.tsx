import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Booking } from "../types";

interface BookingFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => void;
  initialBooking?: Partial<Booking>;
  tripStartDate: Date;
  tripEndDate: Date;
}

const BookingForm: React.FC<BookingFormProps> = ({
  visible,
  onClose,
  onSave,
  initialBooking,
  tripStartDate,
  tripEndDate,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: (initialBooking?.type || "flight") as Booking["type"],
    title: initialBooking?.title || "",
    description: initialBooking?.description || "",
    date: initialBooking?.date || tripStartDate,
    time: initialBooking?.time || "",
    address: initialBooking?.address || "",
    confirmationNumber: initialBooking?.confirmationNumber || "",
    price: initialBooking?.price?.toString() || "",
    currency: initialBooking?.currency || "EUR",
    status: (initialBooking?.status || "pending") as Booking["status"],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const bookingTypes: Booking["type"][] = [
    "flight",
    "train",
    "hotel",
    "restaurant",
    "activity",
  ];

  const statuses: Booking["status"][] = ["confirmed", "pending", "cancelled"];

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0");
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
      setFormData((prev) => ({ ...prev, time: `${hours}:${minutes}` }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert(t("common.error"), t("bookings.titleRequired") || "Le titre est requis");
      return false;
    }

    // Normaliser les dates pour la comparaison (ignorer l'heure)
    const bookingDate = new Date(formData.date);
    bookingDate.setHours(0, 0, 0, 0);
    const startDate = new Date(tripStartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(tripEndDate);
    endDate.setHours(0, 0, 0, 0);

    if (bookingDate < startDate || bookingDate > endDate) {
      Alert.alert(
        t("common.error"),
        t("bookings.dateOutOfRange") || "La date de la réservation doit être dans la plage du voyage"
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const booking: Omit<Booking, "id" | "createdAt" | "updatedAt"> = {
      tripId: "", // Sera défini par le parent
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: formData.date,
      time: formData.time || undefined,
      address: formData.address.trim() || undefined,
      confirmationNumber: formData.confirmationNumber.trim() || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      currency: formData.currency,
      status: formData.status,
    };

    onSave(booking);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialBooking ? t("bookings.editBooking") : t("bookings.addBooking")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Type de réservation */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.type")}</Text>
              <View style={styles.typeContainer}>
                {bookingTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.type === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => handleInputChange("type", type)}
                  >
                    <Ionicons
                      name={getTypeIcon(type) as any}
                      size={20}
                      color={formData.type === type ? "#007AFF" : "#666"}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        formData.type === type && styles.typeTextSelected,
                      ]}
                    >
                      {t(`bookings.filters.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Titre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.title")} *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
                placeholder={t("bookings.titlePlaceholder")}
              />
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.date")} *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {formData.date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Heure */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.time")}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {formData.time || t("bookings.selectTime")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Adresse */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.address")}</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                placeholder={t("bookings.addressPlaceholder")}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                placeholder={t("bookings.descriptionPlaceholder")}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Numéro de confirmation */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("bookings.confirmationNumber")}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.confirmationNumber}
                onChangeText={(value) =>
                  handleInputChange("confirmationNumber", value)
                }
                placeholder={t("bookings.confirmationNumberPlaceholder")}
              />
            </View>

            {/* Prix */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                <Text style={styles.label}>{t("bookings.price")}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(value) => handleInputChange("price", value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t("bookings.currency")}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.currency}
                  onChangeText={(value) => handleInputChange("currency", value)}
                  placeholder="EUR"
                  maxLength={3}
                />
              </View>
            </View>

            {/* Statut */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.status")}</Text>
              <View style={styles.statusContainer}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.status === status && styles.statusButtonSelected,
                    ]}
                    onPress={() => handleInputChange("status", status)}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        formData.status === status && styles.statusTextSelected,
                      ]}
                    >
                      {t(`bookings.status.${status}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={tripStartDate}
              maximumDate={tripEndDate}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={
                formData.time
                  ? new Date(`2000-01-01T${formData.time}`)
                  : new Date()
              }
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    padding: 20,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#F5F5F5",
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
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  typeButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  typeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  typeTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  statusButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  statusTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});

export default BookingForm;

