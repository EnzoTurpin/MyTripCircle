import React from "react";
import { View, ScrollView } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import SkeletonBox from "../SkeletonBox";

const AddressDetailsSkeleton: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView scrollEnabled={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <SkeletonBox width="100%" height={270} borderRadius={0} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 16 }}>
          <SkeletonBox width={90} height={24} borderRadius={20} />
          <SkeletonBox width="65%" height={24} borderRadius={8} />
          <SkeletonBox width="80%" height={14} borderRadius={6} />
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} width={20} height={20} borderRadius={4} />
            ))}
            <SkeletonBox width={40} height={14} borderRadius={5} />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[{ id: "s1", w: 80 }, { id: "s2", w: 70 }, { id: "s3", w: 90 }].map(({ id, w }) => (
              <SkeletonBox key={id} width={w} height={30} borderRadius={999} />
            ))}
          </View>
          <SkeletonBox width="100%" height={160} borderRadius={14} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <SkeletonBox height={48} borderRadius={12} style={{ flex: 1 }} />
            <SkeletonBox height={48} borderRadius={12} style={{ flex: 1 }} />
          </View>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <SkeletonBox width={20} height={20} borderRadius={4} />
              <SkeletonBox width="70%" height={14} borderRadius={6} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AddressDetailsSkeleton;
