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
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { ModernCard } from "../components/ModernCard";

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

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
                <Ionicons name="lock-closed" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{t("changePassword.title")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("changePassword.subtitle")}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ModernCard variant="elevated" style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("changePassword.currentPasswordLabel")}
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#616161"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("changePassword.currentPasswordPlaceholder")}
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("changePassword.newPasswordLabel")}
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#616161"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("changePassword.newPasswordPlaceholder")}
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("changePassword.confirmPasswordLabel")}
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#616161"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("changePassword.confirmPasswordPlaceholder")}
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                />
              </View>
            </View>
          </ModernCard>

          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>
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
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#212121",
  },
  saveButton: {
    backgroundColor: "#2891FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 8,
    shadowColor: "#2891FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ChangePasswordScreen;
