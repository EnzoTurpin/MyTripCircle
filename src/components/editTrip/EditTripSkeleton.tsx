import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import SkeletonBox from "../SkeletonBox";

const EditTripSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgLight }]} edges={["top"]}>
        <View style={[styles.header, { backgroundColor: colors.bgLight, borderBottomColor: colors.border }]}>
          <SkeletonBox width={36} height={36} borderRadius={18} />
          <SkeletonBox width={140} height={20} borderRadius={8} />
        </View>
      </SafeAreaView>
      <ScrollView scrollEnabled={false} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <SkeletonBox width="100%" height={160} borderRadius={16} />
        {[{ id: "f1", w: 1 }, { id: "f2", w: 0.6 }, { id: "f3", w: 1 }, { id: "f4", w: 0.7 }].map(({ id, w }) => (
          <View key={id} style={{ gap: 8 }}>
            <SkeletonBox width={100} height={12} borderRadius={5} />
            <SkeletonBox width={`${w * 100}%`} height={52} borderRadius={10} />
          </View>
        ))}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ flex: 1, gap: 8 }}>
              <SkeletonBox width={80} height={12} borderRadius={5} />
              <SkeletonBox width="100%" height={52} borderRadius={10} />
            </View>
          ))}
        </View>
        <View style={{ gap: 8 }}>
          <SkeletonBox width={90} height={12} borderRadius={5} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonBox key={i} height={64} borderRadius={12} style={{ flex: 1 }} />
            ))}
          </View>
        </View>
        <SkeletonBox width="100%" height={52} borderRadius={12} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:    { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});

export default EditTripSkeleton;
