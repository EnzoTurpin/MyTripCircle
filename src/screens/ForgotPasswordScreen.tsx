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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types";
import ApiService from "../services/ApiService";
import { useAuth } from "../contexts/AuthContext";
import { F } from "../theme/fonts";
import { COLORS as C } from "../theme/colors";
import { parseApiError } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";

type ForgotPasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  "ForgotPassword"
>;
type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

// ─── Labelled input ───────────────────────────────────────────────────────────
interface LabelledInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
  showToggle?: boolean;
  showValue?: boolean;
  onToggleShow?: () => void;
  hasError?: boolean;
  errorText?: string;
}

const LabelledInput: React.FC<LabelledInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  showToggle = false,
  showValue = false,
  onToggleShow,
  hasError = false,
  errorText,
}) => {
  const { colors } = useTheme();
  return (
    <View style={inputStyles.wrapper}>
      <View style={[inputStyles.box, { backgroundColor: colors.surface, borderColor: colors.border }, hasError && inputStyles.boxError]}>
        <Text style={[inputStyles.label, { color: colors.textLight }]}>{label}</Text>
        <View style={inputStyles.row}>
          <TextInput
            style={[inputStyles.value, { color: colors.text }]}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            keyboardType={keyboardType}
            autoCapitalize="none"
            secureTextEntry={secureTextEntry && !showValue}
          />
          {showToggle && onToggleShow && (
            <TouchableOpacity onPress={onToggleShow} style={inputStyles.eye}>
              <Ionicons
                name={showValue ? "eye-outline" : "eye-off-outline"}
                size={16}
                color={colors.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {hasError && errorText ? (
        <Text style={inputStyles.error}>{errorText}</Text>
      ) : null}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  box: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8CCBA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  boxError: { borderColor: "#C04040" },
  label: {
    fontSize: 11,
    color: "#B0A090",
    marginBottom: 2,
    fontFamily: F.sans500,
  },
  row: { flexDirection: "row", alignItems: "center" },
  value: {
    flex: 1,
    fontSize: 14,
    color: "#2A2318",
    paddingVertical: 2,
    fontFamily: F.sans400,
  },
  eye: { padding: 4, marginLeft: 4 },
  error: {
    fontSize: 12,
    color: "#C04040",
    marginTop: 4,
    marginLeft: 2,
    fontFamily: F.sans400,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const ForgotPasswordScreen: React.FC = () => {
  const route = useRoute<ForgotPasswordScreenRouteProp>();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { t } = useTranslation();
  const { loginWithToken } = useAuth();
  const { colors } = useTheme();
  const resetCode = route.params?.code || "";

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(!!resetCode);

  React.useEffect(() => {
    if (!resetCode) return;
    ApiService.verifyResetToken(resetCode)
      .then((res) => { if (!res.success) setTokenInvalid(true); })
      .catch(() => setTokenInvalid(true))
      .finally(() => setTokenChecking(false));
  }, [resetCode]);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,253}\.[a-zA-Z]{2,}$/;
    if (!emailValue) {
      setEmailError(t("common.fillAllFields"));
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError(t("common.invalidEmail"));
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePasswordStrong = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError(t("common.fillAllFields"));
      return false;
    }
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(passwordValue)) {
      setPasswordError(t("common.invalidPassword"));
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleRequestReset = async () => {
    setEmailError("");
    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      await ApiService.requestPasswordReset(email);
      setEmailSent(true);
      Alert.alert(
        t("forgotPassword.emailSentTitle"),
        t("forgotPassword.emailSentMessage", { email }),
      );
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setEmailError(
        parseApiError(error) || t("forgotPassword.requestError"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;
    if (!validatePasswordStrong(newPassword)) isValid = false;

    if (!confirmPassword) {
      setConfirmPasswordError(t("common.fillAllFields"));
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t("forgotPassword.passwordsDontMatch"));
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const res = await ApiService.resetPassword(resetCode, newPassword);
      if (res.token && res.user) {
        await loginWithToken(res.token, res.user);
      } else {
        Alert.alert(
          t("forgotPassword.successTitle"),
          t("forgotPassword.successMessage"),
          [{ text: t("common.ok"), onPress: () => navigation.navigate("Auth") }],
        );
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      Alert.alert(
        t("common.error"),
        parseApiError(error) || t("forgotPassword.resetError"),
      );
    } finally {
      setLoading(false);
    }
  };

  const isResetMode = !!resetCode;
  const showVerifying = isResetMode && tokenChecking;
  const showInvalidToken = isResetMode && tokenInvalid;

  const headings = isResetMode
    ? { title: t("forgotPassword.resetPasswordTitle"), subtitle: t("forgotPassword.resetPasswordSubtitle") }
    : { title: t("forgotPassword.title"), subtitle: t("forgotPassword.subtitle") };
  const btnDisabledStyle = loading ? styles.primaryButtonDisabled : undefined;
  const btnLabels = loading
    ? { reset: t("common.pleaseWait"), request: t("common.pleaseWait") }
    : { reset: t("forgotPassword.resetPassword"), request: t("forgotPassword.sendResetLink") };

  let mainContent: React.ReactNode;
  if (showVerifying) {
    mainContent = (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>{t("forgotPassword.verifyingToken")}</Text>
      </View>
    );
  } else if (showInvalidToken) {
    mainContent = (
      <View style={styles.successContainer}>
        <Ionicons name="lock-closed" size={56} color={colors.danger} />
        <Text style={[styles.successTitle, { color: colors.danger }]}>
          {t("forgotPassword.invalidLinkTitle")}
        </Text>
        <Text style={[styles.successMessage, { color: colors.textMid }]}>
          {t("forgotPassword.invalidLinkMessage")}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Auth")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{t("forgotPassword.backToLogin")}</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (isResetMode) {
    mainContent = (
      <>
        <LabelledInput
          label={t("forgotPassword.newPasswordLabel")}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (passwordError) setPasswordError("");
          }}
          onBlur={() => validatePasswordStrong(newPassword)}
          placeholder={t("forgotPassword.newPasswordPlaceholder")}
          secureTextEntry
          showToggle
          showValue={showPassword}
          onToggleShow={() => setShowPassword(!showPassword)}
          hasError={!!passwordError}
          errorText={passwordError}
        />
        <LabelledInput
          label={t("forgotPassword.confirmPasswordLabel")}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError("");
          }}
          placeholder={t("forgotPassword.confirmPasswordPlaceholder")}
          secureTextEntry
          showToggle
          showValue={showConfirmPassword}
          onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
          hasError={!!confirmPasswordError}
          errorText={confirmPasswordError}
        />
        <TouchableOpacity
          style={[styles.primaryButton, btnDisabledStyle]}
          onPress={handleResetPassword}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{btnLabels.reset}</Text>
        </TouchableOpacity>
      </>
    );
  } else if (emailSent) {
    mainContent = (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={56} color={colors.terra} />
        <Text style={[styles.successTitle, { color: colors.text }]}>
          {t("forgotPassword.emailSentTitle")}
        </Text>
        <Text style={[styles.successMessage, { color: colors.textMid }]}>
          {t("forgotPassword.emailSentMessage", { email })}
        </Text>
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={16} color={C.moss} style={{ marginRight: 6 }} />
          <Text style={styles.hintText}>{t("forgotPassword.checkEmailHint")}</Text>
        </View>
      </View>
    );
  } else {
    mainContent = (
      <>
        <LabelledInput
          label={t("common.email")}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError("");
          }}
          onBlur={() => validateEmail(email)}
          placeholder={t("forgotPassword.emailPlaceholder")}
          keyboardType="email-address"
          hasError={!!emailError}
          errorText={emailError}
        />
        <TouchableOpacity
          style={[styles.primaryButton, btnDisabledStyle]}
          onPress={handleRequestReset}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{btnLabels.request}</Text>
        </TouchableOpacity>
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={16} color={C.moss} style={{ marginRight: 6 }} />
          <Text style={styles.hintText}>{t("forgotPassword.spamHint")}</Text>
        </View>
      </>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.bgDark }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Center block */}
        <View style={styles.centerBlock}>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={[styles.title, { color: colors.text }]}>{headings.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textMid }]}>{headings.subtitle}</Text>
        </View>

        {mainContent}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: 48,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 24,
    left: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D8CCBA",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  centerBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: F.sans700,
    color: "#2A2318",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A6A58",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: F.sans400,
  },
  card: {
  },
  // Hint box (green)
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E2EDD9",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    marginBottom: 0,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: "#6B8C5A",
    lineHeight: 18,
    fontFamily: F.sans400,
  },
  // Primary button
  primaryButton: {
    backgroundColor: "#C4714A",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#C4714A",
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
    fontSize: 16,
    fontFamily: F.sans700,
  },
  // Success
  successContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: F.sans700,
    color: "#2A2318",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#7A6A58",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: F.sans400,
  },
});

export default ForgotPasswordScreen;
