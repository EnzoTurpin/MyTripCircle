import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./ticketScannerStyles";

interface FieldRowProps {
  icon: string;
  label: string;
  value: string;
  colors: any;
}

const FieldRow: React.FC<FieldRowProps> = ({ icon, label, value, colors }) => (
  <View style={styles.fieldRow}>
    <Ionicons name={icon as any} size={16} color={colors.textMid} style={{ marginRight: 8 }} />
    <Text style={[styles.fieldLabel, { color: colors.textLight }]}>{label} : </Text>
    <Text style={[styles.fieldValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
  </View>
);

export default FieldRow;
