import React from "react";
import { View, ScrollView } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import SkeletonBox from "../SkeletonBox";

const TripPublicSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView scrollEnabled={false}>
        <SkeletonBox width="100%" height={280} borderRadius={0} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 14 }}>
          <SkeletonBox width="55%" height={26} borderRadius={8} />
          <SkeletonBox width="40%" height={14} borderRadius={6} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonBox key={i} height={64} borderRadius={12} style={{ flex: 1 }} />
            ))}
          </View>
          <SkeletonBox width={120} height={14} borderRadius={6} style={{ marginTop: 4 }} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonBox key={i} width={40} height={40} borderRadius={20} />
            ))}
          </View>
          <SkeletonBox width={100} height={14} borderRadius={6} style={{ marginTop: 8 }} />
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <SkeletonBox width={40} height={40} borderRadius={10} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width="60%" height={14} borderRadius={6} />
                <SkeletonBox width="40%" height={12} borderRadius={5} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TripPublicSkeleton;
