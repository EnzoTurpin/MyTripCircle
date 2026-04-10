import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";
import { parseApiError } from "../utils/i18n";

// Conditionally import react-native-iap only if not in Expo Go
let RNIap: any = null;
let isIapAvailable = false;

const isExpoGoEnvironment = Constants.executionEnvironment === "storeClient";

if (!isExpoGoEnvironment) {
  try {
    RNIap = require("react-native-iap");
    isIapAvailable = true;
  } catch (error) {
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

export function useSubscriptionIap() {
  const { t } = useTranslation();
  const [products, setProducts]   = useState<MockProduct[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const isExpoGo = !isIapAvailable;

  const mockProducts: MockProduct[] = [
    { productId: "com.myapp.monthly", title: t("subscription.monthly"), localizedPrice: t("subscription.monthlyPrice") },
    { productId: "com.myapp.yearly",  title: t("subscription.annual"),  localizedPrice: t("subscription.annualPrice")  },
  ];

  useEffect(() => {
    if (!isIapAvailable || !RNIap) {
      setProducts(mockProducts);
      return;
    }

    async function init() {
      try {
        await RNIap.initConnection();
        const subs = await RNIap.getSubscriptions(productIds);
        setProducts(subs);
      } catch (err) {
        console.warn("IAP init error", err);
        setProducts(mockProducts);
      }
    }
    init();

    const purchaseUpdate = RNIap.purchaseUpdatedListener(async (purchase: any) => {
      try {
        const receipt = purchase.transactionReceipt || purchase.purchaseToken;
        if (receipt) {
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
      Alert.alert(t("subscription.purchaseErrorTitle"), t("subscription.demoMessage"), [{ text: t("common.ok") }]);
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

  return { products, loadingId, onSubscribe, isExpoGo };
}
