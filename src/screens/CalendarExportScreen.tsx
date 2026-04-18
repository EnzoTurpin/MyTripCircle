import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Clipboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import BackButton from "../components/ui/BackButton";
import { useTheme } from "../contexts/ThemeContext";
import { calendarApi } from "../services/api/calendarApi";
import { API_BASE_URL } from "../config/api";
import { F } from "../theme/fonts";

const CalendarExportScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const calendarUrl = token ? `${API_BASE_URL}/calendar/${token}` : null;

  const fetchToken = useCallback(async () => {
    try {
      const res = await calendarApi.getToken();
      setToken(res.token);
    } catch {
      // pas de token encore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await calendarApi.generateToken();
      setToken(res.token);
    } catch {
      Alert.alert(t("calendar.errorTitle"), t("calendar.errorGenerate"));
    } finally {
      setGenerating(false);
    }
  };

  const renderUrlSection = () => {
    if (loading) {
      return (
        <Text style={[styles.placeholder, { color: colors.textLight }]}>
          {t("common.loading")}
        </Text>
      );
    }
    if (calendarUrl) {
      return (
        <>
          <View style={[styles.urlBox, { backgroundColor: colors.bgMid }]}>
            <Text
              style={[styles.urlText, { color: colors.text }]}
              numberOfLines={2}
              selectable
            >
              {calendarUrl}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: colors.terra }]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Ionicons name="copy-outline" size={18} color="#fff" />
            <Text style={styles.btnPrimaryText}>{t("calendar.copyBtn")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: colors.danger + "60" }]}
            onPress={handleRegenerate}
            activeOpacity={0.8}
            disabled={generating}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.danger} />
            <Text style={[styles.btnSecondaryText, { color: colors.danger }]}>
              {generating ? t("calendar.generating") : t("calendar.regenerateBtn")}
            </Text>
          </TouchableOpacity>
        </>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: colors.terra }]}
        onPress={handleGenerate}
        activeOpacity={0.8}
        disabled={generating}
      >
        <Ionicons name="calendar-outline" size={18} color="#fff" />
        <Text style={styles.btnPrimaryText}>
          {generating ? t("calendar.generating") : t("calendar.generateBtn")}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleRegenerate = () => {
    Alert.alert(
      t("calendar.regenerateTitle"),
      t("calendar.regenerateWarning"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("calendar.regenerateConfirm"),
          style: "destructive",
          onPress: handleGenerate,
        },
      ]
    );
  };

  const handleCopy = () => {
    if (!calendarUrl) return;
    Clipboard.setString(calendarUrl);
    Alert.alert(t("calendar.copiedTitle"), t("calendar.copiedMessage"));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("calendar.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge premium */}
        <View style={[styles.premiumBadge, { backgroundColor: colors.terraLight }]}>
          <Ionicons name="star" size={14} color={colors.terra} />
          <Text style={[styles.premiumText, { color: colors.terra }]}>
            {t("calendar.premiumBadge")}
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textLight }]}>
          {t("calendar.description")}
        </Text>

        {/* Zone URL */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {renderUrlSection()}
        </View>

        {/* Instructions iOS */}
        <View style={[styles.instructionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.instructionHeader}>
            <Ionicons name="logo-apple" size={20} color={colors.text} />
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              {t("calendar.iosTitle")}
            </Text>
          </View>
          {(t("calendar.iosSteps", { returnObjects: true }) as string[]).map(
            (step: string, i: number) => (
              <View key={step} style={styles.step}>
                <View style={[styles.stepNum, { backgroundColor: colors.terraLight }]}>
                  <Text style={[styles.stepNumText, { color: colors.terra }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textLight }]}>{step}</Text>
              </View>
            )
          )}
        </View>

        {/* Instructions Android */}
        <View style={[styles.instructionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.instructionHeader}>
            <Ionicons name="logo-android" size={20} color={colors.text} />
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              {t("calendar.androidTitle")}
            </Text>
          </View>
          {(t("calendar.androidSteps", { returnObjects: true }) as string[]).map(
            (step: string, i: number) => (
              <View key={step} style={styles.step}>
                <View style={[styles.stepNum, { backgroundColor: colors.terraLight }]}>
                  <Text style={[styles.stepNumText, { color: colors.terra }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textLight }]}>{step}</Text>
              </View>
            )
          )}
        </View>

        {/* Note sécurité */}
        <View style={[styles.securityNote, { backgroundColor: colors.bgMid }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textLight} />
          <Text style={[styles.securityText, { color: colors.textLight }]}>
            {t("calendar.securityNote")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: F.sans600 },

  content: { padding: 20, gap: 16, paddingBottom: 40 },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumText: { fontSize: 13, fontFamily: F.sans600 },

  description: { fontSize: 15, fontFamily: F.sans400, lineHeight: 22 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  placeholder: { fontSize: 14, fontFamily: F.sans400, textAlign: "center", paddingVertical: 8 },

  urlBox: {
    borderRadius: 10,
    padding: 12,
  },
  urlText: { fontSize: 13, fontFamily: F.sans400, lineHeight: 20 },

  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  btnPrimaryText: { fontSize: 16, fontFamily: F.sans600, color: "#fff" },

  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  btnSecondaryText: { fontSize: 15, fontFamily: F.sans500 },

  instructionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  instructionTitle: { fontSize: 15, fontFamily: F.sans600 },

  step: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumText: { fontSize: 12, fontFamily: F.sans700 },
  stepText: { flex: 1, fontSize: 14, fontFamily: F.sans400, lineHeight: 20 },

  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  securityText: { flex: 1, fontSize: 13, fontFamily: F.sans400, lineHeight: 18 },
});

export default CalendarExportScreen;
