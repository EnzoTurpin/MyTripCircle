import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Address } from "../../types";
import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";

const addressStripeColor = (type: string): string => {
  switch (type) {
    case "hotel":       return "#6B8C5A";
    case "restaurant":  return "#C4714A";
    case "activity":    return "#8B70C0";
    default:            return "#5A8FAA";
  }
};

const addressIconBg = (type: string): string => {
  switch (type) {
    case "hotel":       return "#E2EDD9";
    case "restaurant":  return "#F5E5DC";
    case "activity":    return "#EDE8F5";
    default:            return "#DCF0F5";
  }
};

const addressIconEmoji = (type: string): string => {
  switch (type) {
    case "hotel":       return "🏨";
    case "restaurant":  return "🍽️";
    case "activity":    return "🎯";
    default:            return "📍";
  }
};

interface Props {
  addresses: Address[];
  onEditAddress: (address: Address) => void;
  onAddAddress?: () => void;
  canAdd?: boolean;
}

const AddressesTab: React.FC<Props> = ({ addresses, onEditAddress, onAddAddress, canAdd }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (addresses.length === 0) {
    return (
      <View style={s.tabContent}>
        <View style={s.emptyState}>
          <Text style={[s.emptyText, { color: colors.textMid }]}>{t("tripDetails.noAddresses")}</Text>
          {canAdd && onAddAddress && (
            <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onAddAddress} activeOpacity={0.8}>
              <Ionicons name="add" size={18} color={colors.textMid} />
              <Text style={[s.addBtnText, { color: colors.textMid }]}>{t("tripDetails.addAddress")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={s.tabContent}>
      {canAdd && onAddAddress && (
        <TouchableOpacity style={[s.addBtnTop, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onAddAddress} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={18} color={colors.textMid} />
          <Text style={[s.addBtnText, { color: colors.textMid }]}>{t("tripDetails.addAddress")}</Text>
        </TouchableOpacity>
      )}
      {addresses.map((address: Address) => {
        const stripe = addressStripeColor(address.type);
        const iconBg = addressIconBg(address.type);
        return (
          <TouchableOpacity
            key={address.id}
            style={[s.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onEditAddress(address)}
            activeOpacity={0.75}
          >
            <View style={[s.listStripe, { backgroundColor: stripe }]} />
            <View style={[s.listIconWrap, { backgroundColor: iconBg }]}>
              <Text style={s.listIconEmoji}>{addressIconEmoji(address.type)}</Text>
            </View>
            <View style={s.listInfo}>
              <Text style={[s.listTitle, { color: colors.text }]} numberOfLines={1}>{address.name}</Text>
              <Text style={[s.listSub, { color: colors.textLight }]} numberOfLines={1}>{address.address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
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
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#7A6A58",
    fontFamily: F.sans400,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  addBtnTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 14,
    fontFamily: F.sans600,
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
  listIconEmoji: {
    fontSize: 20,
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
});

export default AddressesTab;
