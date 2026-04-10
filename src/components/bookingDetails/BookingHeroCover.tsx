import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { getBookingStatusTranslation } from "../../utils/i18n";
import { getBookingTypeIcon, getBookingTypeColorsDetail, getBookingStatusColorsDetail } from "../../utils/bookingHelpers";
import { Booking } from "../../types";
import { F } from "../../theme/fonts";

interface Props {
  booking: Booking;
  gradient: readonly [string, string, ...string[]];
  insetTop: number;
  onBack: () => void;
}

const BookingHeroCover: React.FC<Props> = ({ booking, gradient, insetTop, onBack }) => {
  const { t } = useTranslation();
  const typeC   = getBookingTypeColorsDetail(booking.type);
  const statusC = getBookingStatusColorsDetail(booking.status);

  return (
    <View style={styles.heroCover}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.heroOverlay} />

      <TouchableOpacity
        style={[styles.backButton, { top: insetTop + 10 }]}
        onPress={onBack}
        activeOpacity={0.75}
      >
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.heroBottom}>
        <View style={styles.heroBadgeRow}>
          <View style={[styles.heroBadge, { backgroundColor: typeC.bg }]}>
            <Ionicons name={getBookingTypeIcon(booking.type) as any} size={13} color={typeC.stripe} />
            <Text style={[styles.heroBadgeText, { color: typeC.stripe }]}>
              {t(`bookings.filters.${booking.type}`)}
            </Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: statusC.bg }]}>
            <Text style={[styles.heroBadgeText, { color: statusC.color }]}>
              {booking.status ? getBookingStatusTranslation(booking.status) : t("common.unknown")}
            </Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>{booking.title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCover: {
    height: 200,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBottom: { paddingHorizontal: 18, paddingBottom: 16 },
  heroBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: { fontSize: 11, fontFamily: F.sans600 },
  heroTitle: { fontSize: 26, fontFamily: F.sans700, color: "#FFFFFF", lineHeight: 32 },
});

export default BookingHeroCover;
