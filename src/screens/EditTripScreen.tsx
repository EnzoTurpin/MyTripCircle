import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "../components/ui/BackButton";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTranslation } from "react-i18next";
import BookingForm from "../components/BookingForm";
import {
  ExistingBookingPicker,
  ExistingAddressPicker,
} from "../components/tripDetails/ExistingItemPicker";
import { formatDate } from "../utils/i18n";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";

import useEditTrip from "../hooks/useEditTrip";
import FocusableField from "../components/editTrip/FocusableField";
import TripCalendar from "../components/editTrip/TripCalendar";
import RadioOptionCard, { RadioOption } from "../components/editTrip/RadioOptionCard";
import BookingsList from "../components/editTrip/BookingsList";
import AddressesList from "../components/editTrip/AddressesList";
import DatePickerField from "../components/editTrip/DatePickerField";
import EditTripSkeleton from "../components/editTrip/EditTripSkeleton";
import EditTripDangerZone from "../components/editTrip/EditTripDangerZone";
import EditTripMembersBtn from "../components/editTrip/EditTripMembersBtn";
import { useOfflineDisabled } from "../hooks/useOfflineDisabled";

type EditTripRouteProp      = RouteProp<RootStackParamList, "EditTrip">;
type EditTripNavigationProp = StackNavigationProp<RootStackParamList, "EditTrip">;

const EditTripScreen: React.FC = () => {
  const navigation = useNavigation<EditTripNavigationProp>();
  const route      = useRoute<EditTripRouteProp>();
  const { t }      = useTranslation();
  const { colors, isDark } = useTheme();
  const { disabled: offlineDisabled, style: offlineStyle } = useOfflineDisabled();

  const {
    formData, setFormData,
    loading, initialLoading, isOwner,
    showCalendar, calendarPickingFor, calendarYear, calendarMonth,
    openCalendar, closeCalendar, handleCalendarDayPress, goToPrevMonth, goToNextMonth,
    bookings, showBookingForm, editingBookingIndex,
    handleAddBooking, handleEditBooking, handleDeleteBooking, handleSaveBooking, closeBookingForm,
    addresses,
    handleAddAddress, handleEditAddress, handleDeleteAddress,
    otherBookings, otherAddresses, handleCopyBooking, handleCopyAddress,
    handlePickCoverPhoto, handleUpdateTrip, handleDeleteTrip, handleCancel,
  } = useEditTrip();

  const [showBookingPicker, setShowBookingPicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const handleAddBookingPress = () => {
    if (!otherBookings.length) {
      handleAddBooking();
      return;
    }
    Alert.alert(t("tripDetails.addBooking"), undefined, [
      { text: t("tripDetails.createNew"), onPress: handleAddBooking },
      { text: t("tripDetails.chooseExisting"), onPress: () => setShowBookingPicker(true) },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleAddAddressPress = () => {
    Alert.alert(t("tripDetails.addAddress"), undefined, [
      { text: t("tripDetails.createNew"), onPress: handleAddAddress },
      { text: t("tripDetails.chooseExisting"), onPress: () => setShowAddressPicker(true) },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const MONTHS = t("editTrip.monthNames").split(",");
  const DAYS   = t("editTrip.dayInitials").split(",");
  const kvaBehavior = Platform.OS === "ios" ? "padding" : "height";

  const visibilityOptions: RadioOption<"private" | "friends" | "public">[] = [
    { value: "private", label: t("editTrip.visibilityPrivate"), desc: t("editTrip.visibilityPrivateDesc"), emoji: "🔒", selBg: colors.terraLight, selColor: colors.terra, dotColor: colors.terra },
    { value: "friends", label: t("editTrip.visibilityFriends"), desc: t("editTrip.visibilityFriendsDesc"), emoji: "👥", selBg: "#DCF0F5", selColor: "#5A8FAA", dotColor: "#5A8FAA" },
    { value: "public",  label: t("editTrip.visibilityPublic"),  desc: t("editTrip.visibilityPublicDesc"),  emoji: "🌐", selBg: "#E2EDD9", selColor: "#6B8C5A", dotColor: "#6B8C5A" },
  ];

  const statusOptions: RadioOption<"draft" | "validated">[] = [
    { value: "draft",     label: t("editTrip.statusDraft"),     desc: t("editTrip.statusDraftDesc"),     emoji: "📝", selBg: colors.bgMid, selColor: colors.textMid, dotColor: colors.textMid },
    { value: "validated", label: t("editTrip.statusValidated"), desc: t("editTrip.statusValidatedDesc"), emoji: "✅", selBg: "#E2EDD9", selColor: "#6B8C5A", dotColor: "#6B8C5A" },
  ];

  if (initialLoading) return <EditTripSkeleton />;

  return (
    <KeyboardAvoidingView style={[s.root, { backgroundColor: colors.bg }]} behavior={kvaBehavior}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgLight} />
      <SafeAreaView style={[s.safeArea, { backgroundColor: colors.bgLight }]} edges={["top"]}>

        {/* ── Header ── */}
        <View style={[s.header, { backgroundColor: colors.bgLight, borderBottomColor: colors.border }]}>
          <BackButton onPress={handleCancel} />
          <Text style={[s.headerTitle, { color: colors.text }]}>{t("editTrip.screenTitle")}</Text>
          <TouchableOpacity style={[s.savePill, { backgroundColor: (loading || offlineDisabled) ? colors.textLight : colors.terra, shadowColor: (loading || offlineDisabled) ? undefined : colors.terra }, (loading || offlineDisabled) && { shadowOpacity: 0, elevation: 0 }, offlineStyle]} onPress={handleUpdateTrip} disabled={loading || offlineDisabled} activeOpacity={0.85}>
            <Text style={s.savePillText}>{loading ? "…" : t("editTrip.saveButton")}</Text>
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={closeCalendar}>
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* ── Photo de couverture ── */}
            <TouchableOpacity style={[s.cover, offlineStyle]} onPress={handlePickCoverPhoto} disabled={offlineDisabled} activeOpacity={0.9}>
              {formData.coverImage ? (
                <>
                  <Image source={{ uri: formData.coverImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  <LinearGradient colors={["transparent", "rgba(15,8,2,0.55)"]} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }} />
                </>
              ) : (
                <LinearGradient colors={["#3A3020", "#1E1A10"]} style={StyleSheet.absoluteFillObject} />
              )}
              <View style={[s.coverBtn, { backgroundColor: isDark ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.90)" }]}>
                <Text style={s.coverBtnEmoji}>📸</Text>
                <Text style={[s.coverBtnText, { color: colors.text }]}>{t("editTrip.changeCoverPhoto")}</Text>
              </View>
            </TouchableOpacity>

            <View style={s.form}>

              {/* ── Nom du voyage ── */}
              <FocusableField
                baseStyle={[s.field, { backgroundColor: colors.surface, borderColor: colors.border }]}
                render={({ onFocus, onBlur }) => (
                  <>
                    <Text style={[s.fieldLbl, { color: colors.textLight }]}>{t("editTrip.tripNameLabel")}</Text>
                    <TextInput
                      style={[s.fieldInput, { color: colors.text }]}
                      value={formData.title}
                      onChangeText={v => setFormData(p => ({ ...p, title: v }))}
                      placeholder={t("editTrip.tripNamePlaceholder")}
                      placeholderTextColor={colors.textLight}
                      maxLength={100}
                      onFocus={() => { onFocus(); closeCalendar(); }}
                      onBlur={onBlur}
                    />
                  </>
                )}
              />

              {/* ── Destination ── */}
              <FocusableField
                baseStyle={[s.field, { backgroundColor: colors.surface, borderColor: colors.border }]}
                render={({ onFocus, onBlur }) => (
                  <>
                    <Text style={[s.fieldLbl, { color: colors.textLight }]}>{t("editTrip.mainDestination")}</Text>
                    <View style={s.fieldRow}>
                      <Text style={s.fieldEmoji}>📍</Text>
                      <TextInput
                        style={[s.fieldInput, { color: colors.text, flex: 1 }]}
                        value={formData.destination}
                        onChangeText={v => setFormData(p => ({ ...p, destination: v }))}
                        placeholder={t("editTrip.mainDestinationPlaceholder")}
                        placeholderTextColor={colors.textLight}
                        maxLength={100}
                        onFocus={() => { onFocus(); closeCalendar(); }}
                        onBlur={onBlur}
                      />
                    </View>
                  </>
                )}
              />

              {/* ── Dates ── */}
              <View style={s.dateRow}>
                <View style={s.dateCol}>
                  <DatePickerField
                    label={t("editTrip.departureDateLabel")}
                    isActive={showCalendar && calendarPickingFor === "start"}
                    dateValue={formatDate(formData.startDate)}
                    onPress={() => openCalendar("start")}
                  />
                </View>
                <View style={s.dateCol}>
                  <DatePickerField
                    label={t("editTrip.returnDateLabel")}
                    isActive={showCalendar && calendarPickingFor === "end"}
                    dateValue={formatDate(formData.endDate)}
                    onPress={() => openCalendar("end")}
                  />
                </View>
              </View>

              {/* ── Calendrier ── */}
              {showCalendar && (
                <TripCalendar
                  year={calendarYear}
                  month={calendarMonth}
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  months={MONTHS}
                  days={DAYS}
                  periodLabel={t("editTrip.period")}
                  periodRangeLabel={t("editTrip.periodLabel")}
                  colors={{ surface: colors.surface, border: colors.border, bgMid: colors.bgMid, text: colors.text, textMid: colors.textMid, textLight: colors.textLight, terra: colors.terra }}
                  onPrevMonth={goToPrevMonth}
                  onNextMonth={goToNextMonth}
                  onDayPress={handleCalendarDayPress}
                />
              )}

              {/* ── Description ── */}
              <FocusableField
                baseStyle={[s.field, { backgroundColor: colors.surface, borderColor: colors.border }]}
                render={({ onFocus, onBlur }) => (
                  <>
                    <Text style={[s.fieldLbl, { color: colors.textLight }]}>{t("editTrip.descriptionLabel")}</Text>
                    <TextInput
                      style={[s.fieldInput, s.fieldMultiline, { color: colors.text }]}
                      value={formData.description}
                      onChangeText={v => setFormData(p => ({ ...p, description: v }))}
                      placeholder={t("editTrip.descriptionPlaceholder")}
                      placeholderTextColor={colors.textLight}
                      multiline maxLength={500} textAlignVertical="top"
                      onFocus={() => { onFocus(); closeCalendar(); }}
                      onBlur={onBlur}
                    />
                    <Text style={[s.charCount, { color: colors.textLight }]}>{formData.description.length}/500</Text>
                  </>
                )}
              />

              {/* ── Membres ── */}
              <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("editTrip.membersLabel")}</Text>
              <EditTripMembersBtn
                surface={colors.surface}
                border={colors.border}
                text={colors.text}
                textLight={colors.textLight}
                iconBg={isDark ? "#1A2E35" : "#DCF0F5"}
                onPress={() => navigation.navigate("InviteFriends", { tripId: route.params.tripId })}
              />

              {/* ── Visibilité ── */}
              <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("editTrip.visibilityLabel")}</Text>
              <RadioOptionCard
                options={visibilityOptions}
                selected={formData.visibility}
                isDark={isDark}
                colors={colors}
                onChange={value => setFormData(p => ({ ...p, visibility: value }))}
              />

              {/* ── Statut ── */}
              <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("editTrip.tripStatusLabel")}</Text>
              <RadioOptionCard
                options={statusOptions}
                selected={formData.status}
                isDark={isDark}
                colors={colors}
                onChange={value => setFormData(p => ({ ...p, status: value }))}
              />

              {/* ── Réservations ── */}
              <BookingsList
                bookings={bookings}
                colors={colors}
                onAdd={handleAddBookingPress}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
              />

              {/* ── Adresses ── */}
              <AddressesList
                addresses={addresses}
                colors={colors}
                onAdd={handleAddAddressPress}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
              />

              {/* ── Zone dangereuse ── */}
              {isOwner && (
                <EditTripDangerZone
                  dangerLight={colors.dangerLight}
                  sectionLabelColor={colors.textLight}
                  disabled={offlineDisabled}
                  onDelete={handleDeleteTrip}
                />
              )}

              <View style={{ height: 48 }} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      <BookingForm
        visible={showBookingForm}
        onClose={closeBookingForm}
        onSave={handleSaveBooking}
        initialBooking={editingBookingIndex === null ? undefined : bookings[editingBookingIndex]}
        tripStartDate={formData.startDate}
        tripEndDate={formData.endDate}
      />

      <ExistingBookingPicker
        visible={showBookingPicker}
        bookings={otherBookings}
        onSelect={(booking) => { handleCopyBooking(booking); setShowBookingPicker(false); }}
        onClose={() => setShowBookingPicker(false)}
      />

      <ExistingAddressPicker
        visible={showAddressPicker}
        addresses={otherAddresses}
        onSelect={(address) => { handleCopyAddress(address); setShowAddressPicker(false); }}
        onClose={() => setShowAddressPicker(false)}
      />
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root:    { flex: 1 },
  safeArea: { flex: 1 },
  scroll:  { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1,
  },
  headerTitle:   { flex: 1, textAlign: "center", fontSize: 20, fontFamily: F.sans700, marginHorizontal: 8 },
  savePill:      { borderRadius: 24, paddingHorizontal: 20, paddingVertical: 11, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 3 },
  savePillDisabled: { shadowOpacity: 0, elevation: 0 },
  savePillText:  { fontSize: 15, fontFamily: F.sans700, color: "#FFFFFF" },

  cover: {
    height: 160, marginHorizontal: 16, marginTop: 18, marginBottom: 6,
    borderRadius: 18, overflow: "hidden", justifyContent: "center", alignItems: "center",
  },
  coverBtn:      { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 28 },
  coverBtnEmoji: { fontSize: 18 },
  coverBtnText:  { fontSize: 15, fontFamily: F.sans600 },

  form: { paddingHorizontal: 18, paddingTop: 16 },

  field:         { borderWidth: 1, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, marginBottom: 12 },
  fieldLbl:      { fontSize: 12, fontFamily: F.sans600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput:    { fontSize: 18, fontFamily: F.sans400, padding: 0, margin: 0 },
  fieldMultiline: { minHeight: 90, textAlignVertical: "top" },
  fieldRow:      { flexDirection: "row", alignItems: "center", gap: 10 },
  fieldEmoji:    { fontSize: 18 },
  charCount:     { fontSize: 12, fontFamily: F.sans400, textAlign: "right", marginTop: 5 },

  dateRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  dateCol: { flex: 1 },

  sectionLbl: {
    fontSize: 13, fontFamily: F.sans700,
    textTransform: "uppercase", letterSpacing: 0.8,
    marginBottom: 10, marginTop: 10,
  },
});

export default EditTripScreen;
