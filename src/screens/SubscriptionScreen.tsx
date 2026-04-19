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
import { RADIUS, SPACING } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { useSubscriptionIap } from "../hooks/useSubscriptionIap";
import PlanCard from "../components/PlanCard";
import SubscriptionFeaturesCard from "../components/subscription/SubscriptionFeaturesCard";
import BackButton from "../components/ui/BackButton";

const SubscriptionScreen: React.FC = () => {
  const navigation  = useNavigation();
  const { t }       = useTranslation();
  const { colors }  = useTheme();

  const { products, loadingId, onSubscribe, isExpoGo } = useSubscriptionIap();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />

          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.terraLight, borderColor: colors.border }]}>
              <Ionicons name="diamond" size={36} color={colors.terra} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("subscription.title")}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMid }]}>
              {t("subscription.subtitle")}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* ── Bandeau mode démo ── */}
          {isExpoGo && (
            <View style={[styles.demoCard, { backgroundColor: colors.terraLight, borderColor: colors.terra }]}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.terra} style={styles.demoIcon} />
              <View style={styles.demoContent}>
                <Text style={[styles.demoTitle, { color: colors.terraDark }]}>
                  {t("subscription.demoMode")}
                </Text>
                <Text style={[styles.demoText, { color: colors.textMid }]}>
                  {t("subscription.demoMessage")}
                </Text>
              </View>
            </View>
          )}

          {/* ── Plans ── */}
          {products.length === 0 ? (
            <View style={[styles.loadingContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="hourglass-outline" size={32} color={colors.terra} />
              <Text style={[styles.loadingText, { color: colors.textMid }]}>
                {t("subscription.loadingOffers")}
              </Text>
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

          <SubscriptionFeaturesCard />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper:       { flex: 1 },
  container:     { flex: 1 },
  scrollContent: { paddingBottom: 64 },

  header: {
    paddingTop: Platform.OS === "ios" ? 64 + 10 : 24,
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  backButton:    { marginBottom: SPACING.xxl },
  headerContent: { alignItems: "center" },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: F.sans700,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: F.sans400,
    textAlign: "center",
    lineHeight: 22,
  },

  content: { paddingHorizontal: SPACING.xl },

  demoCard: {
    flexDirection: "row",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  demoIcon:    { marginTop: 2 },
  demoContent: { flex: 1 },
  demoTitle:   { fontSize: 14, fontFamily: F.sans700, marginBottom: 4 },
  demoText:    { fontSize: 13, fontFamily: F.sans400, lineHeight: 19 },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxl + SPACING.xl,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING.md,
  },
  loadingText: { fontSize: 15, fontFamily: F.sans400 },
});

export default SubscriptionScreen;
