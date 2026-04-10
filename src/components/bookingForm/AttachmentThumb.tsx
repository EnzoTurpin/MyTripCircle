import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AttachmentThumbProps {
  attachment: { type: string; uri: string };
  colors: any;
}

const AttachmentThumb: React.FC<AttachmentThumbProps> = ({ attachment, colors }) => {
  const isLocalImage =
    attachment.type === "image" &&
    (attachment.uri.startsWith("file://") ||
      attachment.uri.startsWith("content://") ||
      attachment.uri.startsWith("ph://"));

  if (isLocalImage) {
    return <Image source={{ uri: attachment.uri }} style={styles.thumbnail} resizeMode="cover" />;
  }

  return (
    <View style={[styles.icon, { backgroundColor: colors.bgLight }]}>
      <Ionicons name={attachment.type === "pdf" ? "document" : "image"} size={22} color="#C4714A" />
    </View>
  );
};

const styles = StyleSheet.create({
  thumbnail: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  icon: { width: 50, height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
});

export default AttachmentThumb;
