import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import BackButton from "./ui/BackButton";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";

interface Section {
  title: string;
  body: string;
}

interface LegalScreenProps {
  readonly headerTitle: string;
  readonly lastUpdated: string;
  readonly sections: Section[];
}

const SectionItem: React.FC<{ title: string; children: string }> = ({ title, children }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.terra }]}>{title}</Text>
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
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>{headerTitle}</Text>
        <View style={{ width: 44 }} />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: F.sans700,
    fontSize: 20,
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: F.sans600,
    fontSize: 19,
    marginBottom: 10,
  },
  sectionBody: {
    fontFamily: F.sans400,
    fontSize: 17,
    lineHeight: 28,
  },
});
