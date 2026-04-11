import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";

import { useCreateTrip } from "../hooks/useCreateTrip";
import TripCoverPhoto from "../components/createTrip/TripCoverPhoto";
import {
  TripDatePickerModal,
  AndroidDatePicker,
} from "../components/createTrip/TripDatePicker";
import TripVisibilityPicker from "../components/createTrip/TripVisibilityPicker";
import styles from "../components/createTrip/createTripStyles";

const CreateTripScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    formData,
    showStartDatePicker,
    showEndDatePicker,
    showVisibilityPicker,
    loading,
    dateError,
    handleInputChange,
    handleDateChange,
    handleVisibilityChange,
    handleCreate,
    handleCancel,
    setShowStartDatePicker,
    setShowEndDatePicker,
    setShowVisibilityPicker,
    coverImage,
    handlePickCoverPhoto,
  } = useCreateTrip();

  const VISIBILITY_LABELS: Record<string, string> = {
    private: t("createTrip.visibilityPrivate"),
    friends: t("createTrip.visibilityFriends"),
    public: t("createTrip.visibilityPublic"),
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.bgMid }]}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textMid} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("createTrip.screenTitle")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Cover Photo ── */}
        <TripCoverPhoto coverImage={coverImage} onPickPhoto={handlePickCoverPhoto} />

        {/* ── Formulaire ── */}
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Nom du voyage */}
          <View
            style={[
              styles.fieldBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              {t("createTrip.tripNameLabel")}
            </Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              value={formData.title}
              onChangeText={(v) => handleInputChange("title", v)}
              placeholder={t("createTrip.tripNamePlaceholder")}
              placeholderTextColor={colors.textLight}
              maxLength={100}
            />
          </View>

          {/* 2. Destination principale */}
          <View
            style={[
              styles.fieldBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              {t("createTrip.mainDestination")}
            </Text>
            <View style={styles.destRow}>
              <Text style={styles.destPin}>📍</Text>
              <TextInput
                style={[styles.destInput, { color: colors.text }]}
                value={formData.destination}
                onChangeText={(v) => handleInputChange("destination", v)}
                placeholder={t("createTrip.destinationPlaceholder")}
                placeholderTextColor={colors.textLight}
                maxLength={100}
              />
            </View>
          </View>

          {/* 3. Dates — côte à côte */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[
                styles.fieldBox,
                styles.dateBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowStartDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
                {t("createTrip.departureDateLabel")}
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formatDate(formData.startDate)}
              </Text>
            </TouchableOpacity>

            <View style={styles.dateGap} />

            <TouchableOpacity
              style={[
                styles.fieldBox,
                styles.dateBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowEndDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
                {t("createTrip.returnDateLabel")}
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formatDate(formData.endDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message d'erreur de date */}
          {dateError && (
            <Text style={styles.dateErrorText}>{dateError}</Text>
          )}

          {/* Modales iOS pour les dates */}
          {Platform.OS === "ios" && (
            <>
              <TripDatePickerModal
                type="start"
                value={formData.startDate}
                visible={showStartDatePicker}
                colors={colors}
                onChange={(event, date) => handleDateChange(event, date, "start")}
                onClose={() => setShowStartDatePicker(false)}
                onConfirm={() => setShowStartDatePicker(false)}
              />
              <TripDatePickerModal
                type="end"
                value={formData.endDate}
                visible={showEndDatePicker}
                colors={colors}
                onChange={(event, date) => handleDateChange(event, date, "end")}
                onClose={() => setShowEndDatePicker(false)}
                onConfirm={() => setShowEndDatePicker(false)}
              />
            </>
          )}

          {/* 4. Description (optionnelle) */}
          <View
            style={[
              styles.fieldBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              {t("createTrip.descriptionLabel")}
            </Text>
            <TextInput
              style={[styles.fieldInput, styles.descInput, { color: colors.text }]}
              value={formData.description}
              onChangeText={(v) => handleInputChange("description", v)}
              placeholder={t("createTrip.descriptionPlaceholder")}
              placeholderTextColor={colors.textLight}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          {/* 5. Visibilité */}
          <View
            style={[
              styles.fieldBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
              {t("createTrip.visibilityLabel")}
            </Text>
            <TouchableOpacity
              style={styles.visibilityRow}
              onPress={() => setShowVisibilityPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.visibilityText, { color: colors.text }]}>
                {VISIBILITY_LABELS[formData.visibility]}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Modale de visibilité */}
          <TripVisibilityPicker
            visible={showVisibilityPicker}
            currentVisibility={formData.visibility}
            colors={colors}
            onSelect={handleVisibilityChange}
            onClose={() => setShowVisibilityPicker(false)}
          />

          {/* ── Bouton principal ── */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? t("createTrip.creating") : t("createTrip.createButton")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Pickers Android inline */}
        {Platform.OS === "android" && showStartDatePicker && (
          <AndroidDatePicker
            value={formData.startDate}
            onChange={(event, date) => handleDateChange(event, date, "start")}
          />
        )}
        {Platform.OS === "android" && showEndDatePicker && (
          <AndroidDatePicker
            value={formData.endDate}
            onChange={(event, date) => handleDateChange(event, date, "end")}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateTripScreen;
