import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";

interface Section {
  title: string;
  body: string;
}

interface LegalScreenProps {
  headerTitle: string;
  lastUpdated: string;
  sections: Section[];
}

const SectionItem: React.FC<{ title: string; children: string }> = ({ title, children }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.textMid }]}>{children}</Text>
    </View>
  );
};

export default function LegalScreen({ headerTitle, lastUpdated, sections }: LegalScreenProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgDark }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{headerTitle}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: colors.textMid }]}>{lastUpdated}</Text>
        {sections.map((s) => (
          <SectionItem key={s.title} title={s.title}>{s.body}</SectionItem>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D8CCBA",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D8CCBA",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: F.sans600,
    fontSize: 21,
    color: "#2A2318",
    marginHorizontal: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontFamily: F.sans400,
    fontSize: 15,
    color: "#7A6A58",
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: F.sans600,
    fontSize: 19,
    color: "#C4714A",
    marginBottom: 10,
  },
  sectionBody: {
    fontFamily: F.sans400,
    fontSize: 17,
    lineHeight: 28,
    color: "#7A6A58",
  },
});
