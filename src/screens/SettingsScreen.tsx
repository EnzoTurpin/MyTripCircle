import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  ChangePassword: undefined;
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const settingsOptions = [
    { icon: "moon-outline", title: "Dark Mode", value: "Coming soon" },
    { icon: "notifications-outline", title: "Notifications", value: "Enabled" },
    { icon: "language-outline", title: "Language", value: "English" },
  ];

  const accountOptions = [
    {
      icon: "lock-closed-outline",
      title: "Change Password",
      action: "change-password"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </LinearGradient>

      <View style={styles.settingsContainer}>
        {settingsOptions.map((item, index) => (
          <TouchableOpacity key={index} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name={item.icon as any} size={22} color="#007AFF" />
              <Text style={styles.settingTitle}>{item.title}</Text>
            </View>
            <Text style={styles.settingValue}>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
            <Ionicons name="chevron-forward-outline" size={18} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  settingsContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 15,
    padding: 10,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: { flexDirection: "row", alignItems: "center" },
  settingTitle: { marginLeft: 10, fontSize: 16, color: "#333" },
  settingValue: { color: "#999", fontSize: 14 },
});

export default SettingsScreen;
