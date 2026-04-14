import React from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import { useSubscriptionIap } from "../hooks/useSubscriptionIap";
import PlanCard from "../components/PlanCard";
import SubscriptionFeaturesCard from "../components/subscription/SubscriptionFeaturesCard";
import BackButton from "../components/ui/BackButton";

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t }      = useTranslation();
  const { colors } = useTheme();

  const { products, loadingId, onSubscribe, isExpoGo } = useSubscriptionIap();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.terraLight, borderColor: colors.bgDark }]}>
              <Ionicons name="diamond" size={40} color={colors.terra} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("subscription.title")}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMid }]}>{t("subscription.subtitle")}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* ── Bandeau mode démo ── */}
          {isExpoGo && (
            <View style={[styles.warningCard, { backgroundColor: colors.terraLight, borderColor: colors.terra }]}>
              <View style={styles.warningIcon}>
                <Ionicons name="alert-circle" size={24} color={colors.terra} />
              </View>
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: colors.terraDark }]}>{t("subscription.demoMode")}</Text>
                <Text style={[styles.warningText, { color: colors.textMid }]}>{t("subscription.demoMessage")}</Text>
              </View>
            </View>
          )}

          {/* ── Plans ── */}
          {products.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={40} color={colors.terra} />
              <Text style={[styles.loadingText, { color: colors.textMid }]}>{t("subscription.loadingOffers")}</Text>
            </View>
          ) : (
            products.map((product, index) => (
              <PlanCard
                key={product.productId}
                id={product.productId}
                title={product.title || product.productId}
                price={product.localizedPrice}
                advantages={
                  index === 0
                    ? [
                        t("subscription.monthlyAdvantage1"),
                        t("subscription.monthlyAdvantage2"),
                        t("subscription.monthlyAdvantage3"),
                        t("subscription.monthlyAdvantage4"),
                      ]
                    : [
                        t("subscription.annualAdvantage1"),
                        t("subscription.annualAdvantage2"),
                        t("subscription.annualAdvantage3"),
                        t("subscription.annualAdvantage4"),
                        t("subscription.annualAdvantage5"),
                      ]
                }
                onSubscribe={onSubscribe}
                loading={loadingId === product.productId}
                recommended={index === 1}
              />
            ))
          )}

          <SubscriptionFeaturesCard colors={{ surface: colors.surface, border: colors.border, text: colors.text }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:      { flex: 1 },
  container:    { flex: 1 },
  scrollContent: { paddingBottom: 64 },

  header: {
    paddingTop: Platform.OS === "ios" ? 64 + 10 : 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 32,
  },
  headerContent:  { alignItems: "center" },
  iconContainer: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, justifyContent: "center", alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20, fontFamily: F.sans700,
    marginBottom: 8, textAlign: "center",
  },
  headerSubtitle: { fontSize: 16, textAlign: "center", fontFamily: F.sans400 },

  content: { paddingHorizontal: 24 },

  warningCard: {
    flexDirection: "row",
    borderRadius: 12, padding: 16, marginBottom: 24,
    borderWidth: 1,
  },
  warningIcon:    { marginRight: 12 },
  warningContent: { flex: 1 },
  warningTitle:   { fontSize: 16, fontFamily: F.sans700, marginBottom: 4 },
  warningText:    { fontSize: 14, lineHeight: 20, fontFamily: F.sans400 },

  loadingContainer: { alignItems: "center", paddingVertical: 48 },
  loadingText:      { fontSize: 16, marginTop: 16, fontFamily: F.sans400 },
});

export default SubscriptionScreen;
