import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";

interface Props {
  bookingsCount: number;
  addressesCount: number;
  totalBudget: number;
  totalMembers: number;
}

const TripStatsRow: React.FC<Props> = ({
  bookingsCount,
  addressesCount,
  totalBudget,
  totalMembers,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const stats = [
    { value: String(bookingsCount), label: t("tripDetails.statsBookings") },
    { value: String(addressesCount), label: t("tripDetails.statsAddresses") },
    { value: totalBudget > 0 ? `${totalBudget}€` : "—", label: t("tripDetails.statsBudget") },
    { value: String(totalMembers), label: t("tripDetails.statsMembers") },
  ];

  return (
    <View style={s.statsRow}>
      {stats.map((stat) => (
        <View key={stat.label} style={[s.statPill, { backgroundColor: colors.bgMid }]}>
          <Text style={s.statValue}>{stat.value}</Text>
          <Text style={[s.statLabel, { color: colors.textLight }]}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  statPill: {
    flex: 1,
    backgroundColor: "#EDE5D8",
    borderRadius: RADIUS.card,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontFamily: F.sans700,
    color: "#C4714A",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#B0A090",
    fontFamily: F.sans400,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});

export default TripStatsRow;
