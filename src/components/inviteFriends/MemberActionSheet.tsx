import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { CollabInfo } from "../../hooks/useInviteFriends";
import { AvatarBubble } from "./MemberRow";
import { F } from "../../theme/fonts";

interface Props {
  member: CollabInfo;
  isOwner: boolean;
  backdropAnim: Animated.Value;
  sheetY: Animated.AnimatedInterpolation<number>;
  onClose: () => void;
  onViewProfile: () => void;
  onTransfer: () => void;
  onRemove: () => void;
}

const MemberActionSheet: React.FC<Props> = ({
  member,
  isOwner,
  backdropAnim,
  sheetY,
  onClose,
  onViewProfile,
  onTransfer,
  onRemove,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropAnim }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[s.sheet, { backgroundColor: colors.bgLight, transform: [{ translateY: sheetY }] }]}
      >
        <View style={[s.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={[s.sheetId, { borderColor: colors.border }]}>
          <AvatarBubble name={member.name} size={64} />
          <View>
            <Text style={[s.sheetName, { color: colors.text }]}>{member.name}</Text>
            <Text style={[s.sheetRole, { color: colors.textLight }]}>
              {t("inviteFriends.participantRole")}
            </Text>
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={[s.sheetRow, { backgroundColor: colors.bgMid }]}
            onPress={onViewProfile}
          >
            <View style={[s.sheetIcon, { backgroundColor: "#DCF0F5" }]}>
              <Text style={{ fontSize: 26 }}>👤</Text>
            </View>
            <Text style={[s.sheetRowLabel, { flex: 1, color: colors.text }]}>
              {t("inviteFriends.viewProfile")}
            </Text>
            <Text style={{ fontSize: 24, color: colors.border }}>›</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity
              style={[s.sheetRow, { backgroundColor: colors.bgMid }]}
              onPress={onTransfer}
            >
              <View style={[s.sheetIcon, { backgroundColor: "#F5E5DC" }]}>
                <Text style={{ fontSize: 26 }}>👑</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.sheetRowLabel, { color: colors.text }]}>
                  {t("inviteFriends.appointOrganizer")}
                </Text>
                <Text style={[s.sheetRowSub, { color: colors.textLight }]}>
                  {t("inviteFriends.appointOrganizerSub")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {isOwner && (
            <TouchableOpacity style={[s.sheetRow, s.sheetRowDanger]} onPress={onRemove}>
              <View style={[s.sheetIcon, { backgroundColor: "rgba(192,64,64,0.12)" }]}>
                <Text style={{ fontSize: 26 }}>🚪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.sheetRowLabel, { color: "#C04040" }]}>
                  {t("inviteFriends.removeFromTrip")}
                </Text>
                <Text style={[s.sheetRowSub, { color: "#C04040", opacity: 0.7 }]}>
                  {t("inviteFriends.removeFromTripSub")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(42,35,24,0.45)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 20,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetId: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    marginBottom: 18,
  },
  sheetName: { fontFamily: F.sans600, fontSize: 22, color: "#2A2318" },
  sheetRole: { fontFamily: F.sans400, fontSize: 15, color: "#B0A090", marginTop: 3 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  sheetRowDanger: {
    backgroundColor: "#FDEAEA",
    borderWidth: 1,
    borderColor: "rgba(192,64,64,0.15)",
  },
  sheetIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRowLabel: { fontFamily: F.sans600, fontSize: 19, color: "#2A2318" },
  sheetRowSub: { fontFamily: F.sans400, fontSize: 14, color: "#B0A090", marginTop: 3 },
});

export default MemberActionSheet;
