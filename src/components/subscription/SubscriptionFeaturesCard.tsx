import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { F } from "../../theme/fonts";
import { useTheme } from "../../contexts/ThemeContext";

interface SubscriptionFeaturesCardProps {
  colors: {
    surface: string;
    border: string;
    text: string;
  };
}

const SubscriptionFeaturesCard: React.FC<SubscriptionFeaturesCardProps> = ({ colors }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const features = [
    { icon: "cloud-upload-outline",     text: t("subscription.featureCloud") },
    { icon: "shield-checkmark-outline", text: t("subscription.featureSecure") },
    { icon: "people-outline",           text: t("subscription.featureTeam") },
    { icon: "refresh-outline",          text: t("subscription.featureUpdates") },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("subscription.includedInAllPlans")}</Text>
      <View style={styles.list}>
        {features.map((feature) => (
          <View key={feature.icon} style={styles.item}>
            <View style={[styles.iconWrap, { backgroundColor: isDark ? "#1F2E1A" : "#E2EDD9" }]}>
              <Ionicons name={feature.icon as any} size={20} color="#6B8C5A" />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 32,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontFamily: F.sans700,
    marginBottom: 20,
    textAlign: "center",
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: F.sans400,
  },
});

export default SubscriptionFeaturesCard;
