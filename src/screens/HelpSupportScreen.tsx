import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import BackButton from "../components/ui/BackButton";

const HelpSupportScreen: React.FC = () => {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const { t } = useTranslation();
  const { colors } = useTheme();

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === id ? null : id);
  };

  const navigation = useNavigation();

  const openEmail = () => {
    const subject = encodeURIComponent(t("helpSupport.emailSubject"));
    Linking.openURL(`mailto:support@mytripcircle.com?subject=${subject}`);
  };

  const faqItems = [
    {
      id: "faq-1",
      icon: "airplane-outline",
      title: t("helpSupport.faq1Question"),
      description: t("helpSupport.faq1Answer"),
      iconColor: "#C4714A",
      iconBg: "#F5E5DC",
    },
    {
      id: "faq-2",
      icon: "people-outline",
      title: t("helpSupport.faq2Question"),
      description: t("helpSupport.faq2Answer"),
      iconColor: "#6B8C5A",
      iconBg: "#E2EDD9",
    },
    {
      id: "faq-3",
      icon: "calendar-outline",
      title: t("helpSupport.faq3Question"),
      description: t("helpSupport.faq3Answer"),
      iconColor: "#5A8FAA",
      iconBg: "#DCF0F5",
    },
    {
      id: "faq-4",
      icon: "map-outline",
      title: t("helpSupport.faq4Question"),
      description: t("helpSupport.faq4Answer"),
      iconColor: "#7A6A58",
      iconBg: "#EDE5D8",
    },
  ];

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header bar ── */}
        <View style={[styles.headerBar, { backgroundColor: colors.bg }]}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("helpSupport.title")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.body}>
          {/* ── Info card ── */}
          <View style={[styles.infoCard, { backgroundColor: colors.terraLight, borderColor: colors.border }]}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIconBg}>
                <Ionicons name="chatbubble-ellipses" size={24} color={colors.terra} />
              </View>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{t("helpSupport.needHelp")}</Text>
            </View>
            <Text style={[styles.infoParagraph, { color: colors.textMid }]}>{t("helpSupport.description")}</Text>
          </View>

          {/* ── FAQ section ── */}
          <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t("helpSupport.faqTitle")}</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {faqItems.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={[styles.rowDivider, { backgroundColor: colors.bgMid }]} />}
                  <TouchableOpacity
                    style={styles.faqRow}
                    onPress={() => toggle(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.faqIconBg, { backgroundColor: item.iconBg }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                    </View>
                    <Text style={[styles.faqTitle, { color: colors.text }]}>{item.title}</Text>
                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.faqAnswer}>
                      <Text style={[styles.faqAnswerText, { color: colors.textMid }]}>{item.description}</Text>
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* ── Contact button ── */}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={openEmail}
            activeOpacity={0.8}
          >
            <Ionicons name="mail" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.contactButtonText}>{t("helpSupport.contactSupport")}</Text>
          </TouchableOpacity>

          {/* ── Contact info card ── */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.contactRow}>
              <View style={[styles.contactIconBg, { backgroundColor: colors.bgMid }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textMid} />
              </View>
              <Text style={[styles.contactText, { color: colors.textMid }]}>support@mytripcircle.com</Text>
            </View>
            <View style={[styles.rowDivider, { backgroundColor: colors.bgMid }]} />
            <View style={styles.contactRow}>
              <View style={[styles.contactIconBg, { backgroundColor: colors.bgMid }]}>
                <Ionicons name="time-outline" size={18} color={colors.textMid} />
              </View>
              <Text style={[styles.contactText, { color: colors.textMid }]}>{t("helpSupport.availability")}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // Header bar
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#F5F0E8",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: F.sans700,
    color: "#2A2318",
    textAlign: "center",
    flex: 1,
  },

  // Body
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  // Info card
  infoCard: {
    backgroundColor: "#F5E5DC",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#D8CCBA",
    padding: 16,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(196,113,74,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 19,
    fontFamily: F.sans700,
    color: "#2A2318",
  },
  infoParagraph: {
    fontSize: 16,
    color: "#7A6A58",
    lineHeight: 26,
    fontFamily: F.sans400,
    marginBottom: 8,
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    color: "#B0A090",
    fontFamily: F.sans600,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 2,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#D8CCBA",
    overflow: "hidden",
    marginBottom: 16,
  },

  // Row divider
  rowDivider: {
    height: 1,
    backgroundColor: "#EDE5D8",
    marginLeft: 56,
  },

  // FAQ rows
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  faqIconBg: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  faqTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: F.sans600,
    color: "#2A2318",
  },
  faqAnswer: {
    paddingHorizontal: 62,
    paddingBottom: 14,
  },
  faqAnswerText: {
    fontSize: 15,
    color: "#7A6A58",
    lineHeight: 24,
    fontFamily: F.sans400,
  },

  // Contact button
  contactButton: {
    backgroundColor: "#C4714A",
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: F.sans700,
  },

  // Contact info rows
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  contactIconBg: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#EDE5D8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: "#7A6A58",
    fontFamily: F.sans400,
  },
});

export default HelpSupportScreen;
