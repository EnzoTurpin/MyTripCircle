import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, LayoutAnimation } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { FAQ } from "../data/faq";

const HelpSupportScreen: React.FC = () => {
  const [ openId, setOpenId ] = React.useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === id ? null : id);
  }

  const openEmail = () => {
    Linking.openURL("mailto:support@mytripcircle.com?subject=Help%20Request");
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </LinearGradient>

      {FAQ.map((item) => (
        <View key={item.id} style={styles.card}>
          <TouchableOpacity
            style={styles.questionRow}
            onPress={() => toggle(item.id)}
          >
            <Text style={styles.question}>{item.question}</Text>
            <Ionicons
              name={openId === item.id ? "chevron-up" : "chevron-down"}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>

          {openId === item.id && (
            <Text style={styles.answer}>{item.answer}</Text>
          )}
        </View>
      ) )}

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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  answer: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default HelpSupportScreen;
