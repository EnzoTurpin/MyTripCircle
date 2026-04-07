import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Booking } from "../../types";
import { formatDate } from "../../utils/i18n";
import { F } from "../../theme/fonts";

const BOOKING_ICON: Record<Booking["type"], string> = {
  flight:     "airplane",
  train:      "train",
  hotel:      "bed",
  restaurant: "restaurant",
  activity:   "ticket",
};

const BOOKING_STRIPE_COLOR: Record<Booking["type"], string> = {
  flight:     "#5A8FAA",
  train:      "#C4714A",
  hotel:      "#6B8C5A",
  restaurant: "#C4714A",
  activity:   "#C4714A",
};

interface Props {
  bookings: Booking[];
  colors: {
    textLight: string;
    terraLight: string;
    surface: string;
    border: string;
    bgMid: string;
    textMid: string;
    dangerLight: string;
    text: string;
  };
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const BookingsList: React.FC<Props> = ({ bookings, colors, onAdd, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <>
      <View style={s.sectionRow}>
        <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("bookings.header")}</Text>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.terraLight }]}
          onPress={onAdd}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={17} color="#C4714A" />
          <Text style={s.addBtnText}>{t("bookings.addBooking")}</Text>
        </TouchableOpacity>
      </View>

      {bookings.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={40} color={colors.border} />
          <Text style={[s.emptyText, { color: colors.textLight }]}>{t("bookings.emptyAll")}</Text>
        </View>
      ) : (
        <View style={s.list}>
          {bookings.map((booking, index) => (
            <View
              key={booking.id || index}
              style={[s.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[s.stripe, { backgroundColor: BOOKING_STRIPE_COLOR[booking.type] ?? "#C4714A" }]} />
              <View style={s.content}>
                <Ionicons
                  name={(BOOKING_ICON[booking.type] ?? "receipt") as any}
                  size={18}
                  color="#C4714A"
                />
                <View style={s.info}>
                  <Text style={[s.title, { color: colors.text }]}>{booking.title}</Text>
                  <Text style={[s.date, { color: colors.textLight }]}>
                    {formatDate(booking.date)}
                    {booking.time ? ` · ${booking.time}` : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: colors.bgMid }]}
                  onPress={() => onEdit(index)}
                >
                  <Ionicons name="pencil" size={17} color={colors.textMid} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: colors.dangerLight }]}
                  onPress={() => onDelete(index)}
                >
                  <Ionicons name="trash" size={17} color="#C04040" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
};

const s = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
  },
  sectionLbl: {
    fontSize: 13,
    fontFamily: F.sans700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 14, color: "#C4714A", fontFamily: F.sans600 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: F.sans400 },
  list: { gap: 10, marginBottom: 10 },
  item: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  stripe: { width: 5 },
  content: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  info: { flex: 1 },
  title: { fontSize: 16, fontFamily: F.sans600 },
  date: { fontSize: 13, fontFamily: F.sans400, marginTop: 3 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookingsList;
