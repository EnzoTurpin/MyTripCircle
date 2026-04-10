import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { Trip } from "../../types";
import { F } from "../../theme/fonts";

const formatShortDate = (date: Date, monthsShort: string[]): string => {
  const d = new Date(date);
  return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
};

interface Props {
  trip: Trip;
  photoUri: string;
  onPress: () => void;
}

const TripMiniCard: React.FC<Props> = ({ trip, photoUri, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const monthsShort = t("trips.months").split(",");

  return (
    <TouchableOpacity
      style={[styles.miniCard, { backgroundColor: colors.bgMid }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: photoUri }} style={styles.miniPhoto} resizeMode="cover" />
      <View style={styles.miniBottom}>
        <Text style={[styles.miniName, { color: colors.text }]} numberOfLines={1}>{trip.title}</Text>
        <Text style={[styles.miniDate, { color: colors.textLight }]}>
          {formatShortDate(trip.startDate, monthsShort)}–{formatShortDate(trip.endDate, monthsShort)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  miniCard: { width: 190, height: 176, borderRadius: 16, overflow: "hidden" },
  miniPhoto: { width: 190, height: 112 },
  miniBottom: { flex: 1, paddingHorizontal: 12, paddingVertical: 8, justifyContent: "center" },
  miniName: { fontSize: 16, fontFamily: F.sans600 },
  miniDate: { fontSize: 13, fontFamily: F.sans400, marginTop: 2 },
});

export default TripMiniCard;
