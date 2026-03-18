import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Subscription, SubscriptionFeatures } from "../types";
import ApiService from "../services/ApiService";

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;

  // Méthodes
  refreshSubscription: () => Promise<void>;
  purchaseSubscription: (productId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;

  // Vérifications de fonctionnalités
  canCreateTrip: () => boolean;
  canAddCollaborator: () => boolean;
  canExportData: () => boolean;
  hasFeatureAccess: (feature: keyof SubscriptionFeatures) => boolean;
  isPremium: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

const SUBSCRIPTION_STORAGE_KEY = "subscription";

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      // Try to load from AsyncStorage first
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        const sub = JSON.parse(stored);
        // Convert date strings back to Date objects
        setSubscription({
          ...sub,
          startDate: new Date(sub.startDate),
          endDate: sub.endDate ? new Date(sub.endDate) : undefined,
          cancelledAt: sub.cancelledAt ? new Date(sub.cancelledAt) : undefined,
          nextBillingDate: sub.nextBillingDate ? new Date(sub.nextBillingDate) : undefined,
          createdAt: new Date(sub.createdAt),
          updatedAt: new Date(sub.updatedAt),
        });
      }

      // Always fetch from server to get latest data
      const data = await ApiService.getSubscription();
      setSubscription(data);

      // Cache in AsyncStorage
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Error loading subscription:", err);
      setError("Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getSubscription();
      setSubscription(data);
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Error refreshing subscription:", err);
      setError("Failed to refresh subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseSubscription = useCallback(async (productId: string): Promise<boolean> => {
    try {
      setError(null);

      // Import RNIap dynamically
      let RNIap: any = null;
      let isIapAvailable = false;

      try {
        RNIap = require("react-native-iap");
        isIapAvailable = true;
      } catch {
        // IAP not available (Expo Go or not installed)
      }

      if (!isIapAvailable || !RNIap) {
        setError("In-app purchases not available in this environment");
        return false;
      }

      // Request subscription from platform
      const purchase = await RNIap.requestSubscription(productId);

      // Get receipt data
      const receiptData = purchase.transactionReceipt || purchase.purchaseToken;
      const platform = purchase.transactionId ? "ios" : "android";

      if (!receiptData) {
        setError("Failed to get purchase receipt");
        return false;
      }

      // Validate purchase with backend
      const result = await ApiService.validatePurchase({
        receiptData,
        platform,
        productId,
        transactionId: purchase.transactionId,
      });

      if (result.success) {
        // Finish transaction
        await RNIap.finishTransaction(purchase);

        // Refresh subscription data
        await refreshSubscription();

        // Clear cached subscription to force reload
        await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);

        return true;
      } else {
        setError("Failed to validate purchase");
        return false;
      }
    } catch (err: any) {
      console.error("Error purchasing subscription:", err);
      setError(err.message || "Failed to purchase subscription");
      return false;
    }
  }, [refreshSubscription]);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const result = await ApiService.cancelSubscription();

      if (result.success) {
        // Refresh subscription data
        await refreshSubscription();
        return true;
      } else {
        setError(result.message || "Failed to cancel subscription");
        return false;
      }
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      setError(err.message || "Failed to cancel subscription");
      return false;
    }
  }, [refreshSubscription]);

  const checkFeatureAccess = useCallback((feature: keyof SubscriptionFeatures): boolean => {
    if (!subscription) return false;

    const isActive = subscription.status === "active" ||
      (subscription.status === "cancelled" &&
       subscription.endDate &&
       new Date() < new Date(subscription.endDate));

    if (!isActive) return false;

    const featureValue = subscription.features[feature];

    // Boolean features (canExport, hasAds inverted, prioritySupport)
    if (typeof featureValue === "boolean") {
      return featureValue;
    }

    // Numeric features (-1 means unlimited)
    return featureValue === -1;
  }, [subscription]);

  const canCreateTrip = useCallback((): boolean => {
    return checkFeatureAccess("maxTrips");
  }, [checkFeatureAccess]);

  const canAddCollaborator = useCallback((): boolean => {
    return checkFeatureAccess("maxCollaborators");
  }, [checkFeatureAccess]);

  const canExportData = useCallback((): boolean => {
    return checkFeatureAccess("canExport");
  }, [checkFeatureAccess]);

  const isPremium = useCallback((): boolean => {
    return !!(subscription?.plan === "premium" && (
      subscription.status === "active" ||
      (subscription.status === "cancelled" &&
       subscription.endDate &&
       new Date() < new Date(subscription.endDate))
    ));
  }, [subscription]);

  const value: SubscriptionContextType = useMemo(
    () => ({
      subscription,
      loading,
      error,
      refreshSubscription,
      purchaseSubscription,
      cancelSubscription,
      canCreateTrip,
      canAddCollaborator,
      canExportData,
      hasFeatureAccess: checkFeatureAccess,
      isPremium,
    }),
    [
      subscription,
      loading,
      error,
      refreshSubscription,
      purchaseSubscription,
      cancelSubscription,
      canCreateTrip,
      canAddCollaborator,
      canExportData,
      checkFeatureAccess,
      isPremium,
    ]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};
