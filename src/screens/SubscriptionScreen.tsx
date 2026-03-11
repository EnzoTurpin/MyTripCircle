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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
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
  const navigation = useNavigation();
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
                        "Partagez avec jusqu'à 10 collaborateurs",
                      ]
                    : [
                        "Tous les avantages du plan mensuel",
                        "Support prioritaire 24/7",
                        "Fonctionnalités exclusives en avant-première",
                        "Collaborateurs illimités",
                        "2 mois offerts par an",
                      ]
                }
                onSubscribe={onSubscribe}
                loading={loadingId === product.productId}
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
