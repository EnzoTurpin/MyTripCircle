import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { TabKey } from "../../utils/invitationUtils";
import { F } from "../../theme/fonts";

const EMPTY_ICONS: Record<TabKey, string> = {
  all:     "mail-unread-outline",
  pending: "time-outline",
  sent:    "paper-plane-outline",
};

interface EmptyStateProps {
  tab: TabKey;
}

const EmptyState: React.FC<EmptyStateProps> = ({ tab }) => {
  const { t }      = useTranslation();
  const { colors } = useTheme();

  const icon = EMPTY_ICONS[tab];
  const title =
    tab === "all"     ? t("invitation.emptyAllTitle")     :
    tab === "pending" ? t("invitation.emptyPendingTitle") :
                        t("invitation.emptySentTitle");
  const sub =
    tab === "all"     ? t("invitation.emptyAllSub")     :
    tab === "pending" ? t("invitation.emptyPendingSub") :
                        t("invitation.emptySentSub");

  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyCircle, { backgroundColor: colors.bgMid }]}>
        <Ionicons name={icon as any} size={46} color={colors.textLight} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptySub, { color: colors.textMid }]}>{sub}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyWrap:   { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle:  { fontSize: 20, fontFamily: F.sans600, color: "#2A2318", marginBottom: 10 },
  emptySub:    { fontSize: 15, fontFamily: F.sans400, color: "#7A6A58", textAlign: "center", paddingHorizontal: 32, lineHeight: 22 },
});

export default EmptyState;
