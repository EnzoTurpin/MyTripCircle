import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Booking } from "../../types";
import { F } from "../../theme/fonts";
import { getTypeColors, STATUS_COLORS } from "./bookingFormConstants";

// ─── TypePill ────────────────────────────────────────────────────────────────

interface TypePillProps {
  type: Booking["type"];
  isSelected: boolean;
  label: string;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}

export const TypePill: React.FC<TypePillProps> = ({ type, isSelected, label, colors, isDark, onPress }) => {
  const typeColor = getTypeColors(isDark)[type];
  return (
    <TouchableOpacity
      style={[
        styles.typePill,
        isSelected
          ? { backgroundColor: typeColor.bg, borderColor: typeColor.border, borderWidth: 1.5 }
          : { backgroundColor: colors.bgMid, borderColor: colors.border, borderWidth: 1 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.typePillText, { color: isSelected ? typeColor.text : colors.textMid }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ─── StatusPillItem ───────────────────────────────────────────────────────────

interface StatusPillItemProps {
  status: Booking["status"];
  label: string;
  isSelected: boolean;
  colors: any;
  onPress: () => void;
}

export const StatusPillItem: React.FC<StatusPillItemProps> = ({ status, label, isSelected, colors, onPress }) => {
  const color = STATUS_COLORS[status] || colors.textMid;
  return (
    <TouchableOpacity
      style={[styles.statusPill, {
        backgroundColor: isSelected ? `${color}20` : colors.bgMid,
        borderColor: isSelected ? color : colors.border,
        borderWidth: isSelected ? 1.5 : 1,
      }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.statusPillText, { color: isSelected ? color : colors.textMid, fontFamily: isSelected ? F.sans600 : F.sans400 }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  typePill: { borderRadius: 24, paddingVertical: 11, paddingHorizontal: 20 },
  typePillText: { fontSize: 16, fontFamily: F.sans600 },
  statusPill: { flex: 1, borderRadius: 20, paddingVertical: 13, alignItems: "center" },
  statusPillText: { fontSize: 15 },
});
