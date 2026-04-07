import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { DISABLED_OPACITY } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useAddressForm } from "../hooks/useAddressForm";
import AddressTypeSelector from "../components/addressForm/AddressTypeSelector";
import AddressAutocompleteField from "../components/addressForm/AddressAutocompleteField";
import FormField from "../components/addressForm/FormField";
import styles from "../components/addressForm/addressFormStyles";

const AddressFormScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    form,
    googleRating,
    initialized,
    submitting,
    suggestions,
    loadingSuggestions,
    fetchingPlaceDetails,
    contextLoading,
    addressId,
    existingAddress,
    screenTitle,
    handleInputChange,
    handleSuggestionPress,
    handleSubmit,
    navigation,
  } = useAddressForm();

  if (!initialized && contextLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.terra} />
        <Text style={[styles.loadingText, { color: colors.textMid }]}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!contextLoading && addressId && !existingAddress) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <Text style={[styles.loadingText, { color: colors.textMid }]}>{t("addresses.details.notFound")}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <View style={[styles.topBar, { backgroundColor: colors.bg, borderBottomColor: colors.bgMid }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.bgMid }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{screenTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionWrap}>
          <Text style={[styles.fieldLabel, { color: colors.textMid }]}>
            {t("addresses.form.type")}<Text style={{ color: colors.terra }}> *</Text>
          </Text>
          <AddressTypeSelector
            selectedType={form.type}
            onSelect={(type) => handleInputChange("type", type as any)}
          />
        </View>

        <AddressAutocompleteField
          value={form.address}
          onChange={(v) => handleInputChange("address", v)}
          suggestions={suggestions}
          loadingSuggestions={loadingSuggestions}
          fetchingPlaceDetails={fetchingPlaceDetails}
          onSuggestionPress={handleSuggestionPress}
        />

        <FormField
          label={t("addresses.form.name")}
          value={form.name}
          onChangeText={(v) => handleInputChange("name", v)}
          icon="text-outline"
          placeholder={t("addresses.form.namePlaceholder")}
        />

        {googleRating != null && (
          <View style={[styles.ratingRow, { backgroundColor: colors.bgMid }]}>
            <Ionicons name="star" size={17} color="#C4714A" />
            <Text style={[styles.ratingLabel, { color: colors.textMid }]}>Note Google :</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Text key={s} style={[styles.star, { color: s <= Math.round(googleRating) ? "#C4714A" : "#D4C4B0" }]}>★</Text>
              ))}
            </View>
            <Text style={[styles.ratingValue, { color: colors.textMid }]}>{googleRating.toFixed(1)}</Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormField
              label={t("addresses.form.city")}
              value={form.city}
              onChangeText={(v) => handleInputChange("city", v)}
              icon="business-outline"
              placeholder={t("addresses.form.cityPlaceholder")}
              required
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label={t("addresses.form.country")}
              value={form.country}
              onChangeText={(v) => handleInputChange("country", v)}
              icon="flag-outline"
              placeholder={t("addresses.form.countryPlaceholder")}
              required
            />
          </View>
        </View>

        <FormField
          label={t("addresses.form.phone")}
          value={form.phone}
          onChangeText={(v) => handleInputChange("phone", v)}
          icon="call-outline"
          placeholder={t("addresses.form.phonePlaceholder")}
          keyboardType="phone-pad"
        />

        <FormField
          label={t("addresses.form.website")}
          value={form.website}
          onChangeText={(v) => handleInputChange("website", v)}
          icon="globe-outline"
          placeholder={t("addresses.form.websitePlaceholder")}
          autoCapitalize="none"
        />

        <FormField
          label={t("addresses.form.notes")}
          value={form.notes}
          onChangeText={(v) => handleInputChange("notes", v)}
          icon="document-text-outline"
          placeholder={t("addresses.form.notesPlaceholder")}
          multiline
        />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.bgMid }]}
          onPress={() => navigation.goBack()}
          disabled={submitting}
          activeOpacity={0.75}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textMid }]}>{t("common.cancel")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, (submitting || fetchingPlaceDetails) && { opacity: DISABLED_OPACITY }]}
          onPress={handleSubmit}
          disabled={submitting || fetchingPlaceDetails}
          activeOpacity={0.85}
        >
          {submitting || fetchingPlaceDetails ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>{t("common.save")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddressFormScreen;
