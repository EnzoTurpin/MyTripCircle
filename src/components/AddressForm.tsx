import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Address } from "../types";
import {
  AddressSuggestion,
  getAddressSuggestions,
  getPlaceDetails,
} from "../services/PlacesService";

const ADDRESS_TYPES: Address["type"][] = [
  "hotel",
  "restaurant",
  "activity",
  "transport",
  "other",
];

interface AddressFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: Omit<Address, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  initialAddress?: Address;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  visible,
  onClose,
  onSave,
  initialAddress,
}) => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    type: "hotel" as Address["type"],
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    website: "",
    notes: "",
  });

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [fetchingPlaceDetails, setFetchingPlaceDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Animation pour le slide du modal
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(1000);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (initialAddress) {
        setForm({
          type: initialAddress.type,
          name: initialAddress.name,
          address: initialAddress.address,
          city: initialAddress.city,
          country: initialAddress.country,
          phone: initialAddress.phone || "",
          website: initialAddress.website || "",
          notes: initialAddress.notes || "",
        });
      } else {
        setForm({
          type: "hotel",
          name: "",
          address: "",
          city: "",
          country: "",
          phone: "",
          website: "",
          notes: "",
        });
      }
      setSuggestions([]);
    }
  }, [visible, initialAddress]);

  useEffect(() => {
    if (!form.address || form.address.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const results = await getAddressSuggestions(
          form.address.trim(),
          controller.signal
        );
        if (isActive) {
          setSuggestions(results);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Address suggestions error:", error);
        }
      } finally {
        if (isActive) {
          setLoadingSuggestions(false);
        }
      }
    }, 400);

    return () => {
      isActive = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [form.address]);

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSuggestionPress = async (suggestion: AddressSuggestion) => {
    setForm((prev) => ({
      ...prev,
      address: suggestion.description,
    }));
    setSuggestions([]);

    try {
      setFetchingPlaceDetails(true);
      const details = await getPlaceDetails(suggestion.placeId);
      setForm((prev) => ({
        ...prev,
        address: details.formattedAddress || suggestion.description,
        city: details.city || prev.city,
        country: details.country || prev.country,
      }));
    } catch (error) {
      console.error("Place details error:", error);
    } finally {
      setFetchingPlaceDetails(false);
    }
  };

  const getTypeIcon = (type: Address["type"]) => {
    switch (type) {
      case "hotel": return "bed";
      case "restaurant": return "restaurant";
      case "activity": return "ticket";
      case "transport": return "car";
      default: return "location";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.country.trim()) {
      return;
    }

    const payload = {
      type: form.type,
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      phone: form.phone.trim() ? form.phone.trim() : undefined,
      website: form.website.trim() ? form.website.trim() : undefined,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
    };

    try {
      setSubmitting(true);
      await onSave(payload as Omit<Address, "id" | "createdAt" | "updatedAt">);
      onClose();
    } catch (error) {
      console.error("Address save error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#2891FF', '#8869FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <View style={styles.headerIcon}>
              <Ionicons name="location" size={24} color="white" />
            </View>
            <Text style={styles.modalTitle}>
              {initialAddress ? t("addresses.form.editTitle") : t("addresses.form.title")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.formContainer}>
            {/* Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addresses.form.type")} *</Text>
              <View style={styles.typeContainer}>
                {ADDRESS_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      form.type === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => handleInputChange("type", type)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.typeIconContainer,
                      form.type === type && styles.typeIconContainerSelected
                    ]}>
                      <Ionicons
                        name={getTypeIcon(type) as any}
                        size={22}
                        color={form.type === type ? "#FFFFFF" : "#2891FF"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeText,
                        form.type === type && styles.typeTextSelected,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {t(`addresses.filters.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Nom */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addresses.form.name")} *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="text-outline" size={20} color="#616161" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  placeholder={t("addresses.form.namePlaceholder")}
                  placeholderTextColor="#9E9E9E"
                />
              </View>
            </View>

            {/* Adresse */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addresses.form.address")} *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#616161" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.address}
                  onChangeText={(value) => handleInputChange("address", value)}
                  placeholder={t("addresses.form.addressPlaceholder")}
                  placeholderTextColor="#9E9E9E"
                />
              </View>
              {(loadingSuggestions || fetchingPlaceDetails) && (
                <View style={styles.autocompleteStatus}>
                  <ActivityIndicator size="small" color="#2891FF" />
                  <Text style={styles.autocompleteStatusText}>
                    {t("common.loading")}
                  </Text>
                </View>
              )}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {suggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.placeId}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#2891FF"
                        style={styles.suggestionIcon}
                      />
                      <Text style={styles.suggestionText}>
                        {suggestion.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Ville et Pays */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>{t("addresses.form.city")} *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#616161" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.city}
                    onChangeText={(value) => handleInputChange("city", value)}
                    placeholder={t("addresses.form.cityPlaceholder")}
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t("addresses.form.country")} *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="flag-outline" size={20} color="#616161" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={form.country}
                    onChangeText={(value) => handleInputChange("country", value)}
                    placeholder={t("addresses.form.countryPlaceholder")}
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              </View>
            </View>

            {/* Téléphone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addresses.form.phone")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#616161" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  placeholder={t("addresses.form.phonePlaceholder")}
                  placeholderTextColor="#9E9E9E"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Site web */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addresses.form.website")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="globe-outline" size={20} color="#616161" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.website}
                  onChangeText={(value) => handleInputChange("website", value)}
                  placeholder={t("addresses.form.websitePlaceholder")}
                  placeholderTextColor="#9E9E9E"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addresses.form.notes")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={20} color="#616161" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.notes}
                  onChangeText={(value) => handleInputChange("notes", value)}
                  placeholder={t("addresses.form.notesPlaceholder")}
                  placeholderTextColor="#9E9E9E"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>{t("common.save")}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    padding: 24,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#212121",
  },
  row: {
    flexDirection: "row",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  typeButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 14,
    minWidth: 90,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  typeButtonSelected: {
    backgroundColor: "#2891FF",
    borderColor: "#2891FF",
    shadowColor: "#2891FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  typeIconContainerSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  typeText: {
    fontSize: 12,
    color: "#616161",
    textAlign: "center",
    fontWeight: "500",
  },
  typeTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  autocompleteStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  autocompleteStatusText: {
    fontSize: 13,
    color: "#616161",
  },
  suggestionsContainer: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    color: "#212121",
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    gap: 12,
    backgroundColor: "#FAFAFA",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#616161",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2891FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#2891FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
