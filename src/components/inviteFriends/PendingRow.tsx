import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { getInitials } from "../../utils/avatarUtils";
import { User } from "../../types";
import { F } from "../../theme/fonts";

interface Props {
  invitation: any;
  friends: User[];
  isOwner: boolean;
  onCancel: (inv: any) => void;
}

const PendingRow: React.FC<Props> = ({ invitation, friends, isOwner, onCancel }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const matchedFriend = friends.find(
    (f) =>
      (invitation.inviteeEmail && f.email === invitation.inviteeEmail) ||
      (invitation.inviteePhone && f.email === invitation.inviteePhone)
  );
  const label =
    matchedFriend?.name ||
    invitation.inviteeEmail ||
    invitation.inviteePhone ||
    t("inviteFriends.guestFallback");

  const timeAgo = (() => {
    if (!invitation.createdAt) return null;
    const diff = Math.floor((Date.now() - new Date(invitation.createdAt).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}j`;
  })();

  return (
    <View
      style={[
        s.mc,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.75 },
      ]}
    >
      <View
        style={[
          s.avatar,
          {
            width: 58,
            height: 58,
            backgroundColor: colors.border,
            borderWidth: 2,
            borderColor: colors.bgMid,
          },
        ]}
      >
        <Text style={[s.avatarTxt, { fontSize: 20, color: colors.textMid }]}>
          {getInitials(label)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.mn, { color: colors.text }]}>{label}</Text>
        <Text style={[s.ms, { color: colors.textLight }]}>{t("inviteFriends.pendingLabel")}</Text>
        {timeAgo != null && (
          <Text style={[s.ms, { color: colors.textLight }]}>
            {t("inviteFriends.timeAgo", { time: timeAgo })}
          </Text>
        )}
      </View>
      {isOwner && (
        <TouchableOpacity onPress={() => onCancel(invitation)}>
          <Text style={s.cancelTxt}>{t("inviteFriends.cancelBtn")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  mc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 14,
    minHeight: 98,
  },
  avatar: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarTxt: { fontFamily: F.sans600, color: "#FFFFFF" },
  mn: { fontFamily: F.sans600, fontSize: 18 },
  ms: { fontFamily: F.sans400, fontSize: 14, marginTop: 4 },
  cancelTxt: { fontFamily: F.sans600, fontSize: 15, color: "#C04040" },
});

export default PendingRow;
