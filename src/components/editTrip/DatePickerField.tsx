import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { F } from "../../theme/fonts";
import { useTheme } from "../../contexts/ThemeContext";

interface Props {
  label: string;
  isActive: boolean;
  dateValue: string;
  onPress: () => void;
}

const DatePickerField: React.FC<Props> = ({ label, isActive, dateValue, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.field,
        styles.fieldNoMargin,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isActive && styles.fieldActive,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.fieldLbl, { color: colors.textLight }, isActive && { color: "#C4714A" }]}>
        {label}{isActive ? " ✎" : ""}
      </Text>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldEmoji}>📅</Text>
        <Text style={[styles.dateVal, { color: colors.text }, isActive && { color: "#C4714A", fontFamily: F.sans700 }]}>
          {dateValue}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderColor: "#D8CCBA",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
  },
  fieldActive: {
    borderColor: "#C4714A",
    shadowColor: "#C4714A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2,
  },
  fieldNoMargin: { marginBottom: 0 },
  fieldLbl: {
    fontSize: 12,
    fontFamily: F.sans600,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  fieldEmoji: { fontSize: 18 },
  dateVal: { fontSize: 17, fontFamily: F.sans500 },
});

export default DatePickerField;
