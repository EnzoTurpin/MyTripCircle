import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { F } from "../theme/fonts";
import { useTheme, AppColors } from "../contexts/ThemeContext";
import BackButton from "../components/ui/BackButton";

// ─── Labelled password input ──────────────────────────────────────────────────
interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  colors: AppColors;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
}) => {
  const [show, setShow] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      <View style={[inputStyles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[inputStyles.label, { color: colors.textLight }]}>{label}</Text>
        <View style={inputStyles.row}>
          <TextInput
            style={[inputStyles.value, { color: colors.text }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            secureTextEntry={!show}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShow(!show)} style={inputStyles.eye}>
            <Ionicons
              name={show ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  box: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  label: {
    fontSize: 13,
    marginBottom: 2,
    fontFamily: F.sans500,
  },
  row: { flexDirection: "row", alignItems: "center" },
  value: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    fontFamily: F.sans400,
  },
  eye: { padding: 4, marginLeft: 4 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();
  const { colors } = useTheme();

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("common.error"), t("changePassword.fillAllFields"));
      return;
    }

    // min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      Alert.alert(t("common.error"), t("common.invalidPassword"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("changePassword.passwordsDontMatch"));
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        t("common.error"),
        t("changePassword.passwordMustBeDifferent"),
      );
      return;
    }

    setLoading(true);

    const success = await changePassword(currentPassword, newPassword);

    setLoading(false);

    if (success) {
      Alert.alert(
        t("changePassword.successTitle"),
        t("changePassword.successMessage"),
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigation.goBack();
    } else {
      Alert.alert(t("common.error"), t("changePassword.errorMessage"));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={[styles.title, { color: colors.text }]}>{t("changePassword.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textMid }]}>{t("changePassword.subtitle")}</Text>
        </View>

        {/* Form card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <PasswordInput
            label={t("changePassword.currentPasswordLabel")}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t("changePassword.currentPasswordPlaceholder")}
            colors={colors}
          />

          <PasswordInput
            label={t("changePassword.newPasswordLabel")}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("changePassword.newPasswordPlaceholder")}
            colors={colors}
          />

          <PasswordInput
            label={t("changePassword.confirmPasswordLabel")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("changePassword.confirmPasswordPlaceholder")}
            colors={colors}
          />

          {/* Save button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.terra, shadowColor: colors.terra }, loading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryButtonText}>
              {loading
                ? t("changePassword.saving")
                : t("changePassword.saveButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: Platform.OS === "ios" ? 56 : 24,
  },
  backButton: {
    marginBottom: 32,
  },
  headerBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: F.sans700,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: F.sans400,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: F.sans700,
  },
});

export default ChangePasswordScreen;
