import React, { useEffect, useState } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  View,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import PlanCard from "../components/PlanCard";
import Constants from "expo-constants";
import { F } from "../theme/fonts";
import { parseApiError } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";

// Conditionally import react-native-iap only if not in Expo Go
let RNIap: any = null;
let isIapAvailable = false;

// Check if we're in Expo Go first (NitroModules are not supported in Expo Go)
const isExpoGoEnvironment = Constants.executionEnvironment === "storeClient";

if (!isExpoGoEnvironment) {
  try {
    // Try to import react-native-iap only if not in Expo Go
    RNIap = require("react-native-iap");
    isIapAvailable = true;
  } catch (error) {
    // react-native-iap is not available (not installed or other error)
    console.warn("react-native-iap not available:", error);
  }
}

const productIds = Platform.select({
  ios: ["com.myapp.monthly", "com.myapp.yearly"],
  android: ["com.myapp.monthly", "com.myapp.yearly"],
}) || [];

interface MockProduct {
  productId: string;
  title: string;
  localizedPrice: string;
}


const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const isExpoGo = !isIapAvailable;

  useEffect(() => {
    if (!isIapAvailable || !RNIap) {
      // Mock products for Expo Go
      setProducts([
        {
          productId: "com.myapp.monthly",
          title: t("subscription.monthly"),
          localizedPrice: t("subscription.monthlyPrice"),
        },
        {
          productId: "com.myapp.yearly",
          title: t("subscription.annual"),
          localizedPrice: t("subscription.annualPrice"),
        },
      ]);
      return;
    }

    async function init() {
      try {
        await RNIap.initConnection();
        const subs = await RNIap.getSubscriptions(productIds);
        setProducts(subs);
      } catch (err) {
        console.warn("IAP init error", err);
        // Fallback to mock products on error
        setProducts([
          {
            productId: "com.myapp.monthly",
            title: t("subscription.monthly"),
            localizedPrice: t("subscription.monthlyPrice"),
          },
          {
            productId: "com.myapp.yearly",
            title: t("subscription.annual"),
            localizedPrice: t("subscription.annualPrice"),
          },
        ]);
      }
    }
    init();

    const purchaseUpdate = RNIap.purchaseUpdatedListener(async (purchase: any) => {
      try {
        const receipt = purchase.transactionReceipt || purchase.purchaseToken;
        if (receipt) {
          // TODO: envoyer 'receipt' à votre serveur pour validation
          await RNIap.finishTransaction(purchase);
          Alert.alert(t("subscription.purchaseSuccessTitle"), t("subscription.purchaseSuccessMessage"), [{ text: t("common.ok") }]);
          setLoadingId(null);
        }
      } catch (err) {
        console.warn("purchase update handling error", err);
      }
    });

    const purchaseError = RNIap.purchaseErrorListener((err: unknown) => {
      console.warn("purchase error", err);
      let raw: Error;
      if (err instanceof Error) {
        raw = err;
      } else {
        const msg = typeof (err as { message?: string })?.message === "string"
          ? (err as { message: string }).message
          : "";
        raw = new Error(msg);
      }
      Alert.alert(
        t("subscription.purchaseErrorTitle"),
        parseApiError(raw) || t("subscription.purchaseErrorMessage"),
        [{ text: t("common.ok") }],
      );
      setLoadingId(null);
    });

    return () => {
      purchaseUpdate.remove();
      purchaseError.remove();
      RNIap.endConnection();
    };
  }, []);

  const onSubscribe = async (productId: string) => {
    if (!isIapAvailable || !RNIap) {
      Alert.alert(
        t("subscription.purchaseErrorTitle"),
        t("subscription.demoMessage"),
        [{ text: t("common.ok") }]
      );
      return;
    }

    try {
      setLoadingId(productId);
      await RNIap.requestSubscription(productId);
    } catch (err) {
      console.warn("requestSubscription err", err);
      Alert.alert(t("subscription.purchaseErrorTitle"), t("subscription.purchaseErrorMessage"), [{ text: t("common.ok") }]);
      setLoadingId(null);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.bgMid }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.terraLight, borderColor: colors.bgDark }]}>
              <Ionicons name="diamond" size={40} color={colors.terra} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("subscription.title")}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMid }]}>{t("subscription.subtitle")}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {isExpoGo && (
            <View style={styles.warningCard}>
              <View style={styles.warningIcon}>
                <Ionicons name="alert-circle" size={24} color={colors.terra} />
              </View>
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: colors.terraDark }]}>{t("subscription.demoMode")}</Text>
                <Text style={[styles.warningText, { color: colors.textMid }]}>{t("subscription.demoMessage")}</Text>
              </View>
            </View>
          )}

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

          <View style={[styles.featuresSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.featuresTitle, { color: colors.text }]}>{t("subscription.includedInAllPlans")}</Text>
            <View style={styles.featuresList}>
              {[
                { icon: "cloud-upload-outline",      text: t("subscription.featureCloud") },
                { icon: "shield-checkmark-outline",  text: t("subscription.featureSecure") },
                { icon: "people-outline",            text: t("subscription.featureTeam") },
                { icon: "refresh-outline",           text: t("subscription.featureUpdates") },
              ].map((feature) => (
                <View key={feature.icon} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon as any} size={20} color="#6B8C5A" />
                  </View>
                  <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
                </View>
              ))}
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
    backgroundColor: "#F5F0E8",
  },
  scrollContent: {
    paddingBottom: 64,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 64 + 10 : 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: "#F5F0E8",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE5D8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F5E5DC",
    borderWidth: 2,
    borderColor: "#D8CCBA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: F.sans700,
    color: "#2A2318",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#7A6A58",
    textAlign: "center",
    fontFamily: F.sans400,
  },
  content: {
    paddingHorizontal: 24,
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#F5E5DC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#C4714A",
  },
  warningIcon: {
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: F.sans700,
    color: "#A35830",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#7A6A58",
    lineHeight: 20,
    fontFamily: F.sans400,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: "#7A6A58",
    marginTop: 16,
    fontFamily: F.sans400,
  },
  featuresSection: {
    marginTop: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#D8CCBA",
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: F.sans700,
    color: "#2A2318",
    marginBottom: 20,
    textAlign: "center",
  },
  featuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2EDD9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: "#2A2318",
    fontFamily: F.sans400,
  },
});

export default SubscriptionScreen;
