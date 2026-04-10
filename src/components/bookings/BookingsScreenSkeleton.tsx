import React from "react";
import { View, ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SwipeToNavigate } from "../../hooks/useSwipeToNavigate";
import { useTheme } from "../../contexts/ThemeContext";
import SkeletonBox from "../SkeletonBox";

const BookingsScreenSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SwipeToNavigate currentIndex={1} totalTabs={5}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
        <ScrollView scrollEnabled={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.header}>
            <SkeletonBox width={160} height={28} borderRadius={8} />
            <SkeletonBox width={44} height={44} borderRadius={22} />
          </View>
          <View style={styles.pillsRow}>
            {[{ id: "p1", w: 80 }, { id: "p2", w: 60 }, { id: "p3", w: 60 }, { id: "p4", w: 80 }, { id: "p5", w: 70 }].map(({ id, w }) => (
              <SkeletonBox key={id} width={w} height={34} borderRadius={20} />
            ))}
          </View>
          <View style={styles.cardList}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ borderRadius: 16, overflow: "hidden", flexDirection: "row" }}>
                <SkeletonBox width={6} height={96} borderRadius={0} style={{ borderRadius: 0 }} />
                <View style={{ flex: 1, backgroundColor: colors.bgMid, padding: 14, gap: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <SkeletonBox width={130} height={16} borderRadius={6} />
                    <SkeletonBox width={70} height={22} borderRadius={10} />
                  </View>
                  <SkeletonBox width="80%" height={12} borderRadius={5} />
                  <SkeletonBox width="50%" height={12} borderRadius={5} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 14,
  },
  pillsRow: { flexDirection: "row", paddingHorizontal: 14, gap: 8, marginBottom: 16 },
  cardList: { paddingHorizontal: 14, gap: 12 },
});

export default BookingsScreenSkeleton;
