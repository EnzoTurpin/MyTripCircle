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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { RootStackParamList } from "../types";
import ApiService from "../services/ApiService";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";

type ForgotPasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  "ForgotPassword"
>;
type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

const ForgotPasswordScreen: React.FC = () => {
  const route = useRoute<ForgotPasswordScreenRouteProp>();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { t } = useTranslation();
  const { token } = route.params || {};

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resetToken, setResetToken] = useState(token || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    // min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
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
    if (!validateEmail(email)) {
      return;
    }

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
      const errorMessage =
        (error as Error)?.message || t("forgotPassword.requestError");
      setEmailError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;
    if (!validatePasswordStrong(newPassword)) {
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t("common.fillAllFields"));
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t("forgotPassword.passwordsDontMatch"));
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      await ApiService.resetPassword(resetToken, newPassword);
      Alert.alert(
        t("forgotPassword.successTitle"),
        t("forgotPassword.successMessage"),
        [
          {
            text: t("common.ok"),
            onPress: () => navigation.navigate("Auth"),
          },
        ],
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMessage =
        (error as Error)?.message || t("forgotPassword.resetError");
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isResetMode = !!resetToken;

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#2891FF", "#8869FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.3)",
                  "rgba(255, 255, 255, 0.1)",
                ]}
                style={styles.iconGradient}
              >
                <Ionicons
                  name={isResetMode ? "key" : "mail"}
                  size={40}
                  color="white"
                />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>
              {isResetMode
                ? t("forgotPassword.resetPasswordTitle")
                : t("forgotPassword.title")}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isResetMode
                ? t("forgotPassword.resetPasswordSubtitle")
                : t("forgotPassword.subtitle")}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {!isResetMode ? (
            <ModernCard variant="elevated" style={styles.formCard}>
              {emailSent ? (
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={64}
                      color="#34C759"
                    />
                  </View>
                  <Text style={styles.successTitle}>
                    {t("forgotPassword.emailSentTitle")}
                  </Text>
                  <Text style={styles.successMessage}>
                    {t("forgotPassword.emailSentMessage", { email })}
                  </Text>
                  <Text style={styles.successHint}>
                    {t("forgotPassword.checkEmailHint")}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t("common.email")}</Text>
                    <View
                      style={[
                        styles.inputContainer,
                        emailError && styles.inputContainerError,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={emailError ? "#FF3B30" : "#616161"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder={t("forgotPassword.emailPlaceholder")}
                        placeholderTextColor="#9E9E9E"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          if (emailError) setEmailError("");
                        }}
                        onBlur={() => validateEmail(email)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    {emailError ? (
                      <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}
                  </View>

                  <ModernButton
                    title={t("forgotPassword.sendResetLink")}
                    onPress={handleRequestReset}
                    variant="primary"
                    gradient
                    size="large"
                    fullWidth
                    icon={loading ? "hourglass" : "send"}
                    disabled={loading}
                    loading={loading}
                    style={styles.submitButton}
                  />
                </>
              )}
            </ModernCard>
          ) : (
            <ModernCard variant="elevated" style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t("forgotPassword.newPasswordLabel")}
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    passwordError && styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passwordError ? "#FF3B30" : "#616161"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder={t("forgotPassword.newPasswordPlaceholder")}
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (passwordError) setPasswordError("");
                    }}
                    onBlur={() => validatePasswordStrong(newPassword)}
                    style={styles.input}
                  />
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t("forgotPassword.confirmPasswordLabel")}
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    confirmPasswordError && styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={confirmPasswordError ? "#FF3B30" : "#616161"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder={t("forgotPassword.confirmPasswordPlaceholder")}
                    placeholderTextColor="#9E9E9E"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError("");
                    }}
                    style={styles.input}
                  />
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>

              <ModernButton
                title={t("forgotPassword.resetPassword")}
                onPress={handleResetPassword}
                variant="primary"
                gradient
                size="large"
                fullWidth
                icon={loading ? "hourglass" : "checkmark-circle"}
                disabled={loading}
                loading={loading}
                style={styles.submitButton}
              />
            </ModernCard>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 64 + 10 : 24,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -20,
    marginTop: 5,
    zIndex: 10,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    marginTop: -100,
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  formCard: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#212121",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#616161",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  successHint: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default ForgotPasswordScreen;
