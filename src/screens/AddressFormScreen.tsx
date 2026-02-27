import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { Address, RootStackParamList } from "../types";
import { useTrips } from "../contexts/TripsContext";
import {
  AddressSuggestion,
  getAddressSuggestions,
  getPlaceDetails,
} from "../services/PlacesService";

type AddressFormRouteProp = RouteProp<RootStackParamList, "AddressForm">;
type AddressFormNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddressForm"
>;

const ADDRESS_TYPES: Address["type"][] = [
  "hotel",
  "restaurant",
  "activity",
  "transport",
  "other",
];

const AddressFormScreen: React.FC = () => {
  const route = useRoute<AddressFormRouteProp>();
  const navigation = useNavigation<AddressFormNavigationProp>();
  const { t } = useTranslation();
  const { addresses, createAddress, updateAddress, loading: contextLoading } =
    useTrips();

  const addressId = route.params?.addressId;

  const existingAddress = useMemo(() => {
    if (!addressId) return null;
    return addresses.find((item) => item.id === addressId) || null;
  }, [addresses, addressId]);

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
  const [initialized, setInitialized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [fetchingPlaceDetails, setFetchingPlaceDetails] = useState(false);

  useEffect(() => {
    if (initialized || contextLoading) {
      return;
    }

    if (existingAddress) {
      setForm({
        type: existingAddress.type,
        name: existingAddress.name,
        address: existingAddress.address,
        city: existingAddress.city,
        country: existingAddress.country,
        phone: existingAddress.phone || "",
        website: existingAddress.website || "",
        notes: existingAddress.notes || "",
      });
    }

    setInitialized(true);
  }, [contextLoading, existingAddress, initialized]);

  const title = addressId
    ? t("addresses.form.editTitle")
    : t("addresses.form.title");

  const handleInputChange = (field: keyof typeof form, value: string) => {
    // Format phone number as: 06 66 66 66 66
    if (field === "phone") {
      const cleaned = value.replace(/\D/g, "");
      const trimmed = cleaned.slice(0, 10);
      const formatted = trimmed.replace(/(\d{2})(?=\d)/g, "$1 ");
      setForm((prev) => ({ ...prev, [field]: formatted }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.address.trim()) {
      Alert.alert(t("common.error"), t("addresses.form.requiredFields"));
      return false;
    }
    if (!form.city.trim() || !form.country.trim()) {
      Alert.alert(t("common.error"), t("addresses.form.requiredFields"));
      return false;
    }
    return true;
  };

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

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
      if (addressId) {
        await updateAddress(addressId, payload);
      } else {
        await createAddress(payload as Omit<Address, "id" | "createdAt" | "updatedAt">);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Address submit error:", error);
      Alert.alert(t("common.error"), t("addresses.form.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialized && contextLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2891FF" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!contextLoading && addressId && !existingAddress) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("addresses.details.notFound")}</Text>
      </View>
    );
  }

  const getTypeIcon = (type: Address["type"]) => {
    switch (type) {
      case "hotel": return "bed";
      case "restaurant": return "restaurant";
      case "activity": return "ticket";
      case "transport": return "car";
      default: return "location";
    }
  };

  const renderTypeSelection = () => (
    <View style={styles.typeContainer}>
      {ADDRESS_TYPES.map((type) => {
        const selected = form.type === type;
        return (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selected && styles.typeButtonSelected,
            ]}
            onPress={() => handleInputChange("type", type)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.typeIconContainer,
              selected && styles.typeIconContainerSelected
            ]}>
              <Ionicons
                name={getTypeIcon(type) as any}
                size={22}
                color={selected ? "#FFFFFF" : "#2891FF"}
              />
            </View>
            <Text
              style={[
                styles.typeText,
                selected && styles.typeTextSelected,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t(`addresses.filters.${type}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2891FF', '#8869FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="location" size={24} color="white" />
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >

        {/* Les adresses ne sont plus liées à un voyage, pas de sélection de trip */}

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.type")} *</Text>
          {renderTypeSelection()}
        </View>

        <View style={styles.section}>
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

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.address")} *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#616161" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
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

        <View style={styles.row}>
          <View style={[styles.section, styles.rowItem]}>
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
          <View style={[styles.section, styles.rowItem]}>
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

        <View style={styles.section}>
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

        <View style={styles.section}>
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

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.notes")}</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#616161" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              value={form.notes}
              onChangeText={(value) => handleInputChange("notes", value)}
              placeholder={t("addresses.form.notesPlaceholder")}
              placeholderTextColor="#9E9E9E"
            />
          </View>
        </View>

        {/* Plus de coordonnées GPS dans le formulaire d'adresse */}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveButton,
            submitting && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.7}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  loadingText: {
    marginTop: 10,
    color: "#616161",
    fontSize: 16,
  },
  section: {
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 14,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
    gap: 12,
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddressFormScreen;
