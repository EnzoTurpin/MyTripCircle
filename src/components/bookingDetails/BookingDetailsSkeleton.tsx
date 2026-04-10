import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import SkeletonBox from "../SkeletonBox";

const BookingDetailsSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <ScrollView scrollEnabled={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <SkeletonBox width="100%" height={200} borderRadius={0} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
          <SkeletonBox width={80} height={22} borderRadius={20} />
          <SkeletonBox width="70%" height={24} borderRadius={8} />
          <SkeletonBox width="45%" height={14} borderRadius={6} />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonBox key={i} height={72} borderRadius={12} style={{ flex: 1 }} />
            ))}
          </View>
          <SkeletonBox width="100%" height={64} borderRadius={12} />
          <View style={{ gap: 8 }}>
            <SkeletonBox width="100%" height={14} borderRadius={5} />
            <SkeletonBox width="80%" height={14} borderRadius={5} />
            <SkeletonBox width="60%" height={14} borderRadius={5} />
          </View>
          <SkeletonBox width={120} height={14} borderRadius={6} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[0, 1].map((i) => (
              <SkeletonBox key={i} width={100} height={80} borderRadius={10} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});

export default BookingDetailsSkeleton;
