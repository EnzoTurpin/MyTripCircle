import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet, Alert, Platform } from "react-native";
import PlanCard from "../components/PlanCard";
import * as RNIap from "react-native-iap";

const productIds = Platform.select({
  ios: ["com.myapp.monthly", "com.myapp.yearly"],
  android: ["com.myapp.monthly", "com.myapp.yearly"],
}) || [];

const SubscriptionScreen: React.FC = () => {
  const [products, setProducts] = useState<RNIap.Subscription[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await RNIap.initConnection();
        const subs = await RNIap.getSubscriptions(productIds);
        setProducts(subs);
      } catch (err) {
        console.warn("IAP init error", err);
      }
    }
    init();

    const purchaseUpdate = RNIap.purchaseUpdatedListener(async (purchase) => {
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

    const purchaseError = RNIap.purchaseErrorListener((err) => {
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
});

export default SubscriptionScreen;