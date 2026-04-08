import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { parseApiError } from "../utils/i18n";
import * as AppleAuthentication from "expo-apple-authentication";

export interface AuthFormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
}

export interface UseAuthFormReturn {
  // Champs
  name: string;
  setName: (v: string) => void;
  phone: string;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;

  // Erreurs
  errors: AuthFormErrors;
  setEmailError: (v: string) => void;
  setPasswordError: (v: string) => void;
  setConfirmPasswordError: (v: string) => void;
  setNameError: (v: string) => void;
  setPhoneError: (v: string) => void;

  // États
  isSubmitting: boolean;
  busy: boolean;

  // Handlers
  handlePhoneChange: (text: string) => void;
  validateEmail: (v: string) => boolean;
  validatePasswordRequired: (v: string) => boolean;
  validatePasswordStrong: (v: string) => boolean;
  validateName: (v: string) => boolean;
  validatePhone: (v: string) => boolean;
  validateConfirmPassword: (v: string) => boolean;
  handleSubmit: (isLogin: boolean, onOtpRedirect: (userId: string, email: string) => void) => Promise<void>;
  handleGoogleToken: (accessToken: string) => Promise<void>;
  handleAppleSignIn: () => Promise<void>;
  switchMode: () => void;
}

export function useAuthForm(): UseAuthFormReturn {
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
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { login, register, loginWithGoogle, loginWithApple, loading } = useAuth();
  const { t } = useTranslation();

  // ─── Validation ────────────────────────────────────────────────────────────

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
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
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
      setPhoneError("");
      return true;
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
      setConfirmPasswordError(t("common.passwordsDoNotMatch"));
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  // ─── Formatage téléphone ────────────────────────────────────────────────────

  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replaceAll(/\D/g, "");
    const trimmed = cleaned.slice(0, 10);
    return trimmed.replaceAll(/(\d{2})(?=\d)/g, "$1 ");
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    if (phoneError) setPhoneError("");
  };

  // ─── Réinitialisation lors du changement de mode ────────────────────────────

  const switchMode = () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");
    setPhoneError("");
    setPhone("");
    setConfirmPassword("");
    setTermsAccepted(false);
  };

  // ─── Soumission du formulaire ───────────────────────────────────────────────

  const handleSubmit = async (
    isLogin: boolean,
    onOtpRedirect: (userId: string, email: string) => void,
  ) => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNameError("");
    setPhoneError("");

    let isValid = true;
    if (!isLogin && !validateName(name)) isValid = false;
    if (!isLogin && !validatePhone(phone)) isValid = false;
    if (!validateEmail(email)) isValid = false;
    if (isLogin) {
      if (!validatePasswordRequired(password)) isValid = false;
    } else {
      if (!validatePasswordStrong(password)) isValid = false;
      if (!validateConfirmPassword(confirmPassword)) isValid = false;
    }
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          if (result.requiresOtp && result.userId) {
            const otpErr = (result.error ?? "").toLowerCase();
            const isExpired = otpErr.includes("expired") || otpErr.includes("expiré");
            const message = isExpired ? t("common.requiresOtpExpired") : t("common.requiresOtp");
            Alert.alert(t("common.info"), message, [
              { text: t("common.ok"), onPress: () => onOtpRedirect(result.userId!, email) },
            ]);
            return;
          }
          if (result.field === "email") {
            setEmailError(parseApiError(new Error(result.error)));
          } else {
            setPasswordError(
              result.error.includes("Invalid credentials")
                ? t("common.invalidCredentials")
                : parseApiError(new Error(result.error)),
            );
          }
        }
      } else {
        const result = await register(name, email, password, phone.trim());
        if (!result.success) {
          if (result.requiresOtp && result.userId) {
            Alert.alert(t("common.info"), t("common.requiresOtp"), [
              { text: t("common.ok"), onPress: () => onOtpRedirect(result.userId!, email) },
            ]);
            return;
          }
          if (result.field === "name") {
            setNameError(parseApiError(new Error(result.error)));
          } else if (result.field === "phone") {
            setPhoneError(
              result.error.includes("Invalid phone")
                ? t("common.invalidPhone")
                : parseApiError(new Error(result.error)),
            );
          } else if (result.field === "email") {
            setEmailError(
              result.error.includes("Email already in use")
                ? t("common.emailAlreadyInUse")
                : parseApiError(new Error(result.error)),
            );
          } else if (result.field === "password") {
            setPasswordError(
              result.error.includes("Weak password") || result.error.includes("Password must be at least")
                ? t("common.invalidPassword")
                : parseApiError(new Error(result.error)),
            );
          } else {
            Alert.alert(
              t("common.error"),
              (result.error && parseApiError(new Error(result.error))) || t("common.registerFailed"),
            );
          }
          return;
        }
        if (result.userId) {
          onOtpRedirect(result.userId, email);
        }
      }
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error) || t("common.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Authentification sociale ───────────────────────────────────────────────

  const handleGoogleToken = async (accessToken: string) => {
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle(accessToken);
      if (!result.success) {
        Alert.alert(
          t("common.error"),
          result.error ? parseApiError(new Error(result.error)) : t("common.unexpectedError"),
        );
      }
    } catch {
      Alert.alert(t("common.error"), t("common.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const result = await loginWithApple(
          credential.identityToken,
          credential.email ?? undefined,
          credential.fullName ?? undefined,
        );
        if (!result.success) {
          Alert.alert(
            t("common.error"),
            result.error ? parseApiError(new Error(result.error)) : t("common.unexpectedError"),
          );
        }
      }
    } catch (e: any) {
      if (e.code !== "ERR_CANCELED") {
        Alert.alert(t("common.error"), parseApiError(e) || t("common.unexpectedError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    phone,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    termsAccepted,
    setTermsAccepted,
    errors: { email: emailError, password: passwordError, confirmPassword: confirmPasswordError, name: nameError, phone: phoneError },
    setEmailError,
    setPasswordError,
    setConfirmPasswordError,
    setNameError,
    setPhoneError,
    isSubmitting,
    busy: loading || isSubmitting,
    handlePhoneChange,
    validateEmail,
    validatePasswordRequired,
    validatePasswordStrong,
    validateName,
    validatePhone,
    validateConfirmPassword,
    handleSubmit,
    handleGoogleToken,
    handleAppleSignIn,
    switchMode,
  };
}
