import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const handleSettings = () => {
    Alert.alert("Settings", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const handleHelp = () => {
    Alert.alert("Help & Support", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      "About MyTripCircle",
      "Version 1.0.0\n\nMyTripCircle helps you plan and organize your trips with friends. Create detailed itineraries, manage bookings, and collaborate with your travel companions.",
      [{ text: "OK" }]
    );
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      onPress: handleEditProfile,
    },
    {
      icon: "settings-outline",
      title: "Settings",
      onPress: handleSettings,
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      onPress: handleHelp,
    },
    {
      icon: "information-circle-outline",
      title: "About",
      onPress: handleAbout,
    },
    {
      icon: "log-out-outline",
      title: "Logout",
      onPress: handleLogout,
      color: "#FF3B30",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Addresses</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.color || "#333"}
              />
              <Text
                style={[
                  styles.menuItemText,
                  item.color && { color: item.color },
                ]}
              >
                {item.title}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MyTripCircle v1.0.0</Text>
        <Text style={styles.footerSubtext}>Made with ❤️ for travelers</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center",
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  menuContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#ccc",
  },
});

export default ProfileScreen;
