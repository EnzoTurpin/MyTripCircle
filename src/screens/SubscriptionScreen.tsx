import React, { useEffect, useState } from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PlanCard from "../components/PlanCard";
import Constants from "expo-constants";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAuth } from "../contexts/AuthContext";

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
  const navigation = useNavigation();
  const { user } = useAuth();
  const { subscription, purchaseSubscription, refreshSubscription, loading: subscriptionLoading } = useSubscription();
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
          // The purchaseSubscription function handles validation
          await RNIap.finishTransaction(purchase);
          await refreshSubscription();
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
  }, [refreshSubscription]);

  // ========================================================================
  // GESTION DE L'ACHAT D'ABONNEMENT
  // ========================================================================

  /**
   * Fonction principale pour gérer l'achat d'un abonnement
   * @param productId - ID du produit (ex: "com.myapp.monthly")
   */
  const onSubscribe = async (productId: string) => {
    // Vérifier si l'utilisateur est déjà Premium
    if (subscription?.plan === "premium" && subscription?.status === "active") {
      Alert.alert(
        "Abonnement actif",
        "Vous avez déjà un abonnement Premium actif.",
        [
          { text: "OK", style: "default" },
        ]
      );
      return;
    }

    // Si IAP n'est pas disponible (Expo Go ou dev sans IAP),
    // proposer le mode simulation pour les tests
    if (!isIapAvailable || !RNIap) {
      Alert.alert(
        "Mode Développement",
        "IAP non disponible. Voulez-vous simuler l'achat ? (Pour tests uniquement)",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Simuler",
            onPress: () => simulatePurchase(productId),
          },
        ]
      );
      return;
    }

    try {
      setLoadingId(productId);
      // Tenter l'achat via IAP (Apple/Google)
      const success = await purchaseSubscription(productId);

      if (success) {
        Alert.alert(
          "Succès",
          "Votre abonnement Premium a été activé avec succès !",
          [
            { text: "OK", onPress: () => navigation.goBack() },
          ]
        );
      } else {
        Alert.alert(
          "Erreur",
          "Impossible de compléter l'achat. Veuillez réessayer."
        );
      }
    } catch (err) {
      console.warn("requestSubscription err", err);
      Alert.alert("Erreur", "Impossible de démarrer l'achat.");
    } finally {
      setLoadingId(null);
    }
  };

  /**
   * Fonction de SIMULATION pour tester l'achat sans IAP
   * ⚠️ À utiliser uniquement en développement !
   * @param productId - ID du produit à simuler
   */
  const simulatePurchase = async (productId: string) => {
    try {
      setLoadingId(productId);

      // Importer dynamiquement pour éviter les problèmes de dépendances circulaires
      const ApiService = (await import("../services/ApiService")).default;

      // Trouver l'URL de base de l'API
      const baseUrl = await (ApiService as any).findWorkingUrl();

      // Appeler l'endpoint de simulation du backend
      const response = await fetch(`${baseUrl}/subscription/simulate-purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        // Rafraîchir l'abonnement après l'achat simulé
        await refreshSubscription();

        Alert.alert(
          "🧪 Succès (Simulation)",
          "Abonnement Premium activé ! Mode simulation uniquement",
          [
            { text: "OK", onPress: () => navigation.goBack() },
          ]
        );
      } else {
        Alert.alert("Erreur", data.error || "Impossible de simuler l'achat");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      Alert.alert("Erreur", "Impossible de simuler l'achat");
    } finally {
      setLoadingId(null);
    }
  };

  /**
   * Fonction pour SIMULER l'annulation de l'abonnement
   * ⚠️ À utiliser uniquement en développement !
   */
  const handleCancelSubscription = async () => {
    Alert.alert(
      "Annuler l'abonnement",
      "Voulez-vous vraiment annuler votre abonnement Premium ? (Mode simulation)",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              const ApiService = (await import("../services/ApiService")).default;
              const baseUrl = await (ApiService as any).findWorkingUrl();

              const response = await fetch(`${baseUrl}/subscription/simulate-cancel`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
                },
              });

              const data = await response.json();

              if (data.success) {
                await refreshSubscription();
                Alert.alert("Succès", "Abonnement annulé (retour au plan Free)");
              } else {
                Alert.alert("Erreur", data.error || "Impossible d'annuler");
              }
            } catch (err) {
              Alert.alert("Erreur", "Impossible d'annuler l'abonnement");
            }
          },
        },
      ]
    );
  };

  const isPremiumActive = subscription?.plan === "premium" &&
    (subscription?.status === "active" ||
      (subscription?.status === "cancelled" &&
        subscription?.endDate &&
        new Date() < new Date(subscription.endDate)));

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#2891FF', '#8869FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.iconGradient}
              >
                <Ionicons name="diamond" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Abonnement Premium</Text>
            <Text style={styles.headerSubtitle}>
              Profitez de tous les avantages de MyTripCircle
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Current subscription status */}
          {subscription && !subscriptionLoading && (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIconContainer}>
                  <Ionicons
                    name={isPremiumActive ? "checkmark-circle" : "information-circle"}
                    size={28}
                    color={isPremiumActive ? "#4CAF50" : "#FF9800"}
                  />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>
                    {isPremiumActive ? "Abonnement Premium Actif" : "Plan Gratuit"}
                  </Text>
                  <Text style={styles.statusSubtitle}>
                    {isPremiumActive
                      ? `Renouvellement le ${formatDate(subscription.nextBillingDate || subscription.endDate!)}`
                      : `${subscription.features.maxTrips} voyages maximum`}
                  </Text>
                </View>
              </View>

              {/* Usage indicators for Free plan */}
              {!isPremiumActive && (
                <View style={styles.usageSection}>
                  <View style={styles.usageItem}>
                    <Ionicons name="location" size={18} color="#2891FF" />
                    <Text style={styles.usageText}>
                      {subscription.features.maxTrips} voyages maximum
                    </Text>
                  </View>
                  <View style={styles.usageItem}>
                    <Ionicons name="people" size={18} color="#2891FF" />
                    <Text style={styles.usageText}>
                      {subscription.features.maxCollaborators} collaborateurs maximum
                    </Text>
                  </View>
                  <View style={styles.usageItem}>
                    <Ionicons name="document" size={18} color="#2891FF" />
                    <Text style={styles.usageText}>
                      Export PDF: {subscription.features.canExport ? "Disponible" : "Non disponible"}
                    </Text>
                  </View>
                </View>
              )}

              {isPremiumActive && subscription.status === "cancelled" && (
                <View style={styles.warningBanner}>
                  <Ionicons name="information-circle" size={16} color="#FF9800" />
                  <Text style={styles.warningText}>
                    Votre abonnement sera annulé à la fin de la période en cours.
                  </Text>
                </View>
              )}

              {/* Bouton d'annulation pour les utilisateurs Premium */}
              {isPremiumActive && subscription.status === "active" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelSubscription}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#F44336" />
                  <Text style={styles.cancelButtonText}>Annuler l'abonnement</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Premium benefits comparison */}
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>Comparez les plans</Text>

            <View style={styles.comparisonTable}>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.featureName}>Voyages</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.freeValue}>5 max</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.premiumValue}>Illimité</Text>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.featureName}>Collaborateurs</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.freeValue}>2 max</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.premiumValue}>Illimité</Text>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.featureName}>Export PDF</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.featureName}>Stockage cloud</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.freeValue}>100 MB</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.premiumValue}>Illimité</Text>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.featureName}>Publicités</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.freeValue}>Oui</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="close-circle" size={20} color="#4CAF50" />
                  <Text style={styles.premiumValue}>Non</Text>
                </View>
              </View>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCell}>
                  <Text style={styles.featureName}>Support</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Text style={styles.freeValue}>Standard</Text>
                </View>
                <View style={styles.comparisonCell}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.premiumValue}>Prioritaire</Text>
                </View>
              </View>
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendColor} />
                <Text style={styles.legendText}>Gratuit</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendColorPremium]} />
                <Text style={styles.legendText}>Premium</Text>
              </View>
            </View>
          </View>

          {isExpoGo && (
            <View style={styles.warningCard}>
              <View style={styles.warningIcon}>
                <Ionicons name="alert-circle" size={24} color="#FF9800" />
              </View>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Mode démo</Text>
                <Text style={styles.warningText}>
                  Les achats intégrés ne sont pas disponibles dans Expo Go. Utilisez un build de développement pour tester.
                </Text>
              </View>
            </View>
          )}

          {products.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={40} color="#2891FF" />
              <Text style={styles.loadingText}>Chargement des offres...</Text>
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
                        "Accès illimité aux fonctionnalités premium",
                        "Support prioritaire par email",
                        "Sauvegardes automatiques dans le cloud",
                        "Collaborateurs illimités",
                      ]
                    : [
                        "Tous les avantages du plan mensuel",
                        "Support prioritaire 24/7",
                        "Fonctionnalités exclusives en avant-première",
                        "2 mois offerts par an",
                      ]
                }
                onSubscribe={onSubscribe}
                loading={loadingId === product.productId || subscriptionLoading}
                recommended={index === 1}
              />
            ))
          )}

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Inclus dans tous les plans</Text>
            <View style={styles.featuresList}>
              {[
                { icon: "cloud-upload-outline", text: "Synchronisation cloud" },
                { icon: "shield-checkmark-outline", text: "Données sécurisées" },
                { icon: "people-outline", text: "Collaboration en équipe" },
                { icon: "refresh-outline", text: "Mises à jour gratuites" },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon as any} size={20} color="#2891FF" />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
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
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 64,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 64 + 10 : 24,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -20,
    marginTop: 5,
    zIndex: 10,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    marginTop: -100,
    paddingHorizontal: 24,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#616161",
  },
  usageSection: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 16,
  },
  usageItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  usageText: {
    fontSize: 14,
    color: "#616161",
    marginLeft: 12,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  warningText: {
    fontSize: 13,
    color: "#E65100",
    marginLeft: 8,
    flex: 1,
  },
  comparisonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 16,
    textAlign: "center",
  },
  comparisonTable: {
    borderWidth: 1,
    borderColor: "#F5F5F5",
    borderRadius: 8,
    overflow: "hidden",
  },
  comparisonRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    backgroundColor: "#FAFAFA",
  },
  comparisonCell: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#F5F5F5",
  },
  featureName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    textAlign: "center",
  },
  freeValue: {
    fontSize: 13,
    color: "#757575",
  },
  premiumValue: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  legendColorPremium: {
    backgroundColor: "#4CAF50",
  },
  legendText: {
    fontSize: 13,
    color: "#616161",
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  warningIcon: {
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF9800",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: "#E65100",
    lineHeight: 20,
  },
  // Styles pour le bouton d'annulation d'abonnement
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: "#616161",
    marginTop: 16,
  },
  featuresSection: {
    marginTop: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
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
    backgroundColor: "#E8F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: "#212121",
  },
});

export default SubscriptionScreen;
