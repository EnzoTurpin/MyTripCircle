import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

const TripNewCard: React.FC<Props> = ({ onPress, disabled }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.dashedCard, { borderColor: colors.bgDark, backgroundColor: colors.bg }, disabled && { opacity: 0.4 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.dashedAddCircle, { backgroundColor: colors.terraLight }]}>
        <Text style={[styles.dashedAddPlus, { color: colors.terra }]}>+</Text>
      </View>
      <Text style={[styles.dashedNewLabel, { color: colors.textLight }]}>{t("trips.newButton")}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dashedCard: {
    width: 190,
    height: 176,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dashedAddCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  dashedAddPlus: { fontSize: 36, lineHeight: 38, fontFamily: F.sans400 },
  dashedNewLabel: { fontSize: 14, fontFamily: F.sans500 },
});

export default TripNewCard;
