import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import Toggle from "../components/ui/Toggle";
import { userApi, ConsentPayload } from "../services/api/userApi";
import { CONSENT_KEY, ConsentPreferences } from "./ConsentScreen";
import BackButton from "../components/ui/BackButton";

const ConsentManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((raw) => {
      if (raw) {
        const prefs: ConsentPreferences = JSON.parse(raw);
        setLocationEnabled(prefs.location);
        setNotificationsEnabled(prefs.notifications);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let effectiveLocation = locationEnabled;

      if (locationEnabled) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          effectiveLocation = false;
          setLocationEnabled(false);
          Alert.alert(
            t("consentManagement.locationDeniedTitle"),
            t("consentManagement.locationDeniedMessage"),
            [
              { text: t("common.cancel"), style: "cancel" },
              { text: t("consentManagement.openSettings"), onPress: () => Linking.openSettings() },
            ]
          );
          setSaving(false);
          return;
        }
      }

      const prefs: ConsentPreferences = {
        data: true,
        location: effectiveLocation,
        notifications: notificationsEnabled,
        acceptedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));

      const payload: ConsentPayload = {
        data: true,
        location: effectiveLocation,
        notifications: notificationsEnabled,
      };
      await userApi.updateConsent(payload);

      Alert.alert(
        t("consentManagement.savedTitle"),
        t("consentManagement.savedMessage"),
        [{ text: t("common.ok"), onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      if (__DEV__) console.warn("[ConsentManagementScreen] Erreur sauvegarde consentements:", e);
      Alert.alert(t("common.error"), t("consentManagement.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("consentManagement.title")}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.textLight }]}>
          {t("consentManagement.description")}
        </Text>

        {loading ? (
          <ActivityIndicator
            color={colors.terra}
            style={styles.loader}
          />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Données — obligatoire, non modifiable */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowEmoji}>🔐</Text>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>
                    {t("consent.dataTitle")}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textLight }]}>
                    {t("consentManagement.required")}
                  </Text>
                </View>
              </View>
              <View style={[styles.toggle, { backgroundColor: colors.terra }]}>
                <View style={[styles.toggleThumb, { transform: [{ translateX: 20 }] }]} />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            {/* Localisation */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowEmoji}>📍</Text>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>
                    {t("consent.locationTitle")}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textLight }]}>
                    {t("consent.locationBody")}
                  </Text>
                </View>
              </View>
              <Toggle
                value={locationEnabled}
                onToggle={setLocationEnabled}
                trackColor={colors.terra}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            {/* Notifications */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowEmoji}>🔔</Text>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>
                    {t("consent.notificationsTitle")}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textLight }]}>
                    {t("consent.notificationsBody")}
                  </Text>
                </View>
              </View>
              <Toggle
                value={notificationsEnabled}
                onToggle={setNotificationsEnabled}
                trackColor={colors.terra}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: saving ? colors.bgDark : colors.terra },
          ]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{t("consentManagement.save")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.privacyLink}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Privacy")}
        >
          <Text style={[styles.privacyLinkText, { color: colors.terra }]}>
            {t("consent.viewPrivacy")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: F.sans700,
    fontSize: 20,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  description: {
    fontFamily: F.sans400,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  rowEmoji: {
    fontSize: 24,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: F.sans600,
    fontSize: 15,
  },
  rowSub: {
    fontFamily: F.sans400,
    fontSize: 12,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    position: "absolute",
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 16,
  },
  saveBtnText: {
    fontFamily: F.sans700,
    fontSize: 17,
    color: "#fff",
  },
  privacyLink: {
    alignItems: "center",
  },
  privacyLinkText: {
    fontFamily: F.sans500,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});

export default ConsentManagementScreen;
