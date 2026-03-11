import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Address } from "../types";
import { useTranslation } from "react-i18next";
import { useTrips } from "../contexts/TripsContext";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";

type AddressDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "AddressDetails"
>;
type AddressDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddressDetails"
>;

const AddressDetailsScreen: React.FC = () => {
  const route = useRoute<AddressDetailsScreenRouteProp>();
  const navigation = useNavigation<AddressDetailsScreenNavigationProp>();
  const { addressId } = route.params;
  const { t } = useTranslation();
  const { addresses, loading } = useTrips();

  const [address, setAddress] = useState<Address | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const found = addresses.find((item) => item.id === addressId) || null;
      setAddress(found);
      setIsReady(true);
    }
  }, [loading, addresses, addressId]);

  const getTypeIcon = (type: Address["type"]) => {
    switch (type) {
      case "hotel":
        return "bed";
      case "restaurant":
        return "restaurant";
      case "activity":
        return "ticket";
      case "transport":
        return "car";
      case "other":
        return "location";
      default:
        return "location";
    }
  };

  const getTypeColor = (type: Address["type"]) => {
    switch (type) {
      case "hotel":
        return "#FF9500";
      case "restaurant":
        return "#FF3B30";
      case "activity":
        return "#5856D6";
      case "transport":
        return "#34C759";
      case "other":
        return "#8E8E93";
      default:
        return "#8E8E93";
    }
  };

  const handleEditAddress = () => {
    navigation.navigate("AddressForm", { addressId });
  };

  const handleGetDirections = () => {
    if (!address) return;
    const query = encodeURIComponent(
      `${address.address}, ${address.city}, ${address.country}`
    );
    const url = `https://maps.google.com/maps?daddr=${query}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (address?.phone) {
      Linking.openURL(`tel:${address.phone}`);
    }
  };

  const handleVisitWebsite = () => {
    if (address?.website) {
      Linking.openURL(address.website);
    }
  };

  if (!isReady || loading) {    
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("addresses.details.loading")}</Text>
      </View>
    );
  }

  if (!address) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("addresses.details.notFound")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: getTypeColor(address.type) },
              ]}
            >
              <Ionicons
                name={getTypeIcon(address.type) as any}
                size={32}
                color="white"
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.addressName}>{address.name}</Text>
              <Text style={styles.addressLocation}>
                {address.city}, {address.country}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ModernCard variant="elevated" style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("addresses.details.address")}
            </Text>
            <View style={styles.addressRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color="#FF6B9D" />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>{address.address}</Text>
                <Text style={styles.cityText}>
                  {address.city}, {address.country}
                </Text>
              </View>
            </View>
          </ModernCard>

          {(address.phone || address.website) && (
            <ModernCard variant="elevated" style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("addresses.details.contactInformation")}
              </Text>
              {address.phone && (
                <TouchableOpacity 
                  style={styles.contactItem} 
                  onPress={handleCall}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconContainer}>
                    <Ionicons name="call" size={20} color="#2891FF" />
                  </View>
                  <Text style={styles.contactText}>{address.phone}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
                </TouchableOpacity>
              )}
              {address.website && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={handleVisitWebsite}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconContainer}>
                    <Ionicons name="globe" size={20} color="#2891FF" />
                  </View>
                  <Text style={styles.contactText}>{address.website}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
                </TouchableOpacity>
              )}
            </ModernCard>
          )}

          {address.notes && (
            <ModernCard variant="elevated" style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("addresses.details.notes")}
              </Text>
              <Text style={styles.notesText}>{address.notes}</Text>
            </ModernCard>
          )}

          <View style={styles.actionsContainer}>
            <ModernButton
              title={t("addresses.details.getDirections")}
              onPress={handleGetDirections}
              variant="primary"
              size="medium"
              icon="navigate"
              style={styles.actionButton}
            />
            <ModernButton
              title={t("addresses.details.editAddress")}
              onPress={handleEditAddress}
              variant="outline"
              size="medium"
              icon="create-outline"
              style={styles.actionButton}
            />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: '#FAFAFA',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
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
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: -20,
    marginTop: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 50,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "white",
    marginBottom: 8,
  },
  addressLocation: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    marginTop: -100,
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#212121',
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D' + '15',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
    lineHeight: 24,
  },
  cityText: {
    fontSize: 14,
    color: '#616161',
  },
  contactItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#212121',
    flex: 1,
  },
  notesText: {
    fontSize: 16,
    color: '#616161',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: "row" as const,
    gap: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});

export default AddressDetailsScreen;
