import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { F } from "../../theme/fonts";

type Tab = "friends" | "requests" | "suggestions";

interface FriendsTabBarProps {
  activeTab: Tab;
  friendsCount: number;
  totalPending: number;
  onTabChange: (tab: Tab) => void;
  t: (key: string, opts?: any) => string;
  colors: any;
}

const FriendsTabBar: React.FC<FriendsTabBarProps> = ({ activeTab, friendsCount, totalPending, onTabChange, t, colors }) => (
  <View style={[styles.tabBar, { borderBottomColor: colors.bgDark }]}>
    <TouchableOpacity
      style={[styles.tabItem, activeTab === "friends" && styles.tabItemActive]}
      onPress={() => onTabChange("friends")}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, { color: colors.textLight }, activeTab === "friends" && styles.tabTextActive]}>
        {t("friends.tabs.friends", { count: friendsCount })}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tabItem, activeTab === "requests" && styles.tabItemActive]}
      onPress={() => onTabChange("requests")}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, { color: colors.textLight }, activeTab === "requests" && styles.tabTextActive]}>
        {t("friends.tabs.requests")}
      </Text>
      {totalPending > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalPending}</Text>
        </View>
      )}
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tabItem, activeTab === "suggestions" && styles.tabItemActive]}
      onPress={() => onTabChange("suggestions")}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, { color: colors.textLight }, activeTab === "suggestions" && styles.tabTextActive]}>
        {t("friends.tabs.suggestions")}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  tabBar: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 20, marginBottom: 16 },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabItemActive: { borderBottomColor: "#C4714A" },
  tabText: { fontSize: 15, fontFamily: F.sans600 },
  tabTextActive: { color: "#C4714A" },
  badge: { backgroundColor: "#C4714A", borderRadius: 10, minWidth: 18, height: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  badgeText: { fontSize: 12, fontFamily: F.sans700, color: "#FFFFFF" },
});

export default FriendsTabBar;
