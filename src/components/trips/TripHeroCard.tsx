import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  daysUntil: number;
  onPress: () => void;
}

const TripHeroCard: React.FC<Props> = ({ trip, photoUri, daysUntil, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const monthsShort = t("trips.months").split(",");

  return (
    <>
      <TouchableOpacity style={styles.heroCard} onPress={onPress} activeOpacity={0.88}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.72)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroStatusBadge}>
          <Text style={styles.heroStatusText}>
            {trip.status === "draft" ? t("trips.statusDraft") : t("trips.statusActive")}
          </Text>
        </View>
        <View style={styles.heroArrowBtn}>
          <Ionicons name="arrow-forward-outline" size={16} color="#A35830" />
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroTitle} numberOfLines={1}>{trip.title}</Text>
          <Text style={styles.heroMeta} numberOfLines={1}>
            📍 {trip.destination} · {formatShortDate(trip.startDate, monthsShort)}–{formatShortDate(trip.endDate, monthsShort)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.pillsRow}>
        <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
          <Text style={[styles.pillValue, { color: colors.terra }]}>{trip.stats?.totalBookings ?? 0}</Text>
          <Text style={[styles.pillLabel, { color: colors.textLight }]}>{t("trips.bookingsLabel")}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
          <Text style={[styles.pillValue, { color: colors.terra }]}>{(trip.collaborators?.length ?? 0) + 1}</Text>
          <Text style={[styles.pillLabel, { color: colors.textLight }]}>{t("trips.coTravelers")}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
          <Text style={[styles.pillValue, { color: colors.terra }]}>{daysUntil}j</Text>
          <Text style={[styles.pillLabel, { color: colors.textLight }]}>{t("trips.beforeDeparture")}</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    aspectRatio: 202 / 128,
    borderRadius: 18,
    marginHorizontal: 14,
    marginBottom: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroStatusBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroStatusText: { fontSize: 12, color: "#FFFFFF", fontFamily: F.sans500 },
  heroArrowBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBottom: { paddingHorizontal: 16, paddingBottom: 18 },
  heroTitle: { fontSize: 22, fontFamily: F.sans700, color: "#FFFFFF", marginBottom: 4 },
  heroMeta: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: F.sans400 },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 12,
  },
  pill: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  pillValue: { fontSize: 28, fontFamily: F.sans700 },
  pillLabel: { fontSize: 13, fontFamily: F.sans400, marginTop: 3 },
});

export default TripHeroCard;
