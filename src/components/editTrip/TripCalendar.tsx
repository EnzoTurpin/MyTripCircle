import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { F } from "../../theme/fonts";

const buildCalendarCells = (year: number, month: number): (number | null)[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

interface Props {
  year: number;
  month: number;
  startDate: Date;
  endDate: Date;
  months: string[];
  days: string[];
  periodLabel: string;
  periodRangeLabel: string;
  colors: {
    surface: string;
    border: string;
    bgMid: string;
    text: string;
    textMid: string;
  };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayPress: (day: number) => void;
}

const TripCalendar: React.FC<Props> = ({
  year,
  month,
  startDate,
  endDate,
  months,
  days,
  periodLabel,
  periodRangeLabel,
  colors,
  onPrevMonth,
  onNextMonth,
  onDayPress,
}) => {
  const cells = buildCalendarCells(year, month);

  return (
    <View
      style={[s.calendar, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onStartShouldSetResponder={() => true}
    >
      {/* Navigation mois */}
      <View style={s.calNav}>
        <TouchableOpacity
          onPress={onPrevMonth}
          style={[s.calNavBtn, { backgroundColor: colors.bgMid }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textMid} />
        </TouchableOpacity>
        <Text style={[s.calNavTitle, { color: colors.text }]}>
          {months[month]} {year}
        </Text>
        <TouchableOpacity
          onPress={onNextMonth}
          style={[s.calNavBtn, { backgroundColor: colors.bgMid }]}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textMid} />
        </TouchableOpacity>
      </View>

      {/* En-têtes jours */}
      <View style={s.calDaysRow}>
        {days.map((d, i) => (
          <Text key={d} style={[s.calDayHeader, i >= 5 && s.calDayHeaderWeekend]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Grille jours */}
      <View style={s.calGrid}>
        {cells.map((day, idx) => {
          const cellKey = `${year}-${month}-${idx}`;
          if (!day) return <View key={cellKey} style={s.calCell} />;

          const isStart =
            startDate.getFullYear() === year &&
            startDate.getMonth() === month &&
            startDate.getDate() === day;
          const isEnd =
            endDate.getFullYear() === year &&
            endDate.getMonth() === month &&
            endDate.getDate() === day;
          const d = new Date(year, month, day);
          const inRange = d > startDate && d < endDate;
          const sameDay = isStart && isEnd;
          const roundLeft = isStart || sameDay || (inRange && idx % 7 === 0);
          const roundRight = isEnd || sameDay || (inRange && idx % 7 === 6);

          return (
            <TouchableOpacity
              key={cellKey}
              style={[
                s.calCell,
                (isStart || isEnd || inRange) && {
                  backgroundColor: isStart || isEnd ? "#C4714A" : "rgba(196,113,74,0.15)",
                  borderTopLeftRadius: roundLeft ? 8 : 0,
                  borderBottomLeftRadius: roundLeft ? 8 : 0,
                  borderTopRightRadius: roundRight ? 8 : 0,
                  borderBottomRightRadius: roundRight ? 8 : 0,
                },
              ]}
              onPress={() => onDayPress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.calDayText,
                  { color: colors.text },
                  inRange && s.calDayTextRange,
                  (isStart || isEnd) && s.calDayTextSelected,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Légende */}
      <View style={s.calLegend}>
        <View style={s.calLegendItem}>
          <View style={[s.calLegendDot, { backgroundColor: "#C4714A" }]} />
          <Text style={[s.calLegendText, { color: colors.textMid }]}>{periodLabel}</Text>
        </View>
        <View style={s.calLegendItem}>
          <View style={[s.calLegendDot, { backgroundColor: "rgba(196,113,74,0.15)" }]} />
          <Text style={[s.calLegendText, { color: colors.textMid }]}>{periodRangeLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  calendar: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  calNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  calNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  calNavTitle: { fontSize: 17, fontFamily: F.sans600, color: "#2A2318" },
  calDaysRow: { flexDirection: "row", marginBottom: 8 },
  calDayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: F.sans600,
    color: "#B0A090",
    paddingVertical: 5,
  },
  calDayHeaderWeekend: { color: "#D8CCBA" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: {
    width: `${100 / 7}%` as any,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  calDayText: { fontSize: 16, lineHeight: 22, fontFamily: F.sans400, color: "#2A2318" },
  calDayTextRange: { color: "#C4714A", fontFamily: F.sans500 },
  calDayTextSelected: { color: "#FFFFFF", fontFamily: F.sans700 },
  calLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F0E8",
  },
  calLegendItem: { flexDirection: "row", alignItems: "center", gap: 7 },
  calLegendDot: { width: 12, height: 12, borderRadius: 4 },
  calLegendText: { fontSize: 12, fontFamily: F.sans400, color: "#7A6A58" },
});

export default TripCalendar;
