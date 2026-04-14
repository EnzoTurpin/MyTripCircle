import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { F } from "../../theme/fonts";
import { RADIUS } from "../../theme";

interface PickerModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  colors: any;
  t: (key: string) => string;
}

const PickerModal: React.FC<PickerModalProps> = ({ visible, title, onClose, children, colors, t }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={(e) => e.stopPropagation()}
        style={[styles.content, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={[styles.pickerWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>{children}</View>
        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.textMid }]}>{t("common.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.confirmButton, { backgroundColor: colors.terra }]} onPress={onClose}>
            <Text style={styles.confirmText}>{t("common.confirm")}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(42, 35, 24, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: { fontSize: 20, fontFamily: F.sans700, marginBottom: 15, textAlign: "center" },
  pickerWrapper: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
    borderWidth: 2,
  },
  cancelText: { fontSize: 16, fontFamily: F.sans600 },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
  },
  confirmText: { color: "white", fontSize: 16, fontFamily: F.sans700 },
});

export default PickerModal;
