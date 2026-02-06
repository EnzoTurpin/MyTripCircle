import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";

type OtpScreenRouteProp = RouteProp<RootStackParamList, "Otp">;
type OtpScreenNavigationProp = StackNavigationProp<RootStackParamList, "Otp">;

const OtpScreen: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const route = useRoute<OtpScreenRouteProp>();
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const { userId } = route.params;

  const { verifyOtp } = useAuth();
  const { t } = useTranslation();

  const handleVerify = async () => {
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError(t("otp.codeRequired"));
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(userId, otp);

      if (!result.success) {
        setOtpError(result.error || t("otp.invalidCode"));
      } else {
        // Success - user is now logged in (handled by AuthContext)
        // Navigation will happen automatically via AppNavigator when user is set
        Alert.alert(t("common.ok"), t("otp.successMessage"));
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError(t("otp.verificationFailed"));
    } finally {
      setLoading(false);
    }
  };

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
                <Ionicons name="shield-checkmark" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{t("otp.title")}</Text>
            <Text style={styles.headerSubtitle}>{t("otp.subtitle")}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ModernCard variant="elevated" style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("otp.codePlaceholder")}</Text>
              <View
                style={[
                  styles.inputContainer,
                  otpError && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="keypad-outline"
                  size={20}
                  color={otpError ? "#FF3B30" : "#616161"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("otp.codePlaceholder")}
                  placeholderTextColor="#9E9E9E"
                  value={otp}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const numericText = text.replace(/[^0-9]/g, "");
                    setOtp(numericText);
                    if (otpError) setOtpError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
                {otp.length > 0 && (
                  <View style={styles.otpIndicator}>
                    <Text style={styles.otpIndicatorText}>{otp.length}/6</Text>
                  </View>
                )}
              </View>
              {otpError ? (
                <Text style={styles.errorText}>{otpError}</Text>
              ) : null}
            </View>

            <ModernButton
              title={loading ? t("otp.verifying") : t("otp.verifyButton")}
              onPress={handleVerify}
              variant="primary"
              gradient
              size="large"
              fullWidth
              icon={loading ? "hourglass" : "checkmark-circle"}
              disabled={loading || otp.length !== 6}
              loading={loading}
              style={styles.submitButton}
            />
          </ModernCard>
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
    fontSize: 24,
    color: "#212121",
    fontWeight: "600",
    letterSpacing: 4,
    textAlign: "center",
  },
  otpIndicator: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  otpIndicatorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2891FF",
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
});

export default OtpScreen;
