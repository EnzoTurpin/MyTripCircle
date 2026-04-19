import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { F } from "../../theme/fonts";
import { RADIUS, SPACING, SHADOW } from "../../theme";
import { useTheme } from "../../contexts/ThemeContext";

const SubscriptionFeaturesCard: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const features: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: "cloud-upload-outline",     text: t("subscription.featureCloud") },
    { icon: "shield-checkmark-outline", text: t("subscription.featureSecure") },
    { icon: "people-outline",           text: t("subscription.featureTeam") },
    { icon: "refresh-outline",          text: t("subscription.featureUpdates") },
  ];

  return (
    <View
      style={[
        styles.card,
        SHADOW.light,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t("subscription.includedInAllPlans")}
      </Text>
      <View style={styles.grid}>
        {features.map((f) => (
          <View key={f.icon} style={styles.item}>
            <View style={[styles.iconWrap, { backgroundColor: colors.terraLight }]}>
              <Ionicons name={f.icon} size={18} color={colors.terra} />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>{f.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: SPACING.xxl,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    borderWidth: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: F.sans700,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  item: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.sans400,
    lineHeight: 18,
  },
});

export default SubscriptionFeaturesCard;
