import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Address } from "../../types";
import { F } from "../../theme/fonts";
import { useTheme } from "../../contexts/ThemeContext";

const ADDRESS_STRIPE_COLOR: Record<Address["type"], string> = {
  hotel:      "#6B8C5A",
  restaurant: "#C4714A",
  activity:   "#8B70C0",
  transport:  "#5A8FAA",
  other:      "#5A8FAA",
};

const ADDRESS_ICON: Record<Address["type"], string> = {
  hotel:      "bed",
  restaurant: "restaurant",
  activity:   "ticket",
  transport:  "car",
  other:      "location",
};

const addressIconBg = (type: Address["type"], isDark: boolean): string => {
  if (isDark) {
    switch (type) {
      case "hotel":      return "#1E2E1A";
      case "restaurant": return "#2E1E15";
      case "activity":   return "#251E35";
      case "transport":  return "#1A2E35";
      default:           return "#1A2E35";
    }
  }
  switch (type) {
    case "hotel":      return "#E2EDD9";
    case "restaurant": return "#F5E5DC";
    case "activity":   return "#EDE8F5";
    case "transport":  return "#DCF0F5";
    default:           return "#DCF0F5";
  }
};

interface Props {
  addresses: Address[];
  colors: {
    textLight: string;
    terraLight: string;
    terra: string;
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

const AddressesList: React.FC<Props> = ({ addresses, colors, onAdd, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <>
      <View style={s.sectionRow}>
        <Text style={[s.sectionLbl, { color: colors.textLight }]}>{t("addresses.header")}</Text>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.terraLight }]}
          onPress={onAdd}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={17} color={colors.terra} />
          <Text style={[s.addBtnText, { color: colors.terra }]}>{t("addresses.addAddress")}</Text>
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="location-outline" size={40} color={colors.border} />
          <Text style={[s.emptyText, { color: colors.textLight }]}>{t("addresses.emptyAll")}</Text>
        </View>
      ) : (
        <View style={s.list}>
          {addresses.map((address, index) => {
            const stripe = ADDRESS_STRIPE_COLOR[address.type] ?? colors.terra;
            return (
              <View
                key={address.id || index}
                style={[s.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[s.stripe, { backgroundColor: stripe }]} />
                <View style={s.content}>
                  <View style={[s.iconWrap, { backgroundColor: addressIconBg(address.type, isDark) }]}>
                    <Ionicons
                      name={(ADDRESS_ICON[address.type] ?? "location") as any}
                      size={20}
                      color={stripe}
                    />
                  </View>
                  <View style={s.info}>
                    <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>
                      {address.name || address.address}
                    </Text>
                    <Text style={[s.sub, { color: colors.textLight }]} numberOfLines={1}>
                      {address.city}{address.country ? `, ${address.country}` : ""}
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
            );
          })}
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
  addBtnText: { fontSize: 14, fontFamily: F.sans600 },
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
  content: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontFamily: F.sans600 },
  sub: { fontSize: 13, fontFamily: F.sans400, marginTop: 3 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddressesList;
