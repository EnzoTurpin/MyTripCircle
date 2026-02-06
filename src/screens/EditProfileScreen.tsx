import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = async () => {
    try {
      await updateUser({ name, email });
      Alert.alert(
        t("editProfile.updateSuccessTitle"),
        t("editProfile.updateSuccessMessage"),
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("common.error"), t("editProfile.updateErrorMessage"));
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
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.3)",
                  "rgba(255, 255, 255, 0.1)",
                ]}
                style={styles.avatarGradient}
              >
                <Ionicons name="person" size={48} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{t("editProfile.title")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("editProfile.subtitle")}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ModernCard variant="elevated" style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("common.fullName")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#616161"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder={t("editProfile.namePlaceholder")}
                  placeholderTextColor="#9E9E9E"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("common.email")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#616161"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder={t("editProfile.emailPlaceholder")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9E9E9E"
                />
              </View>
            </View>
          </ModernCard>

          <ModernCard variant="elevated" style={styles.securitySection}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ChangePassword")}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#007AFF"
                  />
                </View>
                <Text style={styles.settingTitle}>
                  {t("editProfile.changePassword")}
                </Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
            </TouchableOpacity>
          </ModernCard>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>
              {t("editProfile.saveChanges")}
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
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  formContainer: {
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
  securitySection: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "rgba(0, 122, 255, 0.08)",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
});

export default EditProfileScreen;
