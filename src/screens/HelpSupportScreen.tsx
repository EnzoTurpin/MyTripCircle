import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const HelpSupportScreen: React.FC = () => {
  const openEmail = () => {
    Linking.openURL("mailto:support@mytripcircle.com?subject=Help%20Request");
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.paragraph}>
          Need help or have questions about MyTripCircle?
        </Text>
        <Text style={styles.paragraph}>
          You can reach our support team by clicking the button below or check our FAQ section (coming soon).
        </Text>

        <TouchableOpacity style={styles.button} onPress={openEmail}>
          <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.buttonGradient}>
            <Ionicons name="mail-outline" size={22} color="white" />
            <Text style={styles.buttonText}>Contact Support</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  headerTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  content: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  paragraph: { fontSize: 16, color: "#555", marginBottom: 15 },
  button: { marginTop: 20 },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    paddingVertical: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 8,
  },
});

export default HelpSupportScreen;
