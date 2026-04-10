import React from "react";
import { View } from "react-native";
import SkeletonBox from "../SkeletonBox";

const ProfileSkeleton: React.FC = () => (
  <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 20 }}>
    <View style={{ alignItems: "center", gap: 12 }}>
      <SkeletonBox width={88} height={88} borderRadius={44} />
      <SkeletonBox width={160} height={20} borderRadius={8} />
      <SkeletonBox width={100} height={14} borderRadius={6} />
    </View>
    <View style={{ flexDirection: "row", gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <SkeletonBox key={i} height={64} borderRadius={12} style={{ flex: 1 }} />
      ))}
    </View>
    <SkeletonBox width={120} height={16} borderRadius={6} />
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonBox key={i} width={100} height={100} borderRadius={12} />
      ))}
    </View>
    <SkeletonBox width="100%" height={48} borderRadius={12} />
  </View>
);

export default ProfileSkeleton;
