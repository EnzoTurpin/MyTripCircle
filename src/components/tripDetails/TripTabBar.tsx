import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";

type TabKey = "bookings" | "addresses" | "members";

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TripTabBar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const tabs: TabKey[] = ["bookings", "addresses", "members"];

  const labels: Record<TabKey, string> = {
    bookings: t("tripDetails.tabBookings"),
    addresses: t("tripDetails.tabAddresses"),
    members: t("tripDetails.tabMembers"),
  };

  return (
    <View style={[s.tabBar, { borderBottomColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[s.tabItem, isActive && s.tabItemActive]}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, { color: colors.textLight }, isActive && s.tabTextActive]}>
              {labels[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D8CCBA",
    marginHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#C4714A",
  },
  tabText: {
    fontSize: 15,
    fontFamily: F.sans600,
    color: "#B0A090",
  },
  tabTextActive: {
    color: "#C4714A",
  },
});

export default TripTabBar;
