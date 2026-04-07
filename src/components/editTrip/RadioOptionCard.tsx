import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { F } from "../../theme/fonts";

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  desc: string;
  emoji: string;
  selBg: string;
  selColor: string;
  dotColor: string;
}

interface Props<T extends string> {
  options: RadioOption<T>[];
  selected: T;
  isDark: boolean;
  colors: { surface: string; border: string; bg: string; bgMid: string; text: string; textLight: string };
  onChange: (value: T) => void;
}

/**
 * Carte de sélection par radio-bouton réutilisable.
 * Utilisée pour la visibilité et le statut du voyage.
 */
function RadioOptionCard<T extends string>({ options, selected, isDark, colors, onChange }: Props<T>) {
  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {options.map(({ value, label, desc, emoji, selBg, selColor, dotColor }, idx) => {
        const sel = selected === value;
        return (
          <React.Fragment key={value}>
            {idx > 0 && <View style={[s.divider, { backgroundColor: colors.bg }]} />}
            <TouchableOpacity
              style={[s.row, sel && { backgroundColor: isDark ? `${dotColor}22` : selBg }]}
              onPress={() => onChange(value)}
              activeOpacity={0.75}
            >
              <View style={[s.icon, { backgroundColor: sel ? `${dotColor}22` : colors.bgMid }]}>
                <Text style={s.emoji}>{emoji}</Text>
              </View>
              <View style={s.info}>
                <Text style={[s.label, { color: colors.text }, sel && { color: selColor }]}>
                  {label}
                </Text>
                <Text style={[s.desc, { color: colors.textLight }, sel && { color: selColor, opacity: 0.8 }]}>
                  {desc}
                </Text>
              </View>
              <View style={[s.dot, { borderColor: colors.border }, sel && { backgroundColor: dotColor, borderColor: dotColor }]}>
                {sel && <View style={s.dotInner} />}
              </View>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  divider: { height: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  icon: { width: 50, height: 50, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 24 },
  info: { flex: 1 },
  label: { fontSize: 17, fontFamily: F.sans600, color: "#2A2318" },
  desc: { fontSize: 13, fontFamily: F.sans400, color: "#B0A090", marginTop: 2 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  dotInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#FFFFFF" },
});

export default RadioOptionCard;
