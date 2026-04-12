import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Address } from "../../types";
import { F } from "../../theme/fonts";
import { useTheme } from "../../contexts/ThemeContext";

interface Props {
  address: Address;
  gradient: [string, string, string];
  badge: { label: string; emoji: string };
  insetTop: number;
  onBack: () => void;
}

const AddressHeroCover: React.FC<Props> = ({ address, gradient, badge, insetTop, onBack }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.heroCover}>
      {address.photoUrl ? (
        <Image
          source={{ uri: address.photoUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={gradient}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.70)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <TouchableOpacity
        style={[styles.backButton, { top: insetTop + 10 }]}
        onPress={onBack}
        activeOpacity={0.75}
      >
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.heroBottom}>
        <View style={[styles.typeBadge, { backgroundColor: colors.terraLight }]}>
          <Text style={[styles.typeBadgeText, { color: colors.terra }]}>
            {badge.emoji} {badge.label}
          </Text>
        </View>
        <Text style={styles.heroTitle}>{address.name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCover: {
    height: 270,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBottom: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  typeBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 13,
    fontFamily: F.sans600,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: F.serif700,
    color: "#FFFFFF",
    lineHeight: 34,
  },
});

export default AddressHeroCover;
