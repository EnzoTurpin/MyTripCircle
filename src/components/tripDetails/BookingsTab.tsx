import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList, Booking } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDate } from "../../utils/i18n";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";

type NavigationProp = StackNavigationProp<RootStackParamList, "TripDetails">;

const bookingStripeColor = (type: string): string => {
  switch (type) {
    case "flight":      return "#5A8FAA";
    case "hotel":       return "#6B8C5A";
    case "train":
    case "restaurant":  return "#C4714A";
    case "activity":    return "#8B70C0";
    default:            return "#C4714A";
  }
};

const bookingIconBg = (type: string): string => {
  switch (type) {
    case "flight":      return "#DCF0F5";
    case "hotel":       return "#E2EDD9";
    case "train":
    case "restaurant":  return "#F5E5DC";
    case "activity":    return "#EDE8F5";
    default:            return "#F5E5DC";
  }
};

const bookingIconName = (type: string): any => {
  switch (type) {
    case "flight":      return "airplane";
    case "hotel":       return "bed";
    case "train":       return "train";
    case "restaurant":  return "restaurant";
    case "activity":    return "star";
    case "car":         return "car";
    default:            return "receipt";
  }
};

interface Props {
  bookings: Booking[];
  isOwner: boolean;
  canEdit?: boolean;
}

const BookingsTab: React.FC<Props> = ({ bookings, isOwner, canEdit }) => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (bookings.length === 0) {
    return (
      <View style={s.tabContent}>
        <View style={s.emptyState}>
          <Text style={[s.emptyText, { color: colors.textMid }]}>{t("tripDetails.noBookings")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.tabContent}>
      {bookings.map((booking: Booking) => {
        const stripe = bookingStripeColor(booking.type);
        const iconBg = bookingIconBg(booking.type);
        const isConfirmed = booking.status === "confirmed";
        return (
          <TouchableOpacity
            key={booking.id}
            style={[s.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate("BookingDetails", {
                bookingId: booking.id,
                readOnly: !isOwner && !canEdit,
              })
            }
            activeOpacity={0.8}
          >
            <View style={[s.listStripe, { backgroundColor: stripe }]} />
            <View style={[s.listIconWrap, { backgroundColor: iconBg }]}>
              <Ionicons name={bookingIconName(booking.type)} size={22} color={stripe} />
            </View>
            <View style={s.listInfo}>
              <Text style={[s.listTitle, { color: colors.text }]} numberOfLines={1}>{booking.title}</Text>
              <Text style={[s.listSub, { color: colors.textLight }]} numberOfLines={1}>
                {formatDate(booking.date)}{booking.time ? ` · ${booking.time}` : ""}
              </Text>
            </View>
            {booking.status && (
              <View style={[
                s.statusPill,
                isConfirmed
                  ? { backgroundColor: "#E2EDD9" }
                  : { backgroundColor: "#F5E5DC" },
              ]}>
                <Text style={[
                  s.statusPillText,
                  isConfirmed ? { color: "#6B8C5A" } : { color: "#C4714A" },
                ]}>
                  {isConfirmed ? t("bookings.status.confirmed") : t("bookings.status.pending")}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  tabContent: {
    paddingTop: 12,
    paddingBottom: 80,
    position: "relative",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: "#7A6A58",
    fontFamily: F.sans400,
  },
  listItem: {
    marginHorizontal: 20,
    marginBottom: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8CCBA",
    borderRadius: RADIUS.card,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 12,
  },
  listStripe: {
    width: 5,
    height: 48,
    borderRadius: 3,
    marginRight: 4,
    flexShrink: 0,
  },
  listIconWrap: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginLeft: 12,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 17,
    fontFamily: F.sans600,
    color: "#2A2318",
    marginBottom: 4,
  },
  listSub: {
    fontSize: 14,
    color: "#B0A090",
    fontFamily: F.sans400,
  },
  statusPill: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  statusPillText: {
    fontSize: 13,
    fontFamily: F.sans600,
  },
});

export default BookingsTab;
