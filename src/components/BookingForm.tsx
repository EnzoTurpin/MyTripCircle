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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Booking } from "../types";
import { formatDate } from "../utils/i18n";
import i18n from "i18next";

interface BookingFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => void;
  initialBooking?: Partial<Booking>;
  tripStartDate?: Date;
  tripEndDate?: Date;
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
  
  // S'assurer que les dates sont des objets Date valides
  const getValidDate = (date: Date | string | undefined, fallback: Date): Date => {
    console.log("[BookingForm] getValidDate - Input:", { date, dateType: typeof date, isDate: date instanceof Date, fallback });
    if (!date) {
      console.log("[BookingForm] getValidDate - No date, using fallback:", fallback);
      return fallback;
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      console.log("[BookingForm] getValidDate - Valid Date object:", date);
      return date;
    }
    const parsed = new Date(date);
    const result = isNaN(parsed.getTime()) ? fallback : parsed;
    console.log("[BookingForm] getValidDate - Parsed:", { parsed, isValid: !isNaN(parsed.getTime()), result });
    return result;
  };
  
  // Calculer les dates valides (avec valeurs par défaut si non fournies)
  const getValidTripDates = () => {
    const now = new Date();
    const defaultEnd = new Date(now);
    defaultEnd.setFullYear(now.getFullYear() + 1); // 1 an à partir d'aujourd'hui par défaut
    
    const start = tripStartDate ? getValidDate(tripStartDate, now) : now;
    const end = tripEndDate ? getValidDate(tripEndDate, defaultEnd) : defaultEnd;
    
    console.log("[BookingForm] getValidTripDates - Result:", { start, end, startTime: start.getTime(), endTime: end.getTime() });
    return { start, end };
  };
  
  const getInitialFormData = () => {
    console.log("[BookingForm] getInitialFormData - Called");
    console.log("[BookingForm] getInitialFormData - Props:", { 
      tripStartDate, 
      tripEndDate, 
      initialBooking: initialBooking ? { ...initialBooking, date: initialBooking.date } : null 
    });
    const { start: validTripStartDate } = getValidTripDates();
    const validInitialDate = initialBooking?.date 
      ? getValidDate(initialBooking.date, validTripStartDate)
      : validTripStartDate;
    
    console.log("[BookingForm] getInitialFormData - Initial date:", { 
      validInitialDate, 
      validInitialDateTime: validInitialDate.getTime(),
      validInitialDateString: validInitialDate.toISOString()
    });
    
    // Pour les hôtels, initialiser la date de fin (par défaut, 1 jour après la date de début)
    const validEndDate = (initialBooking as any)?.endDate 
      ? getValidDate((initialBooking as any).endDate, new Date(validInitialDate.getTime() + 24 * 60 * 60 * 1000))
      : new Date(validInitialDate.getTime() + 24 * 60 * 60 * 1000);
    
    const formData = {
      type: (initialBooking?.type || "flight") as Booking["type"],
      title: initialBooking?.title || "",
      description: initialBooking?.description || "",
      date: validInitialDate,
      endDate: validEndDate,
      time: initialBooking?.time || "",
      address: initialBooking?.address || "",
      confirmationNumber: initialBooking?.confirmationNumber || "",
      price: initialBooking?.price?.toString() || "",
      currency: initialBooking?.currency || "EUR",
      status: (initialBooking?.status || "pending") as Booking["status"],
    };
    
    console.log("[BookingForm] getInitialFormData - FormData:", { ...formData, date: formData.date, dateTime: formData.date.getTime() });
    return formData;
  };
  
  const [formData, setFormData] = useState(() => {
    console.log("[BookingForm] useState - Initializing formData");
    return getInitialFormData();
  });
  
  // État pour les pièces jointes (fichiers)
  const [attachments, setAttachments] = useState<Array<{ uri: string; name: string; type: 'image' | 'pdf' }>>([]);
  
  // Réinitialiser les données quand le modal s'ouvre
  React.useEffect(() => {
    if (visible) {
      // Réinitialiser les pièces jointes avec celles de la réservation initiale si elle existe
      if (initialBooking?.attachments) {
        setAttachments(
          initialBooking.attachments.map(name => ({
            uri: name, // Pour les fichiers existants, on utilise le nom comme URI
            name: name,
            type: name.toLowerCase().endsWith('.pdf') ? 'pdf' as const : 'image' as const
          }))
        );
      } else {
        setAttachments([]);
      }
      // Réinitialiser la devise sélectionnée
      setSelectedCurrency("");
    }
  }, [visible, initialBooking]);
  
  // Réinitialiser la date si elle est invalide quand le modal s'ouvre
  React.useEffect(() => {
    if (visible) {
      setFormData((prev) => {
        // Si la date actuelle est invalide, la réinitialiser à aujourd'hui
        const currentDate = prev.date instanceof Date && !isNaN(prev.date.getTime()) 
          ? prev.date 
          : new Date();
        
        if (isNaN(currentDate.getTime())) {
          return { ...prev, date: new Date() };
        }
        
        return prev;
      });
    }
  }, [visible]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  // Déterminer si le type de réservation nécessite une date de fin
  const needsEndDate = (type: Booking["type"]): boolean => {
    return type === "hotel";
  };

  // Liste des devises courantes
  const currencies = [
    { code: "EUR", name: "Euro (EUR)" },
    { code: "USD", name: "US Dollar (USD)" },
    { code: "GBP", name: "British Pound (GBP)" },
    { code: "JPY", name: "Japanese Yen (JPY)" },
    { code: "CHF", name: "Swiss Franc (CHF)" },
    { code: "CAD", name: "Canadian Dollar (CAD)" },
    { code: "AUD", name: "Australian Dollar (AUD)" },
    { code: "CNY", name: "Chinese Yuan (CNY)" },
    { code: "INR", name: "Indian Rupee (INR)" },
    { code: "BRL", name: "Brazilian Real (BRL)" },
    { code: "MXN", name: "Mexican Peso (MXN)" },
    { code: "RUB", name: "Russian Ruble (RUB)" },
    { code: "KRW", name: "South Korean Won (KRW)" },
    { code: "SGD", name: "Singapore Dollar (SGD)" },
    { code: "HKD", name: "Hong Kong Dollar (HKD)" },
    { code: "NZD", name: "New Zealand Dollar (NZD)" },
    { code: "SEK", name: "Swedish Krona (SEK)" },
    { code: "NOK", name: "Norwegian Krone (NOK)" },
    { code: "DKK", name: "Danish Krone (DKK)" },
    { code: "PLN", name: "Polish Zloty (PLN)" },
    { code: "TRY", name: "Turkish Lira (TRY)" },
    { code: "ZAR", name: "South African Rand (ZAR)" },
    { code: "AED", name: "UAE Dirham (AED)" },
    { code: "SAR", name: "Saudi Riyal (SAR)" },
    { code: "THB", name: "Thai Baht (THB)" },
    { code: "MYR", name: "Malaysian Ringgit (MYR)" },
    { code: "IDR", name: "Indonesian Rupiah (IDR)" },
    { code: "PHP", name: "Philippine Peso (PHP)" },
    { code: "VND", name: "Vietnamese Dong (VND)" },
    { code: "ILS", name: "Israeli Shekel (ILS)" },
  ];

  const bookingTypes: Booking["type"][] = [
    "flight",
    "train",
    "hotel",
    "restaurant",
    "activity",
  ];

  const statuses: Booking["status"][] = ["confirmed", "pending", "cancelled"];

  const getStatusLabel = (status: Booking["status"]): string => {
    switch (status) {
      case "confirmed":
        return t("bookings.status.confirmed");
      case "pending":
        return t("bookings.status.pending");
      case "cancelled":
        return t("bookings.status.cancelled");
      default:
        return status;
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

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "#34C759"; // Vert
      case "pending":
        return "#FF9500"; // Orange
      case "cancelled":
        return "#FF3B30"; // Rouge
      default:
        return "#8E8E93"; // Gris
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated: any = { ...prev, [field]: value };
      // Si on change le type et qu'on passe d'un type avec date de fin à un sans, supprimer endDate
      if (field === "type" && !needsEndDate(value as Booking["type"]) && prev.endDate) {
        updated.endDate = undefined;
      }
      // Si on change le type et qu'on passe à un type avec date de fin, initialiser endDate
      if (field === "type" && needsEndDate(value as Booking["type"]) && !prev.endDate) {
        updated.endDate = new Date(prev.date.getTime() + 24 * 60 * 60 * 1000); // 1 jour après
      }
      return updated;
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date, dateType: "start" | "end" = "start") => {
    if (Platform.OS === "android") {
      if (dateType === "start") {
        setShowDatePicker(false);
      } else {
        setShowEndDatePicker(false);
      }
    }
    if (selectedDate) {
      // S'assurer que la date est valide
      const date = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      
      if (isNaN(date.getTime())) {
        console.error("[BookingForm] handleDateChange - Invalid date selected:", selectedDate);
        return;
      }
      
      if (dateType === "start") {
        // Si on change la date de début et qu'il y a une date de fin, s'assurer que la date de fin n'est pas avant
        setFormData((prev) => {
          if (prev.endDate && date > prev.endDate) {
            // Si la nouvelle date de début est après la date de fin, ajuster la date de fin
            const newEndDate = new Date(date.getTime() + 24 * 60 * 60 * 1000); // 1 jour après
            return { ...prev, date: date, endDate: newEndDate };
          }
          return { ...prev, date: date };
        });
      } else {
        // Date de fin
        setFormData((prev) => {
          // S'assurer que la date de fin n'est pas avant la date de début
          if (date < prev.date) {
            Alert.alert(
              t("common.error"),
              t("bookings.endDateBeforeStart") || "La date de fin doit être après la date de début"
            );
            return prev;
          }
          return { ...prev, endDate: date };
        });
      }
      // Sur iOS, on ne ferme pas automatiquement la popup, l'utilisateur doit cliquer sur Confirmer/Annuler
    } else if (Platform.OS === "ios" && event.type === "dismissed") {
      if (dateType === "start") {
        setShowDatePicker(false);
      } else {
        setShowEndDatePicker(false);
      }
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
      // Sur iOS, on ne ferme pas automatiquement la popup, l'utilisateur doit cliquer sur Confirmer/Annuler
    } else if (Platform.OS === "ios" && event.type === "dismissed") {
      setShowTimePicker(false);
    }
  };

  const getTimePickerValue = (): Date => {
    // Utiliser la date de la réservation comme base
    const baseDate = new Date(formData.date);
    
    if (formData.time) {
      const [hours, minutes] = formData.time.split(":");
      baseDate.setHours(parseInt(hours, 10));
      baseDate.setMinutes(parseInt(minutes, 10));
      baseDate.setSeconds(0);
      baseDate.setMilliseconds(0);
      return baseDate;
    }
    // Par défaut, utiliser midi (12:00) pour éviter les problèmes de fuseau horaire
    baseDate.setHours(12, 0, 0, 0);
    return baseDate;
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert(t("common.error"), t("bookings.titleRequired") || "Le titre est requis");
      return false;
    }

    // Valider que la date de fin est après la date de début si elle existe
    if (needsEndDate(formData.type) && formData.endDate) {
      if (formData.endDate < formData.date) {
        Alert.alert(
          t("common.error"),
          t("bookings.endDateBeforeStart") || "La date de fin doit être après la date de début"
        );
        return false;
      }
    }

    return true;
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t("common.error"),
          t("bookings.permissionDenied") || "Permission d'accès à la galerie refusée"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image' as const,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t("common.error"), t("bookings.imagePickerError") || "Erreur lors de la sélection de l'image");
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType?.includes('pdf') ? 'pdf' as const : 'image' as const,
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert(t("common.error"), t("bookings.documentPickerError") || "Erreur lors de la sélection du document");
    }
  };

  const handleRemoveAttachment = (index: number) => {
    Alert.alert(
      t("common.confirm"),
      t("bookings.removeAttachmentConfirm") || "Supprimer ce fichier ?",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            setAttachments(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const booking: Omit<Booking, "id" | "createdAt" | "updatedAt"> = {
      tripId: "", // Sera défini par le parent
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: formData.date,
      endDate: needsEndDate(formData.type) && formData.endDate ? formData.endDate : undefined,
      time: formData.time || undefined,
      address: formData.address.trim() || undefined,
      confirmationNumber: formData.confirmationNumber.trim() || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      currency: formData.currency,
      status: formData.status,
      attachments: attachments.length > 0 ? attachments.map(att => att.name) : undefined,
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
              <Text style={styles.label}>
                {needsEndDate(formData.type) 
                  ? (t("bookings.startDate") || "Date de début")
                  : t("bookings.date")
                } *
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {(() => {
                    console.log("[BookingForm] Rendering date text:", {
                      formDataDate: formData.date,
                      formDataDateTime: formData.date?.getTime(),
                      formDataDateIsValid: formData.date instanceof Date && !isNaN(formData.date.getTime()),
                      formatted: formatDate(formData.date)
                    });
                    return formatDate(formData.date);
                  })()}
                </Text>
              </TouchableOpacity>
              {Platform.OS === "ios" && showDatePicker && (
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <TouchableOpacity
                    style={styles.pickerModalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={(e) => e.stopPropagation()}
                      style={styles.pickerModalContent}
                    >
                      <Text style={styles.pickerModalTitle}>
                        {needsEndDate(formData.type) 
                          ? (t("bookings.startDate") || "Date de début")
                          : t("bookings.date")
                        }
                      </Text>
                      <View style={styles.pickerWrapper}>
                        <DateTimePicker
                          value={formData.date instanceof Date && !isNaN(formData.date.getTime()) ? formData.date : new Date()}
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
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.pickerCancelText}>
                            {t("common.cancel")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.pickerConfirmButton}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.pickerConfirmText}>
                            {t("common.confirm")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>

            {/* Date de fin (uniquement pour les hôtels) */}
            {needsEndDate(formData.type) && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("bookings.endDate") || "Date de fin"} *</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#666" />
                  <Text style={styles.dateText}>
                    {formatDate(formData.endDate || new Date())}
                  </Text>
                </TouchableOpacity>
                {Platform.OS === "ios" && showEndDatePicker && (
                  <Modal
                    visible={showEndDatePicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowEndDatePicker(false)}
                  >
                    <TouchableOpacity
                      style={styles.pickerModalOverlay}
                      activeOpacity={1}
                      onPress={() => setShowEndDatePicker(false)}
                    >
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={styles.pickerModalContent}
                      >
                        <Text style={styles.pickerModalTitle}>
                          {t("bookings.endDate") || "Date de fin"}
                        </Text>
                        <View style={styles.pickerWrapper}>
                          <DateTimePicker
                            value={formData.endDate instanceof Date && !isNaN(formData.endDate.getTime()) ? formData.endDate : new Date()}
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
                            onPress={() => setShowEndDatePicker(false)}
                          >
                            <Text style={styles.pickerConfirmText}>
                              {t("common.confirm")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Modal>
                )}
              </View>
            )}

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
              {Platform.OS === "ios" && showTimePicker && (
                <Modal
                  visible={showTimePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowTimePicker(false)}
                >
                  <TouchableOpacity
                    style={styles.pickerModalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={(e) => e.stopPropagation()}
                      style={styles.pickerModalContent}
                    >
                      <Text style={styles.pickerModalTitle}>
                        {t("bookings.time")}
                      </Text>
                      <View style={styles.pickerWrapper}>
                        <DateTimePicker
                          value={getTimePickerValue()}
                          mode="time"
                          display="spinner"
                          onChange={handleTimeChange}
                          textColor="#000000"
                        />
                      </View>
                      <View style={styles.pickerButtons}>
                        <TouchableOpacity
                          style={styles.pickerCancelButton}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Text style={styles.pickerCancelText}>
                            {t("common.cancel")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.pickerConfirmButton}
                          onPress={() => setShowTimePicker(false)}
                        >
                          <Text style={styles.pickerConfirmText}>
                            {t("common.confirm")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              )}
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
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowCurrencyPicker(true)}
                >
                  <Ionicons name="cash" size={20} color="#666" />
                  <Text style={styles.dateText}>
                    {formData.currency || "EUR"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Statut */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.statusLabel")}</Text>
              <View style={styles.statusContainer}>
                {statuses.map((status) => {
                  const statusColor = getStatusColor(status);
                  const isSelected = formData.status === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor: isSelected
                            ? `${statusColor}20`
                            : "#F5F5F5",
                          borderColor: isSelected ? statusColor : "#E0E0E0",
                        },
                      ]}
                      onPress={() => handleInputChange("status", status)}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isSelected ? statusColor : "#666",
                            fontWeight: isSelected ? "600" : "400",
                          },
                        ]}
                        >
                        {getStatusLabel(status)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Pièces jointes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("bookings.attachments")}</Text>
              <View style={styles.attachmentsContainer}>
                <TouchableOpacity
                  style={styles.addAttachmentButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="image" size={20} color="#007AFF" />
                  <Text style={styles.addAttachmentText}>
                    {t("bookings.addImage") || "Ajouter une image"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addAttachmentButton}
                  onPress={handlePickDocument}
                >
                  <Ionicons name="document" size={20} color="#007AFF" />
                  <Text style={styles.addAttachmentText}>
                    {t("bookings.addDocument") || "Ajouter un PDF"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Liste des pièces jointes */}
              {attachments.length > 0 && (
                <View style={styles.attachmentsList}>
                  {attachments.map((attachment, index) => (
                    <View key={index} style={styles.attachmentItem}>
                      {attachment.type === 'image' && (attachment.uri.startsWith('file://') || attachment.uri.startsWith('content://') || attachment.uri.startsWith('ph://')) ? (
                        <Image
                          source={{ uri: attachment.uri }}
                          style={styles.attachmentThumbnail}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.attachmentIcon}>
                          <Ionicons
                            name={attachment.type === 'pdf' ? 'document' : 'image'}
                            size={24}
                            color="#007AFF"
                          />
                        </View>
                      )}
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeAttachmentButton}
                        onPress={() => handleRemoveAttachment(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
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

          {/* Date Picker Android */}
          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={formData.date instanceof Date && !isNaN(formData.date.getTime()) ? formData.date : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange(event, date, "start")}
            />
          )}

          {/* End Date Picker Android */}
          {Platform.OS === "android" && showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate instanceof Date && !isNaN(formData.endDate.getTime()) ? formData.endDate : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange(event, date, "end")}
            />
          )}

          {/* Time Picker Android */}
          {Platform.OS === "android" && showTimePicker && (
            <DateTimePicker
              value={getTimePickerValue()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          {/* Currency Picker Modal */}
          <Modal
            visible={showCurrencyPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCurrencyPicker(false)}
          >
            <TouchableOpacity
              style={styles.pickerModalOverlay}
              activeOpacity={1}
              onPress={() => setShowCurrencyPicker(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={styles.pickerModalContent}
              >
                <Text style={styles.pickerModalTitle}>
                  {t("bookings.currency")}
                </Text>
                <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={true}>
                  {currencies.map((currency) => (
                    <TouchableOpacity
                      key={currency.code}
                      style={[
                        styles.currencyItem,
                        (selectedCurrency || formData.currency) === currency.code && styles.currencyItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedCurrency(currency.code);
                      }}
                    >
                      <Text
                        style={[
                          styles.currencyText,
                          (selectedCurrency || formData.currency) === currency.code && styles.currencyTextSelected,
                        ]}
                      >
                        {currency.name}
                      </Text>
                      {(selectedCurrency || formData.currency) === currency.code && (
                        <Ionicons name="checkmark" size={20} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.pickerButtons}>
                  <TouchableOpacity
                    style={styles.pickerCancelButton}
                    onPress={() => {
                      setShowCurrencyPicker(false);
                      setSelectedCurrency("");
                    }}
                  >
                    <Text style={styles.pickerCancelText}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerConfirmButton}
                    onPress={() => {
                      if (selectedCurrency) {
                        handleInputChange("currency", selectedCurrency);
                      }
                      setShowCurrencyPicker(false);
                      setSelectedCurrency("");
                    }}
                  >
                    <Text style={styles.pickerConfirmText}>
                      {t("common.confirm")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
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
  pickerModalOverlay: {
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
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
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
  attachmentsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  addAttachmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  addAttachmentText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  attachmentsList: {
    marginTop: 10,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  attachmentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  attachmentIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  removeAttachmentButton: {
    padding: 4,
  },
  currencyList: {
    maxHeight: 300,
    marginVertical: 10,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  currencyItemSelected: {
    backgroundColor: "#E3F2FD",
  },
  currencyText: {
    fontSize: 16,
    color: "#333",
  },
  currencyTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default BookingForm;

