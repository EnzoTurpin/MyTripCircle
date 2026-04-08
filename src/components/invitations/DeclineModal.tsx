import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { F } from "../../theme/fonts";
import { RADIUS, SHADOW } from "../../theme";

interface DeclineModalProps {
  visible: boolean;
  declineTarget: any;
  declineReason: string;
  declining: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onChangeReason: (text: string) => void;
}

const DeclineModal: React.FC<DeclineModalProps> = ({
  visible,
  declineTarget,
  declineReason,
  declining,
  onConfirm,
  onCancel,
  onChangeReason,
}) => {
  const { t }      = useTranslation();
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.modal, { backgroundColor: colors.bgLight }]}>
          <View style={[styles.modalIcon, { backgroundColor: colors.bgMid }]}>
            <Text style={{ fontSize: 28 }}>✕</Text>
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{t("invitation.declineTitle")}</Text>
          <Text style={[styles.modalSub, { color: colors.textMid }]}>
            {t("invitation.declineModalSub", {
              tripName: declineTarget?.tripName ?? declineTarget?.trip?.title ?? t("invitation.thisTripRef"),
              organizerName: declineTarget?.inviterName ?? declineTarget?.inviter?.name ?? t("invitation.organizerFallback"),
            })}
          </Text>

          <View style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalInputLabel, { color: colors.textLight }]}>{t("invitation.declineReasonLabel")}</Text>
            <TextInput
              style={[styles.modalInputText, { color: colors.text }]}
              placeholder={t("invitation.declineReasonPlaceholder")}
              placeholderTextColor={colors.textLight}
              value={declineReason}
              onChangeText={onChangeReason}
              multiline
              numberOfLines={2}
            />
          </View>

          <TouchableOpacity
            style={styles.modalConfirm}
            onPress={onConfirm}
            disabled={declining}
            activeOpacity={0.85}
          >
            {declining ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.modalConfirmText}>{t("invitation.confirmDecline")}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalCancel, { backgroundColor: colors.bgMid }]}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={[styles.modalCancelText, { color: colors.textMid }]}>{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(42,35,24,0.45)", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: {
    backgroundColor: "#FDFAF5", borderRadius: 24, padding: 24, width: "100%",
    ...SHADOW.strong,
  },
  modalIcon:        { width: 60, height: 60, borderRadius: 30, backgroundColor: "#EDE5D8", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
  modalTitle:       { fontSize: 20, fontFamily: F.sans700, color: "#2A2318", textAlign: "center", marginBottom: 8 },
  modalSub:         { fontSize: 14, fontFamily: F.sans400, color: "#7A6A58", textAlign: "center", lineHeight: 22, marginBottom: 18 },
  modalInput:       { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D8CCBA", borderRadius: RADIUS.button, padding: 14, marginBottom: 18 },
  modalInputLabel:  { fontSize: 12, color: "#B0A090", fontFamily: F.sans400, marginBottom: 6 },
  modalInputText:   { fontSize: 15, color: "#2A2318", fontFamily: F.sans400, minHeight: 50 },
  modalConfirm:     { backgroundColor: "#C04040", borderRadius: RADIUS.button, paddingVertical: 15, alignItems: "center", marginBottom: 10 },
  modalConfirmText: { fontSize: 16, fontFamily: F.sans600, color: "#FFFFFF" },
  modalCancel:      { backgroundColor: "#EDE5D8", borderRadius: RADIUS.button, paddingVertical: 14, alignItems: "center" },
  modalCancelText:  { fontSize: 16, fontFamily: F.sans600, color: "#7A6A58" },
});

export default DeclineModal;
