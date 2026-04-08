import React from "react";
import {
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTranslation } from "react-i18next";
import BookingForm from "../components/BookingForm";
import { formatDate } from "../utils/i18n";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";

type EditTripRouteProp = RouteProp<RootStackParamList, "EditTrip">;

import useEditTrip from "../hooks/useEditTrip";
import FocusableField from "../components/editTrip/FocusableField";
import TripCalendar from "../components/editTrip/TripCalendar";
import RadioOptionCard, { RadioOption } from "../components/editTrip/RadioOptionCard";
import BookingsList from "../components/editTrip/BookingsList";

type EditTripNavigationProp = StackNavigationProp<RootStackParamList, "EditTrip">;

const EditTripScreen: React.FC = () => {
  const navigation = useNavigation<EditTripNavigationProp>();
  const route = useRoute<EditTripRouteProp>();
  const { t }      = useTranslation();
  const { colors, isDark } = useTheme();

  const {
    formData, setFormData,
    loading, initialLoading, isOwner,
    showCalendar, calendarPickingFor, calendarYear, calendarMonth,
    openCalendar, closeCalendar, handleCalendarDayPress, goToPrevMonth, goToNextMonth,
    bookings, showBookingForm, editingBookingIndex,
    handleAddBooking, handleEditBooking, handleDeleteBooking, handleSaveBooking, closeBookingForm,
    handlePickCoverPhoto, handleUpdateTrip, handleDeleteTrip, handleCancel,
  } = useEditTrip();

  const MONTHS = t("editTrip.monthNames").split(",");
  const DAYS   = t("editTrip.dayInitials").split(",");

  const visibilityOptions: RadioOption<"private" | "friends" | "public">[] = [
    { value: "private", label: t("editTrip.visibilityPrivate"), desc: t("editTrip.visibilityPrivateDesc"), emoji: "🔒", selBg: "#F5E5DC", selColor: "#C4714A", dotColor: "#C4714A" },
    { value: "friends", label: t("editTrip.visibilityFriends"), desc: t("editTrip.visibilityFriendsDesc"), emoji: "👥", selBg: "#DCF0F5", selColor: "#5A8FAA", dotColor: "#5A8FAA" },
    { value: "public",  label: t("editTrip.visibilityPublic"),  desc: t("editTrip.visibilityPublicDesc"),  emoji: "🌐", selBg: "#E2EDD9", selColor: "#6B8C5A", dotColor: "#6B8C5A" },
  ];

  const statusOptions: RadioOption<"draft" | "validated">[] = [
    { value: "draft",     label: t("editTrip.statusDraft"),     desc: t("editTrip.statusDraftDesc"),     emoji: "📝", selBg: "#EDE5D8", selColor: "#7A6A58", dotColor: "#7A6A58" },
    { value: "validated", label: t("editTrip.statusValidated"), desc: t("editTrip.statusValidatedDesc"), emoji: "✅", selBg: "#E2EDD9", selColor: "#6B8C5A", dotColor: "#6B8C5A" },
  ];

  if (initialLoading) {
    return (
      <View style={[s.root, { backgroundColor: colors.bg }]}>
        <SafeAreaView style={[s.safeArea, { backgroundColor: colors.bgLight }]} edges={["top"]}>
          {/* Header */}
          <View style={[s.header, { backgroundColor: colors.bgLight, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }]}>
            <SkeletonBox width={36} height={36} borderRadius={18} />
            <SkeletonBox width={140} height={20} borderRadius={8} />
          </View>
        </SafeAreaView>

        <ScrollView scrollEnabled={false} contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Cover photo */}
          <SkeletonBox width="100%" height={160} borderRadius={16} />

          {/* Form fields */}
          {[{ id: "f1", w: 1 }, { id: "f2", w: 0.6 }, { id: "f3", w: 1 }, { id: "f4", w: 0.7 }].map(({ id, w }) => (
            <View key={id} style={{ gap: 8 }}>
              <SkeletonBox width={100} height={12} borderRadius={5} />
              <SkeletonBox width={`${w * 100}%`} height={52} borderRadius={10} />
            </View>
          ))}

          {/* Date row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width={80} height={12} borderRadius={5} />
                <SkeletonBox width="100%" height={52} borderRadius={10} />
              </View>
            ))}
          </View>

          {/* Visibility selector */}
          <View style={{ gap: 8 }}>
            <SkeletonBox width={90} height={12} borderRadius={5} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <SkeletonBox key={i} height={64} borderRadius={12} style={{ flex: 1 }} />
              ))}
            </View>
          </View>

          {/* Save button */}
          <SkeletonBox width="100%" height={52} borderRadius={12} style={{ marginTop: 8 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgLight} />
      <SafeAreaView style={[s.safeArea, { backgroundColor: colors.bgLight }]} edges={["top"]}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={[s.header, { backgroundColor: colors.bgLight, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: colors.bgMid }]}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textMid} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>{t("editTrip.screenTitle")}</Text>
          <TouchableOpacity
            style={[s.savePill, loading && s.savePillDisabled]}
            onPress={handleUpdateTrip}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.savePillText}>{loading ? "…" : t("editTrip.saveButton")}</Text>
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={closeCalendar}>
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* ── Photo de couverture ─────────────────────────────────────────── */}
            <TouchableOpacity style={s.cover} onPress={handlePickCoverPhoto} activeOpacity={0.9}>
              {formData.coverImage ? (
                <>
                  <Image
                    source={{ uri: formData.coverImage }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(15,8,2,0.55)"]}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0.3 }}
                    end={{ x: 0, y: 1 }}
                  />
                </>
              ) : (
                <LinearGradient colors={["#3A3020", "#1E1A10"]} style={StyleSheet.absoluteFillObject} />
              )}
              <View style={s.coverBtn}>
                <Text style={s.coverBtnEmoji}>📸</Text>
                <Text style={s.coverBtnText}>{t("editTrip.changeCoverPhoto")}</Text>
              </View>
            </TouchableOpacity>

            <View style={s.form}>

              {/* ── Nom du voyage ─────────────────────────────────────────────── */}
              <FocusableField
                baseStyle={[s.field, { backgroundColor: colors.surface }]}
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

              {/* ── Destination ───────────────────────────────────────────────── */}
              <FocusableField
                baseStyle={[s.field, { backgroundColor: colors.surface }]}
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

              {/* ── Dates ─────────────────────────────────────────────────────── */}
              <View style={s.dateRow}>
                <View style={s.dateCol}>
                  <TouchableOpacity
                    style={[
                      s.field, s.fieldNoMargin,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      showCalendar && calendarPickingFor === "start" && s.fieldActive,
                    ]}
                    onPress={() => openCalendar("start")}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      s.fieldLbl, { color: colors.textLight },
                      showCalendar && calendarPickingFor === "start" && { color: "#C4714A" },
                    ]}>
                      {t("editTrip.departureDateLabel")}
                      {showCalendar && calendarPickingFor === "start" ? " ✎" : ""}
                    </Text>
                    <View style={s.fieldRow}>
                      <Text style={s.fieldEmoji}>📅</Text>
                      <Text style={[
                        s.dateVal, { color: colors.text },
                        showCalendar && calendarPickingFor === "start" && { color: "#C4714A", fontFamily: F.sans700 },
                      ]}>
                        {formatDate(formData.startDate)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={s.dateCol}>
                  <TouchableOpacity
                    style={[
                      s.field, s.fieldNoMargin,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      showCalendar && calendarPickingFor === "end" && s.fieldActive,
                    ]}
                    onPress={() => openCalendar("end")}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      s.fieldLbl, { color: colors.textLight },
                      showCalendar && calendarPickingFor === "end" && { color: "#C4714A" },
                    ]}>
                      {t("editTrip.returnDateLabel")}
                      {showCalendar && calendarPickingFor === "end" ? " ✎" : ""}
                    </Text>
                    <View style={s.fieldRow}>
                      <Text style={s.fieldEmoji}>📅</Text>
                      <Text style={[
                        s.dateVal, { color: colors.text },
                        showCalendar && calendarPickingFor === "end" && { color: "#C4714A", fontFamily: F.sans700 },
                      ]}>
                        {formatDate(formData.endDate)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Calendrier ────────────────────────────────────────────────── */}
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
                  colors={{
                    surface:  colors.surface,
                    border:   colors.border,
                    bgMid:    colors.bgMid,
                    text:     colors.text,
                    textMid:  colors.textMid,
                  }}
                  onPrevMonth={goToPrevMonth}
                  onNextMonth={goToNextMonth}
                  onDayPress={handleCalendarDayPress}
                />
              )}

              {/* ── Description ───────────────────────────────────────────────── */}
              <FocusableField
                baseStyle={[s.field, { backgroundColor: colors.surface }]}
                render={({ onFocus, onBlur }) => (
                  <>
                    <Text style={[s.fieldLbl, { color: colors.textLight }]}>{t("editTrip.descriptionLabel")}</Text>
                    <TextInput
                      style={[s.fieldInput, s.fieldMultiline, { color: colors.text }]}
                      value={formData.description}
                      onChangeText={v => setFormData(p => ({ ...p, description: v }))}
                      placeholder={t("editTrip.descriptionPlaceholder")}
                      placeholderTextColor={colors.textLight}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                      onFocus={() => { onFocus(); closeCalendar(); }}
                      onBlur={onBlur}
                    />
                    <Text style={[s.charCount, { color: colors.textLight }]}>
                      {formData.description.length}/500
                    </Text>
                  </>
                )}
              />

              {/* ── Membres ───────────────────────────────────────────────────── */}
              <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("editTrip.membersLabel")}</Text>
              <TouchableOpacity
                style={[s.membersBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate("InviteFriends", { tripId: route.params.tripId })}
                activeOpacity={0.75}
              >
                <View style={s.membersBtnIcon}>
                  <Text style={{ fontSize: 16 }}>👥</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.membersBtnLabel, { color: colors.text }]}>{t("editTrip.manageMembers")}</Text>
                  <Text style={[s.membersBtnDesc, { color: colors.textLight }]}>{t("editTrip.manageMembersSubtitle")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.border} />
              </TouchableOpacity>

              {/* ── Visibilité ────────────────────────────────────────────────── */}
              <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("editTrip.visibilityLabel")}</Text>
              <RadioOptionCard
                options={visibilityOptions}
                selected={formData.visibility}
                isDark={isDark}
                colors={colors}
                onChange={value => setFormData(p => ({ ...p, visibility: value }))}
              />

              {/* ── Statut ────────────────────────────────────────────────────── */}
              <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("editTrip.tripStatusLabel")}</Text>
              <RadioOptionCard
                options={statusOptions}
                selected={formData.status}
                isDark={isDark}
                colors={colors}
                onChange={value => setFormData(p => ({ ...p, status: value }))}
              />

              {/* ── Réservations ──────────────────────────────────────────────── */}
              <BookingsList
                bookings={bookings}
                colors={colors}
                onAdd={handleAddBooking}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
              />

              {/* ── Zone dangereuse ───────────────────────────────────────────── */}
              {isOwner && (
                <>
                  <Text style={[s.sectionLbl, { marginTop: 8 }]}>{t("editTrip.dangerZone")}</Text>
                  <TouchableOpacity
                    style={[s.dangerRow, { backgroundColor: colors.dangerLight }]}
                    onPress={handleDeleteTrip}
                    activeOpacity={0.8}
                  >
                    <View style={s.dangerIcon}>
                      <Text style={{ fontSize: 20 }}>🗑</Text>
                    </View>
                    <View style={s.dangerInfo}>
                      <Text style={s.dangerLabel}>{t("editTrip.deleteTrip")}</Text>
                      <Text style={s.dangerDesc}>{t("editTrip.deleteTripSubtitle")}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#C04040" />
                  </TouchableOpacity>
                </>
              )}

              <View style={{ height: 48 }} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      {/* ── Modal formulaire réservation ──────────────────────────────────────── */}
      <BookingForm
        visible={showBookingForm}
        onClose={closeBookingForm}
        onSave={handleSaveBooking}
        initialBooking={editingBookingIndex === null ? undefined : bookings[editingBookingIndex]}
        tripStartDate={formData.startDate}
        tripEndDate={formData.endDate}
      />
    </KeyboardAvoidingView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:             { flex: 1 },
  safeArea:         { flex: 1 },
  scroll:           { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText:      { fontSize: 19, fontFamily: F.sans400 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 22, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: {
    flex: 1, textAlign: "center",
    fontSize: 20, fontFamily: F.sans700,
    marginHorizontal: 8,
  },
  savePill: {
    backgroundColor: "#C4714A", borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 11,
    shadowColor: "#C4714A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  savePillDisabled: { backgroundColor: "#B0A090", shadowOpacity: 0, elevation: 0 },
  savePillText:     { fontSize: 15, fontFamily: F.sans700, color: "#FFFFFF" },

  cover: {
    height: 160, marginHorizontal: 16, marginTop: 18, marginBottom: 6,
    borderRadius: 18, overflow: "hidden",
    justifyContent: "center", alignItems: "center",
  },
  coverBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.90)",
    paddingHorizontal: 20, paddingVertical: 11, borderRadius: 28,
  },
  coverBtnEmoji: { fontSize: 18 },
  coverBtnText:  { fontSize: 15, fontFamily: F.sans600, color: "#2A2318" },

  form: { paddingHorizontal: 18, paddingTop: 16 },

  field: {
    borderWidth: 1, borderColor: "#D8CCBA",
    borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 14,
    marginBottom: 12,
  },
  fieldActive: {
    borderColor: "#C4714A",
    shadowColor: "#C4714A", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18, shadowRadius: 5, elevation: 2,
  },
  fieldNoMargin:  { marginBottom: 0 },
  fieldLbl: {
    fontSize: 12, fontFamily: F.sans600, color: "#B0A090",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
  },
  fieldInput:     { fontSize: 18, fontFamily: F.sans400, padding: 0, margin: 0 },
  fieldMultiline: { minHeight: 90, textAlignVertical: "top" },
  fieldRow:       { flexDirection: "row", alignItems: "center", gap: 10 },
  fieldEmoji:     { fontSize: 18 },
  charCount:      { fontSize: 12, fontFamily: F.sans400, textAlign: "right", marginTop: 5 },

  dateRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  dateCol: { flex: 1 },
  dateVal: { fontSize: 17, fontFamily: F.sans500 },

  sectionLbl: {
    fontSize: 13, fontFamily: F.sans700,
    textTransform: "uppercase", letterSpacing: 0.8,
    marginBottom: 10, marginTop: 10,
  },

  membersBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  membersBtnIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#DCF0F5", alignItems: "center", justifyContent: "center",
  },
  membersBtnLabel: { fontFamily: F.sans600, fontSize: 14 },
  membersBtnDesc:  { fontFamily: F.sans400, fontSize: 12, marginTop: 2 },

  dangerRow: {
    borderWidth: 1,
    borderColor: "rgba(192,64,64,0.18)", borderRadius: 18,
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 18, paddingVertical: 18, marginBottom: 10,
  },
  dangerIcon: {
    width: 50, height: 50, borderRadius: 13,
    backgroundColor: "rgba(192,64,64,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  dangerInfo:  { flex: 1 },
  dangerLabel: { fontSize: 17, fontFamily: F.sans600, color: "#C04040" },
  dangerDesc:  { fontSize: 13, fontFamily: F.sans400, color: "#C04040", opacity: 0.75, marginTop: 3 },
});

export default EditTripScreen;
