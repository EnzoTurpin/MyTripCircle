import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { F } from "../../theme/fonts";
import { COLORS as C } from "../../theme/colors";

interface TripDatePickerModalProps {
  /** "start" ou "end" — détermine le titre et la valeur affichée */
  type: "start" | "end";
  value: Date;
  visible: boolean;
  colors: Record<string, any>;
  onChange: (event: any, date?: Date) => void;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Modale iOS uniquement pour la sélection d'une date.
 * Sur Android, utiliser le composant inline <AndroidDatePicker>.
 */
export const TripDatePickerModal: React.FC<TripDatePickerModalProps> = ({
  type,
  value,
  visible,
  colors,
  onChange,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const titleKey = type === "start" ? "createTrip.startDate" : "createTrip.endDate";
  const locale = i18n.language === "fr" ? "fr_FR" : "en_US";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerModalContent, { backgroundColor: colors.bgLight }]}>
          <Text style={[styles.pickerModalTitle, { color: colors.text }]}>
            {t(titleKey)}
          </Text>
          <View
            style={[
              styles.pickerWrapper,
              { backgroundColor: colors.bgMid, borderColor: colors.border },
            ]}
          >
            <DateTimePicker
              value={value}
              mode="date"
              display="spinner"
              onChange={onChange}
              textColor={colors.text}
              locale={locale}
            />
          </View>
          <View style={styles.pickerButtons}>
            <TouchableOpacity style={styles.pickerCancelButton} onPress={onClose}>
              <Text style={styles.pickerCancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerConfirmButton} onPress={onConfirm}>
              <Text style={styles.pickerConfirmText}>{t("common.confirm")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface AndroidDatePickerProps {
  value: Date;
  onChange: (event: any, date?: Date) => void;
}

/** Picker inline Android (sans modale). */
export const AndroidDatePicker: React.FC<AndroidDatePickerProps> = ({
  value,
  onChange,
}) => (
  <DateTimePicker
    value={value}
    mode="date"
    display="default"
    onChange={onChange}
  />
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModalContent: {
    backgroundColor: C.sandLight,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontFamily: F.sans700,
    color: C.ink,
    marginBottom: 14,
    textAlign: "center",
  },
  pickerWrapper: {
    backgroundColor: C.sandMid,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: C.sandDark,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  pickerCancelButton: {
    flex: 1,
    backgroundColor: C.sandMid,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.sandDark,
  },
  pickerCancelText: {
    color: C.inkMid,
    fontSize: 15,
    fontFamily: F.sans600,
  },
  pickerConfirmButton: {
    flex: 1,
    backgroundColor: C.terra,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  pickerConfirmText: {
    color: C.white,
    fontSize: 15,
    fontFamily: F.sans700,
  },
});
