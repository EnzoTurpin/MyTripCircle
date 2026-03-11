import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ModernCard } from "../components/ModernCard";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const settingsOptions = [
    {
      icon: "moon-outline",
      title: "Mode sombre",
      value: "Bientôt disponible",
      color: "#8869FF",
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      value: "Activées",
      color: "#2891FF",
    },
    {
      icon: "language-outline",
      title: "Langue",
      value: "Français",
      color: "#FF6B9D",
    },
    {
      icon: "lock-closed-outline",
      title: "Confidentialité",
      value: "Gérer",
      color: "#4CAF50",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Sécurité",
      value: "Configurer",
      color: "#FF9800",
    },
  ];

  const accountOptions = [
    {
      icon: "lock-closed-outline",
      title: "Change Password",
      action: "change-password",
    },
  ];

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
                <Ionicons name="settings" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Paramètres</Text>
            <Text style={styles.headerSubtitle}>
              Personnalisez votre expérience
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ModernCard variant="elevated">
            {settingsOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.settingItem,
                  index !== settingsOptions.length - 1 &&
                    styles.settingItemBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: item.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={item.color}
                    />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingValue}>{item.value}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
              </TouchableOpacity>
            ))}
          </ModernCard>

          <ModernCard variant="elevated" style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>À propos</Text>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Build</Text>
              <Text style={styles.aboutValue}>2026.01.25</Text>
            </View>
          </ModernCard>
          <View style={styles.settingsContainer}>
            {accountOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingItem}
                onPress={() => navigation.navigate("ChangePassword")}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name={item.icon as any} size={22} color="#007AFF" />
                  <Text style={styles.settingTitle}>{item.title}</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color="#ccc"
                />
              </TouchableOpacity>
            ))}
          </View>
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
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
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
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 2,
  },
  settingValue: {
    color: "#616161",
    fontSize: 13,
  },
  aboutSection: {
    marginTop: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 16,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  aboutLabel: {
    fontSize: 15,
    color: "#616161",
  },
  aboutValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  settingsContainer: {
    marginTop: 16,
  },
});

export default SettingsScreen;
