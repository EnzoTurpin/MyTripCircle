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
import { useTranslation } from "react-i18next";
import { Address } from "../types";
import {
  AddressSuggestion,
  getAddressSuggestions,
  getPlaceDetails,
} from "../services/PlacesService";
import { useCurrentLocation } from "../hooks/useCurrentLocation";

import { COLORS, RADIUS, SHADOW } from "../theme";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";

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
  const { colors } = useTheme();
  const currentLocation = useCurrentLocation();

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

  const [googleRating, setGoogleRating] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [fetchingPlaceDetails, setFetchingPlaceDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"address" | "city" | "country", string>>>({});

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
        setGoogleRating(initialAddress.rating ?? null);
        setPhotoUrl(initialAddress.photoUrl);
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
        setGoogleRating(null);
        setPhotoUrl(undefined);
      }
      setSuggestions([]);
      setErrors({});
    }
  }, [visible, initialAddress]);

  useEffect(() => {
    const noInput = !form.address || form.address.trim().length < 3;
    if (noInput) {
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
          controller.signal,
          currentLocation ?? undefined,
          form.type
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
  }, [form.address, currentLocation]);

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSuggestionPress = async (suggestion: AddressSuggestion) => {
    setSuggestions([]);
    try {
      setFetchingPlaceDetails(true);
      const details = await getPlaceDetails(suggestion.placeId);
      setForm((prev) => ({
        ...prev,
        name:    details.name || suggestion.description.split(",")[0].trim(),
        address: details.formattedAddress || suggestion.description,
        city:    details.city    || prev.city,
        country: details.country || prev.country,
        phone:   details.phone   || prev.phone,
        website: details.website || prev.website,
      }));
      if (details.rating != null) setGoogleRating(details.rating);
      if (details.photoUrl) setPhotoUrl(details.photoUrl);
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
    const newErrors: typeof errors = {};
    if (!form.address.trim()) newErrors.address = t("common.fillAllFields");
    if (!form.city.trim()) newErrors.city = t("common.fillAllFields");
    if (!form.country.trim()) newErrors.country = t("common.fillAllFields");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const payload = {
      type: form.type,
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      phone: form.phone.trim() ? form.phone.trim() : undefined,
      website: form.website.trim() ? form.website.trim() : undefined,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
      rating: typeof googleRating === "number" ? googleRating : undefined,
      photoUrl: photoUrl || undefined,
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

  let nameFieldEl: React.ReactNode = null;
  if (initialAddress) {
    nameFieldEl = (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.name")} *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="text-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={form.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder={t("addresses.form.namePlaceholder")}
            placeholderTextColor={colors.textLight}
            autoComplete="off"
            textContentType="none"
          />
        </View>
      </View>
    );
  } else if (form.name) {
    nameFieldEl = (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.name")}</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.bgMid, borderColor: colors.border }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.terra} style={styles.inputIcon} />
          <Text style={[styles.input, { color: colors.text }]} numberOfLines={1}>{form.name}</Text>
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { backgroundColor: colors.bg, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.bgMid, borderBottomColor: colors.border }]}>
            <View style={[styles.headerIcon, { backgroundColor: colors.terraLight }]}>
              <Ionicons name="location" size={24} color={COLORS.terra} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {initialAddress ? t("addresses.form.editTitle") : t("addresses.form.title")}
            </Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.bgDark }]}>
              <Ionicons name="close" size={24} color={colors.textMid} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Type */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.type")} *</Text>
              <View style={styles.typeContainer}>
                {ADDRESS_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { backgroundColor: colors.bgLight, borderColor: colors.border },
                      form.type === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => handleInputChange("type", type)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.typeIconContainer,
                      { backgroundColor: colors.terraLight },
                      form.type === type && styles.typeIconContainerSelected
                    ]}>
                      <Ionicons
                        name={getTypeIcon(type) as any}
                        size={22}
                        color={form.type === type ? "#FFFFFF" : COLORS.terra}
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeText,
                        { color: colors.textMid },
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

            {/* Nom — éditable uniquement en mode édition, auto-rempli en création */}
            {nameFieldEl}

            {/* Adresse */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.address")} *</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }, errors.address ? styles.inputContainerError : null]}>
                <Ionicons name="location-outline" size={20} color={errors.address ? COLORS.danger : colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={form.address}
                  onChangeText={(value) => { handleInputChange("address", value); if (errors.address) setErrors(e => ({ ...e, address: undefined })); }}
                  placeholder={t("addresses.form.addressPlaceholder")}
                  placeholderTextColor={colors.textLight}
                  autoComplete="off"
                  textContentType="none"
                />
              </View>
              {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
              {(loadingSuggestions || fetchingPlaceDetails) && (
                <View style={styles.autocompleteStatus}>
                  <ActivityIndicator size="small" color={COLORS.terra} />
                  <Text style={[styles.autocompleteStatusText, { color: colors.textMid }]}>
                    {t("common.loading")}
                  </Text>
                </View>
              )}
              {suggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {suggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.placeId}
                      style={[styles.suggestionItem, { borderBottomColor: colors.bgMid }]}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={COLORS.terra}
                        style={styles.suggestionIcon}
                      />
                      <Text style={[styles.suggestionText, { color: colors.text }]}>
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
                <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.city")} *</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }, errors.city ? styles.inputContainerError : null]}>
                  <Ionicons name="business-outline" size={20} color={errors.city ? COLORS.danger : colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={form.city}
                    onChangeText={(value) => { handleInputChange("city", value); if (errors.city) setErrors(e => ({ ...e, city: undefined })); }}
                    placeholder={t("addresses.form.cityPlaceholder")}
                    placeholderTextColor={colors.textLight}
                    autoComplete="off"
                    textContentType="none"
                  />
                </View>
                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.country")} *</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }, errors.country ? styles.inputContainerError : null]}>
                  <Ionicons name="flag-outline" size={20} color={errors.country ? COLORS.danger : colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={form.country}
                    onChangeText={(value) => { handleInputChange("country", value); if (errors.country) setErrors(e => ({ ...e, country: undefined })); }}
                    placeholder={t("addresses.form.countryPlaceholder")}
                    placeholderTextColor={colors.textLight}
                    autoComplete="off"
                    textContentType="none"
                  />
                </View>
                {errors.country ? <Text style={styles.errorText}>{errors.country}</Text> : null}
              </View>
            </View>

            {/* Téléphone */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.phone")}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="call-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={form.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  placeholder={t("addresses.form.phonePlaceholder")}
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  autoComplete="off"
                  textContentType="none"
                />
              </View>
            </View>

            {/* Site web */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.website")}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="globe-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={form.website}
                  onChangeText={(value) => handleInputChange("website", value)}
                  placeholder={t("addresses.form.websitePlaceholder")}
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  autoComplete="off"
                  textContentType="none"
                />
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t("addresses.form.notes")}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="document-text-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={form.notes}
                  onChangeText={(value) => handleInputChange("notes", value)}
                  placeholder={t("addresses.form.notesPlaceholder")}
                  placeholderTextColor={colors.textLight}
                  autoComplete="off"
                  textContentType="none"
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: colors.bgMid, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textMid }]}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, (submitting || fetchingPlaceDetails) && { opacity: 0.6 }]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={submitting || fetchingPlaceDetails}
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
    backgroundColor: "rgba(42, 35, 24, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.sand,
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
    backgroundColor: COLORS.sandMid,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sandDark,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.terraLight,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: F.sans700,
    color: COLORS.ink,
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.sandDark,
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
    fontFamily: F.sans600,
    color: COLORS.ink,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.sandDark,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: '#C04040',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: '#C04040',
    marginTop: 4,
    marginLeft: 4,
    fontFamily: F.sans400,
},
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.ink,
    fontFamily: F.sans400,
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
    backgroundColor: COLORS.sandLight,
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 14,
    minWidth: 90,
    borderWidth: 1,
    borderColor: COLORS.sandDark,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.terra,
    borderColor: COLORS.terra,
    shadowColor: COLORS.terra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.terraLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  typeIconContainerSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  typeText: {
    fontSize: 12,
    color: COLORS.inkMid,
    textAlign: "center",
    fontFamily: F.sans500,
  },
  typeTextSelected: {
    color: "#FFFFFF",
    fontFamily: F.sans600,
  },
  autocompleteStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  autocompleteStatusText: {
    fontSize: 13,
    color: COLORS.inkMid,
    fontFamily: F.sans400,
},
  suggestionsContainer: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.sandDark,
    overflow: "hidden",
    ...SHADOW.medium,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sandMid,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 15,
    fontFamily: F.sans400,
},
  modalFooter: {
    flexDirection: "row",
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.sandDark,
    gap: 12,
    backgroundColor: COLORS.sandMid,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.sandDark,
  },
  cancelButtonText: {
    color: COLORS.inkMid,
    fontSize: 16,
    fontFamily: F.sans600,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.terra,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: COLORS.terra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: F.sans700,
  },
});
