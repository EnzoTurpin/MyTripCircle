import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { F } from "../../theme/fonts";
import { COLORS as C } from "../../theme/colors";

interface Props {
  coverImage?: string;
  onPickPhoto: () => void;
}

const TripCoverPhoto: React.FC<Props> = ({ coverImage, onPickPhoto }) => {
  const { t } = useTranslation();
  const hasCover = Boolean(coverImage);
  const buttonLabel = hasCover ? t("createTrip.changeCoverPhoto") : t("createTrip.addCoverPhoto");

  return (
    <View style={styles.coverWrapper}>
      {hasCover ? (
        <>
          <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0.3 }}
            end={{ x: 0, y: 1 }}
          />
        </>
      ) : (
        <LinearGradient
          colors={["#3A6B5A", "#1E4A3A", "#2C5A48"]}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.coverOverlay} />
        </LinearGradient>
      )}
      <TouchableOpacity style={styles.coverButton} onPress={onPickPhoto} activeOpacity={0.8}>
        <Text style={styles.coverButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  coverWrapper: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    overflow: "hidden",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  coverButton: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  coverButtonText: {
    fontSize: 14,
    fontFamily: F.sans600,
    color: C.ink,
  },
});

export default TripCoverPhoto;
