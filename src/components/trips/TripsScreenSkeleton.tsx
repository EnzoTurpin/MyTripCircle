import React from "react";
import { View, StyleSheet, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import SkeletonBox from "../SkeletonBox";

const TripsScreenSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView scrollEnabled={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SkeletonBox width={44} height={44} borderRadius={12} />
            <View style={{ gap: 6 }}>
              <SkeletonBox width={120} height={12} borderRadius={6} />
              <SkeletonBox width={160} height={20} borderRadius={8} />
            </View>
          </View>
          <SkeletonBox width={44} height={44} borderRadius={22} />
        </View>
        <View style={{ marginHorizontal: 14, marginBottom: 8 }}>
          <SkeletonBox width="100%" height={180} borderRadius={18} />
        </View>
        <View style={styles.pillsRow}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox key={i} height={72} borderRadius={12} style={{ flex: 1 }} />
          ))}
        </View>
        <View style={styles.sectionHeader}>
          <SkeletonBox width={160} height={22} borderRadius={8} />
          <SkeletonBox width={60} height={14} borderRadius={6} />
        </View>
        <View style={{ flexDirection: "row", paddingHorizontal: 14, gap: 12 }}>
          {[0, 1].map((i) => (
            <SkeletonBox key={i} width={190} height={176} borderRadius={16} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 10,
  },
});

export default TripsScreenSkeleton;
