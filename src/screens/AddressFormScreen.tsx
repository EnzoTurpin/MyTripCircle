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
import BackButton from "../components/ui/BackButton";
import { useTranslation } from "react-i18next";
import { DISABLED_OPACITY } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";
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
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        {/* Top bar */}
        <View style={[styles.topBar, { backgroundColor: colors.bg, borderBottomColor: colors.bgMid, flexDirection: "row", alignItems: "center", gap: 12 }]}>
          <SkeletonBox width={36} height={36} borderRadius={18} />
          <SkeletonBox width={160} height={18} borderRadius={7} />
        </View>

        <ScrollView scrollEnabled={false} contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Address type selector */}
          <View style={{ gap: 8 }}>
            <SkeletonBox width={110} height={12} borderRadius={5} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} width={56} height={56} borderRadius={10} />
              ))}
            </View>
          </View>

          {/* Autocomplete / address field */}
          <View style={{ gap: 8 }}>
            <SkeletonBox width={90} height={12} borderRadius={5} />
            <SkeletonBox width="100%" height={52} borderRadius={10} />
          </View>

          {/* Name, city, country */}
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ gap: 8 }}>
              <SkeletonBox width={80} height={12} borderRadius={5} />
              <SkeletonBox width="100%" height={52} borderRadius={10} />
            </View>
          ))}

          {/* Notes */}
          <View style={{ gap: 8 }}>
            <SkeletonBox width={60} height={12} borderRadius={5} />
            <SkeletonBox width="100%" height={90} borderRadius={10} />
          </View>

          {/* Footer buttons */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <SkeletonBox height={50} borderRadius={12} style={{ flex: 1 }} />
            <SkeletonBox height={50} borderRadius={12} style={{ flex: 1 }} />
          </View>
        </ScrollView>
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
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{screenTitle}</Text>
        <View style={{ width: 44 }} />
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
            onSelect={(type) => handleInputChange("type", type)}
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
            <Ionicons name="star" size={17} color={colors.terra} />
            <Text style={[styles.ratingLabel, { color: colors.textMid }]}>Note Google :</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Text key={s} style={[styles.star, { color: s <= Math.round(googleRating) ? colors.terra : "#D4C4B0" }]}>★</Text>
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
          style={[styles.primaryButton, { backgroundColor: colors.terra }, (submitting || fetchingPlaceDetails) && { opacity: DISABLED_OPACITY }]}
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
