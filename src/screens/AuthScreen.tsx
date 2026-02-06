import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ModernButton } from "../components/ModernButton";

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, "Auth">;

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { login, register, loading } = useAuth();
  const { t } = useTranslation();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const validatePasswordRequired = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError(t("common.fillAllFields"));
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validatePasswordStrong = (passwordValue: string): boolean => {
    if (!validatePasswordRequired(passwordValue)) return false;
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

  const validateName = (nameValue: string): boolean => {
    if (!nameValue || nameValue.trim().length < 2) {
      setNameError(t("common.fillAllFields"));
      return false;
    }
    setNameError("");
    return true;
  };

  const validatePhone = (phoneValue: string): boolean => {
    const value = phoneValue.trim();
    if (!value) {
      setPhoneError(t("common.fillAllFields"));
      return false;
    }
    const phoneRegex = /^[+]?[\d\s().-]{7,20}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError(t("common.invalidPhone"));
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateConfirmPassword = (confirmPasswordValue: string): boolean => {
    if (!confirmPasswordValue) {
      setConfirmPasswordError(t("common.fillAllFields"));
      return false;
    }
    if (confirmPasswordValue !== password) {
      setConfirmPasswordError(t("common.passwordsDoNotMatch") || "Les mots de passe ne correspondent pas");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  // Format phone number as: 06 66 66 66 66
  const formatPhoneNumber = (text: string): string => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "");

    // Limit to 10 digits for French numbers
    const trimmed = cleaned.slice(0, 10);

    // Add space every 2 digits
    const formatted = trimmed.replace(/(\d{2})(?=\d)/g, "$1 ");

    return formatted;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    if (phoneError) setPhoneError("");
  };

  const handleSubmit = async () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");
    setPhoneError("");

    // Validate fields
    let isValid = true;

    if (!isLogin && !validateName(name)) {
      isValid = false;
    }

    if (!isLogin && !validatePhone(phone)) {
      isValid = false;
    }

    if (!validateEmail(email)) {
      isValid = false;
    }

    if (isLogin) {
      if (!validatePasswordRequired(password)) isValid = false;
    } else {
      if (!validatePasswordStrong(password)) isValid = false;
      if (!validateConfirmPassword(confirmPassword)) isValid = false;
    }

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          // Check if user needs to verify OTP first
          if (result.requiresOtp && result.userId) {
            // Check if OTP expired or not based on the error message
            const isExpired = result.error?.includes("expired");
            const message = isExpired ? t("common.requiresOtpExpired") : t("common.requiresOtp");
            Alert.alert(
              t("common.info"),
              message,
              [
                {
                  text: t("common.ok"),
                  onPress: () => {
                    (navigation as any).navigate("Otp", { userId: result.userId });
                  },
                },
              ],
            );
            return;
          }
          // Prefer field-level errors for auth
          if (result.field === "email") setEmailError(result.error);
          else if (result.field === "password") {
            setPasswordError(
              result.error.includes("Invalid credentials")
                ? t("common.invalidCredentials")
                : result.error,
            );
          } else {
            setPasswordError(
              result.error.includes("Invalid credentials")
                ? t("common.invalidCredentials")
                : result.error,
            );
          }
          return;
        }
      } else {
        const result = await register(name, email, password, phone.trim());
        if (!result.success) {
          if (result.field === "name") setNameError(result.error);
          else if (result.field === "phone") {
            setPhoneError(
              result.error.includes("Invalid phone")
                ? t("common.invalidPhone")
                : result.error,
            );
          } else if (result.field === "email") {
            setEmailError(
              result.error.includes("Email already in use")
                ? t("common.emailAlreadyInUse")
                : result.error,
            );
          } else if (result.field === "password") {
            setPasswordError(
              result.error.includes("Weak password") ||
                result.error.includes("Password must be at least")
                ? t("common.invalidPassword")
                : result.error,
            );
          } else {
            Alert.alert(
              t("common.error"),
              result.error || t("common.registerFailed"),
            );
          }
          return;
        }

        // If userId is returned, redirect to OTP screen
        if (result.userId) {
          (navigation as any).navigate("Otp", { userId: result.userId });
        }
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("common.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2891FF", "#8869FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>{t("appName") || "MyTripCircle"}</Text>
            <Text style={styles.subtitle}>
              {t("slogan") || "Organisez vos voyages ensemble"}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.form,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isLogin ? t("common.welcomeBack") : t("common.createAccount")}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin
                  ? t("common.loginToContinue")
                  : t("common.signUpToStart")}
              </Text>
            </View>

            {!isLogin && (
              <View>
                <View
                  style={[
                    styles.inputContainer,
                    nameError && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={nameError ? "#FF3B30" : "#2891FF"}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t("common.fullName")}
                    placeholderTextColor={"#BDBDBD"}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) setNameError("");
                    }}
                    onBlur={() => !isLogin && validateName(name)}
                    autoCapitalize="words"
                  />
                </View>
                {nameError ? (
                  <Text style={styles.errorText}>{nameError}</Text>
                ) : null}
              </View>
            )}

            {!isLogin && (
              <View>
                <View
                  style={[
                    styles.inputContainer,
                    phoneError && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={phoneError ? "#FF3B30" : "#2891FF"}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t("common.phone")}
                    placeholderTextColor={"#BDBDBD"}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    onBlur={() => !isLogin && validatePhone(phone)}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
                {phoneError ? (
                  <Text style={styles.errorText}>{phoneError}</Text>
                ) : null}
              </View>
            )}

            <View>
              <View
                style={[
                  styles.inputContainer,
                  emailError && styles.inputContainerError,
                ]}
              >
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={emailError ? "#FF3B30" : "#2891FF"}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t("common.email")}
                  placeholderTextColor={"#BDBDBD"}
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

            <View>
              <View
                style={[
                  styles.inputContainer,
                  passwordError && styles.inputContainerError,
                ]}
              >
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passwordError ? "#FF3B30" : "#2891FF"}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={t("common.password")}
                  placeholderTextColor={"#BDBDBD"}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  onBlur={() =>
                    isLogin
                      ? validatePasswordRequired(password)
                      : validatePasswordStrong(password)
                  }
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={"#BDBDBD"}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {!isLogin && (
              <View>
                <View
                  style={[
                    styles.inputContainer,
                    confirmPasswordError && styles.inputContainerError,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={confirmPasswordError ? "#FF3B30" : "#2891FF"}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t("common.confirmPassword") || "Confirmer le mot de passe"}
                    placeholderTextColor={"#BDBDBD"}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError("");
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={"#BDBDBD"}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>
            )}

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() =>
                  (navigation as any).navigate("ForgotPassword", {})
                }
                activeOpacity={0.8}
              >
                <Text style={styles.forgotText}>
                  {t("common.forgotPassword")}
                </Text>
              </TouchableOpacity>
            )}

            <ModernButton
              title={
                loading || isSubmitting
                  ? t("common.pleaseWait")
                  : isLogin
                    ? t("common.signIn")
                    : t("common.signUp")
              }
              onPress={handleSubmit}
              disabled={loading || isSubmitting}
              variant="primary"
              gradient
              size="large"
              fullWidth
              icon={
                loading || isSubmitting
                  ? "hourglass"
                  : isLogin
                    ? "log-in-outline"
                    : "person-add-outline"
              }
              style={styles.submitButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {isLogin ? t("common.noAccount") : t("common.haveAccount")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  // Reset errors when switching modes
                  setEmailError("");
                  setPasswordError("");
                  setConfirmPasswordError("");
                  setNameError("");
                  setPhoneError("");
                  setPhone("");
                  setConfirmPassword("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.switchLink}>
                  {isLogin ? t("common.signUp") : t("common.signIn")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("common.termsAgree")}</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>
                {t("common.termsAndConditions")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center" as const,
    padding: 24,
  },
  header: {
    alignItems: "center" as const,
    marginTop: 78,
    marginBottom: 64,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center" as const,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  formHeader: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#616161",
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputContainerError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
    paddingVertical: 8,
    letterSpacing: 0,
  },
  eyeButton: {
    padding: 8,
  },
  forgotButton: {
    alignSelf: "flex-end" as const,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 14,
    color: "#2891FF",
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 16,
  },
  divider: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#616161",
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: "#616161",
    marginRight: 4,
  },
  switchLink: {
    fontSize: 16,
    color: "#2891FF",
    fontWeight: "700",
  },
  footer: {
    marginTop: 32,
    alignItems: "center" as const,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
    textDecorationLine: "underline" as const,
  },
});

export default AuthScreen;
