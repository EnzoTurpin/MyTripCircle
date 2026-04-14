import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";

interface Props {
  progressPercent: number;
  daysPassed: number;
  durationDays: number;
}

const TripProgressBar: React.FC<Props> = ({ progressPercent, daysPassed, durationDays }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={s.progressSection}>
      <View style={s.progressLabelRow}>
        <Text style={[s.progressLabel, { color: colors.text }]}>{t("tripDetails.progress")}</Text>
        <Text style={[s.progressDays, { color: colors.textMid }]}>
          {t("tripDetails.progressDays", { passed: daysPassed, total: durationDays })}
        </Text>
      </View>
      <View style={[s.progressTrack, { backgroundColor: colors.bgMid }]}>
        <View style={[s.progressFill, { width: `${progressPercent}%` as any, backgroundColor: colors.terra }]} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 16,
    fontFamily: F.sans600,
  },
  progressDays: {
    fontSize: 16,
    fontFamily: F.sans400,
  },
  progressTrack: {
    height: 14,
    borderRadius: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
  },
});

export default TripProgressBar;
