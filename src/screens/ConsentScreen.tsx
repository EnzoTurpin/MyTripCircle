import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { requestPermissionAndRegisterToken } from "../hooks/usePushNotifications";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";

export const CONSENT_KEY = "@mytripcircle_consent_v1";

export interface ConsentPreferences {
  data: true;        // Obligatoire — traitement des données (toujours true)
  location: boolean; // Optionnel — géolocalisation
  notifications: boolean; // Optionnel — notifications
  acceptedAt: string;
}

interface ConsentItemProps {
  icon: string;
  title: string;
  body: string;
  badge: string;
  badgeRequired: boolean;
  enabled: boolean;
  toggleable: boolean;
  onToggle?: () => void;
}

const ConsentItem: React.FC<ConsentItemProps> = ({
  icon, title, body, badge, badgeRequired, enabled, toggleable, onToggle,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemIcon}>{icon}</Text>
        <View style={styles.itemTitleRow}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
          <View style={[
            styles.badge,
            { backgroundColor: badgeRequired ? colors.terraLight : colors.bgMid },
          ]}>
            <Text style={[
              styles.badgeText,
              { color: badgeRequired ? colors.terra : colors.textLight },
            ]}>{badge}</Text>
          </View>
        </View>
        {toggleable && (
          <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            style={[styles.toggle, { backgroundColor: enabled ? colors.terra : colors.bgDark }]}
          >
            <View style={[
              styles.toggleThumb,
              { transform: [{ translateX: enabled ? 20 : 2 }] },
            ]} />
          </TouchableOpacity>
        )}
        {!toggleable && (
          <View style={[styles.toggle, { backgroundColor: colors.terra }]}>
            <View style={[styles.toggleThumb, { transform: [{ translateX: 20 }] }]} />
          </View>
        )}
      </View>
      <Text style={[styles.itemBody, { color: colors.textLight }]}>{body}</Text>
    </View>
  );
};

interface ConsentScreenProps {
  onConsentGiven?: () => void;
}

export default function ConsentScreen({ onConsentGiven }: Readonly<ConsentScreenProps>) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [dataEnabled, setDataEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const saveAndContinue = async (acceptAll: boolean) => {
    const notifConsented = acceptAll ? notificationsEnabled : false;
    const prefs: ConsentPreferences = {
      data: true,
      location: acceptAll ? locationEnabled : false,
      notifications: notifConsented,
      acceptedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    if (prefs.location) {
      await Location.requestForegroundPermissionsAsync();
    }
    if (notifConsented) {
      await requestPermissionAndRegisterToken();
    }
    onConsentGiven?.();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <View style={styles.content}>

        <ScrollView
          style={styles.top}
          contentContainerStyle={styles.topContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoRow}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{t("consent.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>{t("consent.subtitle")}</Text>

          <View style={styles.items}>
            <ConsentItem
              icon="🔐"
              title={t("consent.dataTitle")}
              body={t("consent.dataBody")}
              badge={t("consent.requiredBadge")}
              badgeRequired
              enabled={dataEnabled}
              toggleable
              onToggle={() => setDataEnabled((v) => !v)}
            />
            <ConsentItem
              icon="📍"
              title={t("consent.locationTitle")}
              body={t("consent.locationBody")}
              badge={t("consent.optionalBadge")}
              badgeRequired={false}
              enabled={locationEnabled}
              toggleable
              onToggle={() => setLocationEnabled((v) => !v)}
            />
            <ConsentItem
              icon="🔔"
              title={t("consent.notificationsTitle")}
              body={t("consent.notificationsBody")}
              badge={t("consent.optionalBadge")}
              badgeRequired={false}
              enabled={notificationsEnabled}
              toggleable
              onToggle={() => setNotificationsEnabled((v) => !v)}
            />
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: dataEnabled ? colors.terra : colors.bgDark }]}
            activeOpacity={dataEnabled ? 0.85 : 1}
            onPress={() => dataEnabled && saveAndContinue(true)}
            disabled={!dataEnabled}
          >
            <Text style={[styles.btnPrimaryText, { color: dataEnabled ? "#fff" : colors.textLight }]}>
              {t("consent.acceptAll")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: dataEnabled ? colors.border : colors.bgDark }]}
            activeOpacity={dataEnabled ? 0.7 : 1}
            onPress={() => dataEnabled && saveAndContinue(false)}
            disabled={!dataEnabled}
          >
            <Text style={[styles.btnSecondaryText, { color: dataEnabled ? colors.textLight : colors.bgDark }]}>
              {t("consent.acceptRequired")}
            </Text>
          </TouchableOpacity>

          <View style={styles.links}>
            <TouchableOpacity onPress={() => navigation.navigate("Privacy")} activeOpacity={0.7}>
              <Text style={[styles.link, { color: colors.terra }]}>{t("consent.viewPrivacy")}</Text>
            </TouchableOpacity>
            <Text style={[styles.linkSep, { color: colors.textLight }]}>·</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Terms")} activeOpacity={0.7}>
              <Text style={[styles.link, { color: colors.terra }]}>{t("consent.viewTerms")}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  top: {
    flex: 1,
  },
  topContent: {
    paddingBottom: 12,
  },
  bottom: {
    paddingTop: 12,
  },
  logoRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  title: {
    fontFamily: F.sans700,
    fontSize: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: F.sans400,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  items: {
    gap: 10,
  },
  item: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  itemIcon: {
    fontSize: 22,
  },
  itemTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemTitle: {
    fontFamily: F.sans600,
    fontSize: 15,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: F.sans600,
    fontSize: 11,
  },
  itemBody: {
    fontFamily: F.sans400,
    fontSize: 13,
    lineHeight: 20,
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
  btnPrimary: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  btnPrimaryText: {
    fontFamily: F.sans700,
    fontSize: 17,
    color: "#fff",
  },
  btnSecondary: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 16,
  },
  btnSecondaryText: {
    fontFamily: F.sans500,
    fontSize: 16,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  link: {
    fontFamily: F.sans500,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  linkSep: {
    fontSize: 16,
  },
});
