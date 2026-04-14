import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";

const AVATAR_COLORS = ["#C4714A", "#5A8FAA", "#8B70C0", "#6B8C5A", "#C0A040"];

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + (parts.at(-1)?.charAt(0) ?? "")).toUpperCase();
};

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

const FriendRequestConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { recipientName, recipientEmail, autoAccepted } = route.params as {
    recipientName: string;
    recipientEmail?: string;
    autoAccepted?: boolean;
  };

  const initials = getInitials(recipientName);
  const avatarColor = getAvatarColor(recipientName);

  const handleAddAnother = () => {
    navigation.replace("AddFriend");
  };

  const handleBackToFriends = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />

      <View style={styles.container}>
        {/* Icône centrale */}
        <View style={[styles.iconCircle, { backgroundColor: colors.terraLight, borderColor: colors.terra, shadowColor: colors.terra }]}>
          <Ionicons name="people" size={52} color={colors.terra} />
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: colors.text }]}>
          {autoAccepted ? t("friendRequestConfirmation.titleAccepted") : t("friendRequestConfirmation.titlePending")}
        </Text>

        {/* Sous-titre */}
        <Text style={[styles.subtitle, { color: colors.textMid }]}>
          <Text style={[styles.subtitleBold, { color: colors.text }]}>{recipientName}</Text>
          {autoAccepted
            ? t("friendRequestConfirmation.subtitleAcceptedRest")
            : t("friendRequestConfirmation.subtitlePendingRest")}
        </Text>

        {/* Carte profil en attente */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={[styles.profileName, { color: colors.text }]}>{recipientName}</Text>
              <View style={[styles.statusBadge, autoAccepted ? styles.statusBadgeAccepted : { backgroundColor: colors.terraLight }]}>
                {autoAccepted ? (
                  <>
                    <Ionicons name="checkmark-circle" size={13} color="#6B8C5A" />
                    <Text style={[styles.statusText, { color: "#6B8C5A" }]}>
                      {t("friendRequestConfirmation.statusFriend")}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="hourglass-outline" size={13} color={colors.terra} />
                    <Text style={[styles.statusText, { color: colors.terra }]}>{t("friendRequestConfirmation.statusPending")}</Text>
                  </>
                )}
              </View>
            </View>
            {recipientEmail ? (
              <Text style={[styles.profileEmail, { color: colors.textLight }]}>{recipientEmail}</Text>
            ) : null}
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: colors.terra, shadowColor: colors.terra }]}
            onPress={handleAddAnother}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add" size={22} color="#FFFFFF" />
            <Text style={styles.btnPrimaryText}>{t("friendRequestConfirmation.addAnother")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { backgroundColor: colors.bgMid }]}
            onPress={handleBackToFriends}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnSecondaryText, { color: colors.textMid }]}>{t("friendRequestConfirmation.backToFriends")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },

  title: {
    fontSize: 32,
    fontFamily: F.sans700,
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    fontFamily: F.sans400,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 36,
  },
  subtitleBold: {
    fontFamily: F.sans600,
  },

  // Profile card
  profileCard: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 22, fontFamily: F.sans700, color: "#FFFFFF" },
  profileInfo: { flex: 1 },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  profileName: { fontSize: 18, fontFamily: F.sans600, flexShrink: 1 },
  profileEmail: { fontSize: 14, fontFamily: F.sans400, marginTop: 4 },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexShrink: 0,
  },
  statusBadgeAccepted: {
    backgroundColor: "#E2EDD9",
  },
  statusText: {
    fontSize: 14,
    fontFamily: F.sans600,
  },

  // Buttons
  actions: {
    width: "100%",
    gap: 14,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    paddingVertical: 20,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  btnPrimaryText: { fontSize: 19, fontFamily: F.sans600, color: "#FFFFFF" },

  btnSecondary: {
    borderRadius: 18,
    paddingVertical: 19,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: 19, fontFamily: F.sans600 },
});

export default FriendRequestConfirmationScreen;
