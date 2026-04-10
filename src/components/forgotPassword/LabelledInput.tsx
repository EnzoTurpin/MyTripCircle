import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { F } from "../../theme/fonts";
import { useTheme } from "../../contexts/ThemeContext";

export interface LabelledInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
  showToggle?: boolean;
  showValue?: boolean;
  onToggleShow?: () => void;
  hasError?: boolean;
  errorText?: string;
}

const LabelledInput: React.FC<LabelledInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  showToggle = false,
  showValue = false,
  onToggleShow,
  hasError = false,
  errorText,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.box,
          { backgroundColor: colors.surface, borderColor: colors.border },
          hasError && styles.boxError,
        ]}
      >
        <Text style={[styles.label, { color: colors.textLight }]}>{label}</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.value, { color: colors.text }]}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            keyboardType={keyboardType}
            autoCapitalize="none"
            secureTextEntry={secureTextEntry && !showValue}
          />
          {showToggle && onToggleShow && (
            <TouchableOpacity onPress={onToggleShow} style={styles.eye}>
              <Ionicons
                name={showValue ? "eye-outline" : "eye-off-outline"}
                size={16}
                color={colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {hasError && errorText ? (
        <Text style={styles.error}>{errorText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  box: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  boxError: { borderColor: "#C04040" },
  label: { fontSize: 11, marginBottom: 2, fontFamily: F.sans500 },
  row: { flexDirection: "row", alignItems: "center" },
  value: { flex: 1, fontSize: 14, paddingVertical: 2, fontFamily: F.sans400 },
  eye: { padding: 4, marginLeft: 4 },
  error: { fontSize: 12, color: "#C04040", marginTop: 4, marginLeft: 2, fontFamily: F.sans400 },
});

export default LabelledInput;
