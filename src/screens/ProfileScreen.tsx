import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useTrips } from "../contexts/TripsContext";
import { useFriends } from "../contexts/FriendsContext";
import { useTranslation } from "react-i18next";
import {
  changeLanguage,
  getCurrentLanguage,
  testDateFormatting,
} from "../utils/i18n";
import { useNavigation } from "@react-navigation/native";
import { ModernCard } from "../components/ModernCard";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { invitations, unreadCount, refreshInvitations } = useNotifications();
  const { trips, bookings, addresses } = useTrips();
  const { friends } = useFriends();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert(t("profile.logoutTitle"), t("profile.logoutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.logout"), style: "destructive", onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const handleHelp = () => {
    navigation.navigate("HelpSupport");
  };

  const handleAbout = () => {
    Alert.alert(t("profile.aboutTitle"), t("profile.aboutBody"), [
      { text: t("common.ok") },
    ]);
  };

  const handleInvitations = () => {
    navigation.navigate("Invitation");
  };

  const handleChangeLanguage = () => {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === "fr" ? "en" : "fr";
    changeLanguage(newLang);
    Alert.alert(
      "Language Changed",
      `Language changed to ${newLang === "fr" ? "French" : "English"}`,
      [{ text: "OK" }]
    );
  };

  const handleTestDateFormatting = () => {
    const result = testDateFormatting();
    Alert.alert(
      "Date Formatting Test",
      `Language: ${result.language}\nShort: ${result.shortDate}\nLong: ${result.longDate}\nTime: ${result.time}`,
      [{ text: "OK" }]
    );
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: t("profile.editProfile"),
      onPress: handleEditProfile,
    },
    {
      icon: "people-outline",
      title: "Amis",
      onPress: () => navigation.navigate("Friends" as never),
    },
    {
      icon: "mail-outline",
      title: t("profile.invitations"),
      onPress: handleInvitations,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      icon: "settings-outline",
      title: t("profile.settings"),
      onPress: handleSettings,
    },
    {
      icon: "help-circle-outline",
      title: t("profile.helpSupport"),
      onPress: handleHelp,
    },
    {
      icon: "language-outline",
      title: `Language (${
        getCurrentLanguage() === "fr" ? "Français" : "English"
      })`,
      onPress: handleChangeLanguage,
    },
    {
      icon: "calendar-outline",
      title: "Test Date Formatting",
      onPress: handleTestDateFormatting,
    },
    {
      icon: "information-circle-outline",
      title: t("profile.about"),
      onPress: handleAbout,
    },
    {
      icon: "card-outline",
      title: "S’abonner",
      onPress: () => navigation.navigate("Subscription"),
    },
    {
      icon: "log-out-outline",
      title: t("profile.logoutTitle"),
      onPress: handleLogout,
      color: "#FF3B30",
    },
  ];

  return (
    <SwipeToNavigate currentIndex={3} totalTabs={4}>
      <View style={styles.wrapper}>
        <StatusBar barStyle="light-content" />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={['#2891FF', '#8869FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.avatarGradient}
                  >
                    <Ionicons name="person" size={48} color="white" />
                  </LinearGradient>
                </View>
                <Text style={styles.userName}>
                  {user?.name || t("profile.userFallbackName")}
                </Text>
                <Text style={styles.userEmail}>
                  {user?.email || t("profile.userFallbackEmail")}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            <ModernCard variant="elevated" style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E8F4FF' }]}>
                  <Ionicons name="airplane" size={20} color="#2891FF" />
                </View>
                <Text style={styles.statNumber}>{trips.length}</Text>
                <Text style={styles.statLabel}>{t("profile.stats.trips")}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#F3F0FF' }]}>
                  <Ionicons name="calendar" size={20} color="#8869FF" />
                </View>
                <Text style={styles.statNumber}>{bookings.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
                  {t("profile.stats.bookings")}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FFE8F0' }]}>
                  <Ionicons name="location" size={20} color="#FF6B9D" />
                </View>
                <Text style={styles.statNumber}>{addresses.length}</Text>
                <Text style={styles.statLabel}>{t("profile.stats.addresses")}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="people" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.statNumber}>{friends.length}</Text>
                <Text style={styles.statLabel}>{t("profile.stats.friends")}</Text>
              </View>
            </ModernCard>

            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[
                      styles.menuIconContainer,
                      item.color && { backgroundColor: item.color + '15' }
                    ]}>
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={item.color || '#212121'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuItemText,
                        item.color && { color: item.color },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("profile.footerVersion")}</Text>
              <Text style={styles.footerSubtext}>
                {t("profile.footerMadeWithLove")}
              </Text>
            </View>
          </View>
        </ScrollView>
        {/* Fond opaque pour cacher le contenu sous la navbar */}
        <View style={styles.bottomOverlay} />
      </View>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerGradient: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 120, // Espace pour la navbar floating
  },
  header: {
    marginTop: 24,
    paddingTop: 0,
    paddingBottom: 64,
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    justifyContent: "center" as const,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
  },
  contentContainer: {
    marginTop: -64,
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    paddingVertical: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center",
    marginBottom: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#616161',
    textAlign: "center" as const,
    minHeight: 14,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: "center" as const,
    alignItems: "center",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 9999,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  menuItemText: {
    fontSize: 16,
    color: '#212121',
    marginLeft: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 74 : 70,
    backgroundColor: '#FAFAFA',
    pointerEvents: 'none',
  },
});

export default ProfileScreen;
