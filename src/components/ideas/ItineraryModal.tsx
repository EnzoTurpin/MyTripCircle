import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView as RNScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDate } from "../../utils/i18n";
import { F } from "../../theme/fonts";
import { useTheme } from "../../contexts/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  cityInput: string;
  onCityChange: (v: string) => void;
  daysInput: string;
  onDaysChange: (v: string) => void;
  loading: boolean;
  itinerary: any;
  showCreateStep: boolean;
  onShowCreateStep: () => void;
  onBackFromCreate: () => void;
  startDate: Date;
  onStartDateChange: (d: Date) => void;
  showDatePicker: boolean;
  onToggleDatePicker: (show: boolean) => void;
  creating: boolean;
  onGenerate: () => void;
  onCreateTrip: () => void;
  onNewSearch: () => void;
};

const ItineraryModal: React.FC<Props> = ({
  visible,
  onClose,
  cityInput,
  onCityChange,
  daysInput,
  onDaysChange,
  loading,
  itinerary,
  showCreateStep,
  onShowCreateStep,
  onBackFromCreate,
  startDate,
  onStartDateChange,
  showDatePicker,
  onToggleDatePicker,
  creating,
  onGenerate,
  onCreateTrip,
  onNewSearch,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("ideas.itinerary.title")}
            </Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {t("ideas.itinerary.subtitle")}
          </Text>

          {!itinerary && (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder={t("ideas.itinerary.cityPlaceholder")}
                placeholderTextColor={colors.textLight}
                value={cityInput}
                onChangeText={onCityChange}
                returnKeyType="next"
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder={t("ideas.itinerary.daysPlaceholder")}
                placeholderTextColor={colors.textLight}
                value={daysInput}
                onChangeText={onDaysChange}
                keyboardType="number-pad"
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.primaryBtn, { opacity: loading || !cityInput.trim() ? 0.6 : 1 }]}
                onPress={onGenerate}
                disabled={loading || !cityInput.trim()}
                activeOpacity={0.8}
              >
                {loading
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.primaryBtnText}>{t("ideas.itinerary.generate")}</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {itinerary && !showCreateStep && (
            <RNScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.cityTitle, { color: colors.text }]}>
                📍 {itinerary.city}
              </Text>

              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => onDaysChange(String(Math.max(1, parseInt(daysInput, 10) - 1)))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#C4714A" />
                </TouchableOpacity>
                <Text style={[styles.stepperText, { color: colors.text }]}>
                  {daysInput} {t("ideas.addModal.days")}
                </Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => onDaysChange(String(Math.min(30, parseInt(daysInput, 10) + 1)))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#C4714A" />
                </TouchableOpacity>
                {parseInt(daysInput, 10) !== itinerary.days?.length && (
                  <TouchableOpacity
                    style={[styles.regenerateBtn, { opacity: loading ? 0.6 : 1 }]}
                    onPress={onGenerate}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading
                      ? <ActivityIndicator size="small" color="#FFF" />
                      : <Text style={styles.regenerateBtnText}>{t("ideas.itinerary.regenerate")}</Text>
                    }
                  </TouchableOpacity>
                )}
              </View>

              {itinerary.days?.map((d: any) => (
                <View key={d.day} style={[styles.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={styles.dayTitle}>
                    {t("ideas.itinerary.day")} {d.day} — {d.title}
                  </Text>
                  {[
                    { emoji: "🌅", label: t("ideas.itinerary.morning"),   data: d.morning },
                    { emoji: "☀️", label: t("ideas.itinerary.afternoon"), data: d.afternoon },
                    { emoji: "🌙", label: t("ideas.itinerary.evening"),   data: d.evening },
                  ].map(({ emoji, label, data }) => data && (
                    <View key={label} style={styles.slotRow}>
                      <Text style={styles.slotEmoji}>{emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slotLabel, { color: colors.textMid }]}>{label}</Text>
                        <Text style={[styles.slotActivity, { color: colors.text }]}>{data.activity}</Text>
                        {data.tip && <Text style={[styles.slotTip, { color: colors.textLight }]}>💡 {data.tip}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.primaryBtn, { marginBottom: 8 }]}
                onPress={() => { onDaysChange(daysInput); onShowCreateStep(); }}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>{t("ideas.itinerary.createTrip")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: "#C4714A", marginBottom: 20 }]}
                onPress={onNewSearch}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryBtnText, { color: "#C4714A" }]}>{t("ideas.itinerary.newSearch")}</Text>
              </TouchableOpacity>
            </RNScrollView>
          )}

          {itinerary && showCreateStep && (
            <View style={{ flex: 1 }}>
              <Text style={[styles.cityTitle, { color: colors.text }]}>
                📍 {itinerary.city}
              </Text>
              <Text style={[styles.slotLabel, { color: colors.textLight, marginBottom: 12 }]}>
                {daysInput} {t("ideas.addModal.days")}
              </Text>
              <Text style={[styles.slotLabel, { color: colors.textMid, marginBottom: 8, textTransform: "none", letterSpacing: 0 }]}>
                {t("ideas.itinerary.pickStartDate")}
              </Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, justifyContent: "center" }]}
                onPress={() => onToggleDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.text, fontSize: 15, fontFamily: F.sans400 }}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    onToggleDatePicker(Platform.OS === "ios");
                    if (date) onStartDateChange(date);
                  }}
                />
              )}
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 16, opacity: creating ? 0.6 : 1 }]}
                onPress={onCreateTrip}
                disabled={creating}
                activeOpacity={0.8}
              >
                {creating
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.primaryBtnText}>{t("ideas.itinerary.createTrip")}</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 }]}
                onPress={onBackFromCreate}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryBtnText, { color: colors.textMid }]}>←</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
    minHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: F.sans700,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: F.sans400,
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: F.sans400,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#C4714A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  primaryBtnText: {
    fontFamily: F.sans600,
    fontSize: 15,
    color: "#FFFFFF",
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cityTitle: {
    fontFamily: F.sans700,
    fontSize: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    fontFamily: F.sans600,
    fontSize: 15,
    minWidth: 60,
    textAlign: "center",
  },
  regenerateBtn: {
    flex: 1,
    backgroundColor: "#C4714A",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateBtnText: {
    fontFamily: F.sans600,
    fontSize: 13,
    color: "#FFFFFF",
  },
  dayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  dayTitle: {
    fontFamily: F.sans700,
    fontSize: 15,
    marginBottom: 12,
    color: "#C4714A",
  },
  slotRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  slotEmoji: {
    fontSize: 18,
    marginTop: 1,
  },
  slotLabel: {
    fontFamily: F.sans500,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  slotActivity: {
    fontFamily: F.sans500,
    fontSize: 13,
    lineHeight: 18,
  },
  slotTip: {
    fontFamily: F.sans400,
    fontSize: 12,
    marginTop: 3,
    fontStyle: "italic",
  },
});

export default ItineraryModal;
