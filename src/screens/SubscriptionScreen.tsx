import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert, Platform } from "react-native";
import PlanCard from "../components/PlanCard";
import Constants from "expo-constants";

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
    isIapAvailable = false;
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
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isExpoGo, setIsExpoGo] = useState(!isIapAvailable);

  useEffect(() => {
    if (!isIapAvailable || !RNIap) {
      // Mock products for Expo Go
      setProducts([
        {
          productId: "com.myapp.monthly",
          title: "Abonnement Mensuel",
          localizedPrice: "9,99 €",
        },
        {
          productId: "com.myapp.yearly",
          title: "Abonnement Annuel",
          localizedPrice: "99,99 €",
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
            title: "Abonnement Mensuel",
            localizedPrice: "9,99 €",
          },
          {
            productId: "com.myapp.yearly",
            title: "Abonnement Annuel",
            localizedPrice: "99,99 €",
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
          Alert.alert("Merci", "Votre abonnement est activé.");
          setLoadingId(null);
        }
      } catch (err) {
        console.warn("purchase update handling error", err);
      }
    });

    const purchaseError = RNIap.purchaseErrorListener((err: any) => {
      console.warn("purchase error", err);
      Alert.alert("Erreur d'achat", err.message || "Une erreur est survenue");
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
        "Fonctionnalité non disponible",
        "Les achats intégrés nécessitent un build de développement. Utilisez EAS Build pour créer un build avec support des modules natifs."
      );
      return;
    }

    try {
      setLoadingId(productId);
      await RNIap.requestSubscription(productId);
    } catch (err) {
      console.warn("requestSubscription err", err);
      Alert.alert("Erreur", "Impossible de démarrer l'achat.");
      setLoadingId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>S'abonner</Text>
      <Text style={styles.subheader}>Choisis un plan et profite des avantages</Text>
      {isExpoGo && (
        <Text style={styles.warning}>
          ⚠️ Les achats intégrés ne sont pas disponibles dans Expo Go. Utilisez un build de développement pour tester les abonnements.
        </Text>
      )}
      {products.length === 0 && <Text style={styles.info}>Chargement des offres...</Text>}
      {products.map((p) => (
        <PlanCard
          key={p.productId}
          id={p.productId}
          title={p.title || p.productId}
          price={p.localizedPrice}
          advantages={[
            "Accès illimité aux fonctionnalités premium",
            "Support prioritaire",
            "Sauvegardes dans le cloud",
          ]}
          onSubscribe={onSubscribe}
          loading={loadingId === p.productId}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  subheader: { color: "#666", marginBottom: 12 },
  info: { color: "#888", marginBottom: 12 },
  warning: {
    color: "#ff6b00",
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
});

export default SubscriptionScreen;