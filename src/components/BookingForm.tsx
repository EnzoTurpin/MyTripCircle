import React from "react";
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
  FlatList,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Booking } from "../types";
import { formatDate } from "../utils/i18n";
import TicketScannerModal from "./TicketScannerModal";
import i18n from "i18next";
import { F } from "../theme/fonts";
import { RADIUS, SHADOW } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useBookingForm, needsEndDate } from "../hooks/useBookingForm";

// ─── Constantes ──────────────────────────────────────────────────────────────

const getTypeLabels = (t: (key: string) => string): Record<string, string> => ({
  flight:     t("bookings.typeLabels.flight"),
  hotel:      t("bookings.typeLabels.hotel"),
  train:      t("bookings.typeLabels.train"),
  restaurant: t("bookings.typeLabels.restaurant"),
  activity:   t("bookings.typeLabels.activity"),
});

const TYPE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  flight:     { border: "#5A8FAA", bg: "#DCF0F5", text: "#5A8FAA" },
  hotel:      { border: "#6B8C5A", bg: "#E2EDD9", text: "#6B8C5A" },
  train:      { border: "#C4714A", bg: "#F5E5DC", text: "#C4714A" },
  restaurant: { border: "#C4714A", bg: "#F5E5DC", text: "#C4714A" },
  activity:   { border: "#8B70C0", bg: "#EDE8F5", text: "#8B70C0" },
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#6B8C5A",
  pending:   "#FF9500",
  cancelled: "#C04040",
};

// ─── Sub-component : modal picker iOS ────────────────────────────────────────

interface PickerModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  colors: any;
  t: (key: string) => string;
}

const PickerModal: React.FC<PickerModalProps> = ({ visible, title, onClose, children, colors, t }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.pickerModalOverlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={(e) => e.stopPropagation()}
        style={[styles.pickerModalContent, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.pickerModalTitle, { color: colors.text }]}>{title}</Text>
        <View style={styles.pickerWrapper}>{children}</View>
        <View style={styles.pickerButtons}>
          <TouchableOpacity style={styles.pickerCancelButton} onPress={onClose}>
            <Text style={styles.pickerCancelText}>{t("common.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerConfirmButton} onPress={onClose}>
            <Text style={styles.pickerConfirmText}>{t("common.confirm")}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookingFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (booking: Omit<Booking, "id" | "createdAt" | "updatedAt">) => void;
  initialBooking?: Partial<Booking>;
  tripStartDate?: Date;
  tripEndDate?: Date;
  preselectedTripId?: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────

const BookingForm: React.FC<BookingFormProps> = (props) => {
  const { visible, onClose, initialBooking } = props;
  const { t }      = useTranslation();
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const TYPE_LABELS = getTypeLabels(t);

  const form = useBookingForm(props);

  const STATUSES: Booking["status"][]    = ["confirmed", "pending", "cancelled"];

  const statusLabel = (s: Booking["status"]) =>
    t(`bookings.status.${s}`) || s;

  const renderTypePill = (type: Booking["type"]) => {
    const isSelected  = form.formData.type === type;
    const typeColor   = TYPE_COLORS[type];
    return (
      <TouchableOpacity
        key={type}
        style={[
          styles.typePill,
          isSelected
            ? { backgroundColor: typeColor.bg, borderColor: typeColor.border, borderWidth: 1.5 }
            : { backgroundColor: colors.bgMid, borderColor: colors.border, borderWidth: 1 },
        ]}
        onPress={() => form.handleInputChange("type", type)}
        activeOpacity={0.7}
      >
        <Text style={[styles.typePillText, { color: isSelected ? typeColor.text : colors.textMid }]}>
          {TYPE_LABELS[type]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["bottom", "left", "right"]}>

        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 6, backgroundColor: colors.bg, borderBottomColor: colors.bgMid }]}>
          <TouchableOpacity style={[styles.headerBackBtn, { backgroundColor: colors.bgMid }]} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {initialBooking ? t("bookings.editBooking") : t("bookings.newBooking")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Scan ── */}
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: colors.bgMid, borderColor: colors.border }]}
            onPress={() => form.setShowScanner(true)}
            activeOpacity={0.75}
          >
            <Ionicons name="scan-outline" size={20} color="#5A8FAA" style={{ marginRight: 8 }} />
            <Text style={[styles.scanButtonText, { color: "#5A8FAA" }]}>{t("bookings.scanTicketButton")}</Text>
          </TouchableOpacity>

          {/* ── Type ── */}
          <View style={styles.typePillsContainer}>
            <View style={styles.typePillsRow}>
              {(["flight", "train", "hotel"] as Booking["type"][]).map(renderTypePill)}
            </View>
            <View style={styles.typePillsRow}>
              {(["restaurant", "activity"] as Booking["type"][]).map(renderTypePill)}
            </View>
          </View>

          {/* ── Titre ── */}
          <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }, form.fieldErrors.title ? styles.fieldBoxError : null]}>
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.title")} *</Text>
            <TextInput
              style={[styles.fieldInput, { color: colors.text }, form.fieldErrors.title ? styles.fieldInputError : null]}
              value={form.formData.title}
              onChangeText={(v) => { form.handleInputChange("title", v); if (form.fieldErrors.title) form.setFieldErrors((e) => ({ ...e, title: undefined })); }}
              placeholder={t("bookings.titlePlaceholder")}
              placeholderTextColor={colors.textLight}
            />
            {form.fieldErrors.title ? <Text style={styles.inlineError}>{form.fieldErrors.title}</Text> : null}
          </View>

          {/* ── Date + Heure ── */}
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.fieldBox, styles.dateRowItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => form.setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fieldLabel, { color: colors.textLight }]}>
                {needsEndDate(form.formData.type) ? t("bookings.startDate") : t("bookings.date")}
              </Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>{formatDate(form.formData.date)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.fieldBox, styles.dateRowItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => form.setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.time")}</Text>
              <Text style={[styles.fieldValue, { color: form.formData.time ? colors.text : colors.textLight }]}>
                {form.formData.time || "12:00"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* iOS pickers */}
          {Platform.OS === "ios" && (
            <>
              <PickerModal visible={form.showDatePicker} title={needsEndDate(form.formData.type) ? t("bookings.startDate") : t("bookings.date")} onClose={() => form.setShowDatePicker(false)} colors={colors} t={t}>
                <DateTimePicker value={form.formData.date instanceof Date && !Number.isNaN(form.formData.date.getTime()) ? form.formData.date : new Date()} mode="date" display="spinner" onChange={(e, d) => form.handleDateChange(e, d, "start")} textColor={colors.text} locale={i18n.language === "fr" ? "fr_FR" : "en_US"} />
              </PickerModal>
              <PickerModal visible={form.showTimePicker} title={t("bookings.time")} onClose={() => form.setShowTimePicker(false)} colors={colors} t={t}>
                <DateTimePicker value={form.getTimePickerValue()} mode="time" display="spinner" onChange={form.handleTimeChange} textColor={colors.text} />
              </PickerModal>
            </>
          )}

          {/* ── Date de fin (hôtel) ── */}
          {needsEndDate(form.formData.type) && (
            <TouchableOpacity
              style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }, form.fieldErrors.endDate ? styles.fieldBoxError : null]}
              onPress={() => form.setShowEndDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.endDate")} *</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>{formatDate(form.formData.endDate || new Date())}</Text>
              {form.fieldErrors.endDate ? <Text style={styles.inlineError}>{form.fieldErrors.endDate}</Text> : null}
            </TouchableOpacity>
          )}
          {Platform.OS === "ios" && (
            <PickerModal visible={form.showEndDatePicker} title={t("bookings.endDate")} onClose={() => form.setShowEndDatePicker(false)} colors={colors} t={t}>
              <DateTimePicker value={form.formData.endDate instanceof Date && !Number.isNaN(form.formData.endDate.getTime()) ? form.formData.endDate : new Date()} mode="date" display="spinner" onChange={(e, d) => form.handleDateChange(e, d, "end")} textColor={colors.text} locale={i18n.language === "fr" ? "fr_FR" : "en_US"} />
            </PickerModal>
          )}

          {/* ── Adresse ── */}
          <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.address")}</Text>
            <TextInput style={[styles.fieldInput, { color: colors.text }]} value={form.formData.address} onChangeText={form.handleAddressChange} placeholder={t("bookings.addressPlaceholder")} placeholderTextColor={colors.textLight} />
            {form.showAddressSuggestions && form.addressSuggestions.length > 0 && (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FlatList
                  data={form.addressSuggestions}
                  keyExtractor={(item) => item.placeId}
                  scrollEnabled={false}
                  style={styles.suggestionsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.suggestionItem, { borderBottomColor: colors.bgMid }]} onPress={() => form.handleSelectAddress(item)}>
                      <Ionicons name="location" size={16} color={colors.textMid} style={styles.suggestionIcon} />
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* ── Statut ── */}
          <View style={[styles.fieldBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{t("bookings.statusLabel")}</Text>
            <View style={styles.statusRow}>
              {STATUSES.map((status) => {
                const color = STATUS_COLORS[status] || "#7A6A58";
                const isSelected = form.formData.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusPill, { backgroundColor: isSelected ? `${color}20` : colors.bgMid, borderColor: isSelected ? color : colors.border, borderWidth: isSelected ? 1.5 : 1 }]}
                    onPress={() => form.handleInputChange("status", status)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.statusPillText, { color: isSelected ? color : colors.textMid, fontFamily: isSelected ? F.sans600 : F.sans400 }]}>
                      {statusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Pièces jointes ── */}
          <View style={styles.attachmentSection}>
            {form.attachments.map((attachment) => (
              <View key={attachment.uri} style={[styles.attachmentItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {attachment.type === "image" && (attachment.uri.startsWith("file://") || attachment.uri.startsWith("content://") || attachment.uri.startsWith("ph://")) ? (
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentThumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.attachmentIcon, { backgroundColor: colors.bgLight }]}>
                    <Ionicons name={attachment.type === "pdf" ? "document" : "image"} size={22} color="#C4714A" />
                  </View>
                )}
                <Text style={[styles.attachmentName, { color: colors.text }]} numberOfLines={1}>{attachment.name}</Text>
                <TouchableOpacity style={styles.renameAttachmentButton} onPress={() => form.handleOpenRename(index)}>
                  <Ionicons name="pencil" size={16} color="#C4714A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeAttachmentButton} onPress={() => form.handleRemoveAttachment(index)}>
                  <Ionicons name="close-circle" size={22} color="#C04040" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.attachmentDashedBox}
              onPress={() => Alert.alert(t("bookings.attachmentTitle"), t("bookings.chooseFileType"), [
                { text: t("bookings.imageOption"), onPress: form.handlePickImage },
                { text: t("bookings.pdfOption"),   onPress: form.handlePickDocument },
                { text: t("common.cancel"), style: "cancel" },
              ])}
              activeOpacity={0.7}
            >
              <Text style={styles.attachmentDashedText}>{t("bookings.addAttachment")}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Bouton principal ── */}
          <TouchableOpacity style={styles.primaryButton} onPress={form.handleSave} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {initialBooking ? t("common.save") : t("bookings.newBooking")}
            </Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Android pickers */}
        {Platform.OS === "android" && form.showDatePicker && (
          <DateTimePicker value={form.formData.date instanceof Date && !Number.isNaN(form.formData.date.getTime()) ? form.formData.date : new Date()} mode="date" display="default" onChange={(e, d) => form.handleDateChange(e, d, "start")} />
        )}
        {Platform.OS === "android" && form.showEndDatePicker && (
          <DateTimePicker value={form.formData.endDate instanceof Date && !Number.isNaN(form.formData.endDate.getTime()) ? form.formData.endDate : new Date()} mode="date" display="default" onChange={(e, d) => form.handleDateChange(e, d, "end")} />
        )}
        {Platform.OS === "android" && form.showTimePicker && (
          <DateTimePicker value={form.getTimePickerValue()} mode="time" display="default" onChange={form.handleTimeChange} />
        )}

        {/* Scanner */}
        <TicketScannerModal visible={form.showScanner} onClose={() => form.setShowScanner(false)} onFill={form.handleScanFill} />

        {/* Modal renommage pièce jointe */}
        <Modal visible={form.renamingIndex !== null} transparent animationType="fade">
          <View style={styles.renameOverlay}>
            <View style={[styles.renameModal, { backgroundColor: colors.surface }]}>
              <Text style={[styles.renameTitle, { color: colors.text }]}>{t("bookings.renameFileTitle")}</Text>
              <Text style={[styles.renameSubtitle, { color: colors.textLight }]}>{t("bookings.renameFileSubtitle")}</Text>
              <TextInput
                style={[styles.renameInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                value={form.renameValue}
                onChangeText={form.setRenameValue}
                placeholder={t("bookings.renamePlaceholder")}
                placeholderTextColor={colors.textLight}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={form.handleConfirmRename}
              />
              <View style={styles.renameButtons}>
                <TouchableOpacity style={styles.renameCancelBtn} onPress={() => form.setRenamingIndex(null)}>
                  <Text style={styles.renameCancelText}>{t("common.cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.renameConfirmBtn, !form.renameValue.trim() && { opacity: 0.5 }]} onPress={form.handleConfirmRename} disabled={!form.renameValue.trim()}>
                  <Text style={styles.renameConfirmText}>{t("common.confirm")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22, fontFamily: F.sans700,
    flex: 1, textAlign: "center", marginHorizontal: 8,
  },
  scrollContent: { paddingBottom: 40 },
  scanButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 20, marginBottom: 4, marginHorizontal: 20,
    paddingVertical: 13, paddingHorizontal: 20,
    borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed",
  },
  scanButtonText: { fontSize: 15, fontFamily: F.sans600 },
  typePillsContainer: { marginTop: 20, marginBottom: 8, gap: 12 },
  typePillsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
  typePill: { borderRadius: 24, paddingVertical: 11, paddingHorizontal: 20 },
  typePillText: { fontSize: 16, fontFamily: F.sans600 },
  fieldBox: {
    backgroundColor: "#FFFFFF", borderRadius: RADIUS.card, borderWidth: 1,
    paddingHorizontal: 18, paddingVertical: 16, marginHorizontal: 20, marginBottom: 12,
  },
  fieldLabel: { fontSize: 13, fontFamily: F.sans400, marginBottom: 6 },
  fieldValue: { fontSize: 18, fontFamily: F.sans400 },
  fieldInput: { fontSize: 18, fontFamily: F.sans400, padding: 0, margin: 0 },
  fieldBoxError: { borderColor: "#C04040", borderWidth: 1.5 },
  fieldInputError: { color: "#C04040" },
  inlineError: { fontSize: 12, color: "#C04040", marginTop: 4, fontFamily: F.sans400 },
  dateRow: { flexDirection: "row", marginHorizontal: 20, marginBottom: 0, gap: 10 },
  dateRowItem: { flex: 1, marginHorizontal: 0, marginBottom: 10 },
  statusRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  statusPill: { flex: 1, borderRadius: 20, paddingVertical: 13, alignItems: "center" },
  statusPillText: { fontSize: 15 },
  attachmentSection: { marginHorizontal: 20, marginBottom: 10 },
  attachmentDashedBox: {
    borderRadius: 16, borderWidth: 1.5, borderColor: "#D8CCBA", borderStyle: "dashed",
    padding: 20, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
  },
  attachmentDashedText: { fontSize: 16, fontFamily: F.sans400, color: "#B0A090" },
  attachmentItem: {
    flexDirection: "row", alignItems: "center", borderRadius: RADIUS.button,
    padding: 12, marginBottom: 10, borderWidth: 1,
  },
  attachmentThumbnail: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  attachmentIcon: {
    width: 50, height: 50, borderRadius: 8,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  attachmentName: { flex: 1, fontSize: 14, fontFamily: F.sans400, marginRight: 8 },
  renameAttachmentButton: { padding: 4, marginRight: 4 },
  removeAttachmentButton: { padding: 4 },
  primaryButton: {
    backgroundColor: "#C4714A", borderRadius: RADIUS.card,
    paddingVertical: 19, marginHorizontal: 20, marginTop: 14,
    alignItems: "center", ...SHADOW.medium,
  },
  primaryButtonText: { fontSize: 19, fontFamily: F.sans700, color: "#FFFFFF" },
  pickerModalOverlay: {
    flex: 1, backgroundColor: "rgba(42, 35, 24, 0.5)",
    justifyContent: "center", alignItems: "center",
  },
  pickerModalContent: {
    borderRadius: 20, padding: 20, width: "90%", maxWidth: 400,
    shadowColor: "#2A2318", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
  },
  pickerModalTitle: { fontSize: 20, fontFamily: F.sans700, marginBottom: 15, textAlign: "center" },
  pickerWrapper: {
    backgroundColor: "#FDFAF5", borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: "#D8CCBA", minHeight: 200,
    justifyContent: "center", alignItems: "center",
  },
  pickerButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 12 },
  pickerCancelButton: {
    flex: 1, backgroundColor: "#FFFFFF", paddingVertical: 14,
    borderRadius: RADIUS.button, alignItems: "center", borderWidth: 2, borderColor: "#D8CCBA",
  },
  pickerCancelText: { color: "#7A6A58", fontSize: 16, fontFamily: F.sans600 },
  pickerConfirmButton: {
    flex: 1, backgroundColor: "#C4714A", paddingVertical: 14,
    borderRadius: RADIUS.button, alignItems: "center",
  },
  pickerConfirmText: { color: "white", fontSize: 16, fontFamily: F.sans700 },
  renameOverlay: {
    flex: 1, backgroundColor: "rgba(42, 35, 24, 0.5)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  renameModal: { borderRadius: 20, padding: 24, width: "100%", ...SHADOW.strong },
  renameTitle: { fontSize: 18, fontFamily: F.sans700, marginBottom: 4 },
  renameSubtitle: { fontSize: 13, fontFamily: F.sans400, marginBottom: 16 },
  renameInput: {
    borderRadius: RADIUS.button, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: F.sans400, marginBottom: 16,
  },
  renameButtons: { flexDirection: "row", gap: 12 },
  renameCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.button,
    borderWidth: 1.5, borderColor: "#D8CCBA", alignItems: "center",
  },
  renameCancelText: { fontSize: 15, fontFamily: F.sans600, color: "#7A6A58" },
  renameConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.button,
    backgroundColor: "#C4714A", alignItems: "center",
  },
  renameConfirmText: { fontSize: 15, fontFamily: F.sans700, color: "white" },
  suggestionsContainer: {
    marginTop: 8, borderRadius: RADIUS.button, borderWidth: 1,
    shadowColor: "#2A2318", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 10,
  },
  suggestionsList: { maxHeight: 150 },
  suggestionItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  suggestionIcon: { marginRight: 12 },
  suggestionText: { flex: 1, fontSize: 14, fontFamily: F.sans400 },
});

export default BookingForm;
