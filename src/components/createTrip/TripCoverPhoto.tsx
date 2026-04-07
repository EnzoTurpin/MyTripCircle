import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { F } from "../../theme/fonts";
import { COLORS as C } from "../../theme/colors";

const TripCoverPhoto: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.coverWrapper}>
      <LinearGradient
        colors={["#3A6B5A", "#1E4A3A", "#2C5A48"]}
        style={styles.coverGradient}
      >
        <View style={styles.coverOverlay} />
        <TouchableOpacity style={styles.coverButton} activeOpacity={0.8}>
          <Text style={styles.coverButtonText}>
            {t("createTrip.changeCoverPhoto")}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
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
  },
  coverGradient: {
    flex: 1,
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
