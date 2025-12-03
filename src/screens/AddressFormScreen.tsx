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
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
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
        <ActivityIndicator size="large" color="#007AFF" />
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
          >
            <Ionicons
              name={
                type === "hotel"
                  ? "bed"
                  : type === "restaurant"
                  ? "restaurant"
                  : type === "activity"
                  ? "ticket"
                  : type === "transport"
                  ? "car"
                  : "location"
              }
              size={18}
              color={selected ? "#007AFF" : "#666"}
            />
            <Text
              style={[
                styles.typeText,
                selected && styles.typeTextSelected,
              ]}
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{title}</Text>

        {/* Les adresses ne sont plus liées à un voyage, pas de sélection de trip */}

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.type")} *</Text>
          {renderTypeSelection()}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.name")} *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(value) => handleInputChange("name", value)}
            placeholder={t("addresses.form.namePlaceholder")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.address")} *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            value={form.address}
            onChangeText={(value) => handleInputChange("address", value)}
            placeholder={t("addresses.form.addressPlaceholder")}
          />
          {(loadingSuggestions || fetchingPlaceDetails) && (
            <View style={styles.autocompleteStatus}>
              <ActivityIndicator size="small" color="#007AFF" />
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
                    color="#007AFF"
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
            <TextInput
              style={styles.input}
              value={form.city}
              onChangeText={(value) => handleInputChange("city", value)}
              placeholder={t("addresses.form.cityPlaceholder")}
            />
          </View>
          <View style={[styles.section, styles.rowItem]}>
            <Text style={styles.label}>{t("addresses.form.country")} *</Text>
            <TextInput
              style={styles.input}
              value={form.country}
              onChangeText={(value) => handleInputChange("country", value)}
              placeholder={t("addresses.form.countryPlaceholder")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.phone")}</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            placeholder={t("addresses.form.phonePlaceholder")}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.website")}</Text>
          <TextInput
            style={styles.input}
            value={form.website}
            onChangeText={(value) => handleInputChange("website", value)}
            placeholder={t("addresses.form.websitePlaceholder")}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("addresses.form.notes")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            value={form.notes}
            onChangeText={(value) => handleInputChange("notes", value)}
            placeholder={t("addresses.form.notesPlaceholder")}
          />
        </View>

        {/* Plus de coordonnées GPS dans le formulaire d'adresse */}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
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
        >
          <Text style={styles.saveButtonText}>
            {submitting ? t("common.loading") : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  autocompleteStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  autocompleteStatusText: {
    fontSize: 13,
    color: "#666",
  },
  suggestionsContainer: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  suggestionIcon: {
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    color: "#333",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  typeButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  typeText: {
    marginLeft: 8,
    color: "#666",
  },
  typeTextSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddressFormScreen;

