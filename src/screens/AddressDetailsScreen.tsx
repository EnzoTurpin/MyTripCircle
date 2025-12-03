import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Address } from "../types";
import { useTranslation } from "react-i18next";

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

  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddress();
  }, [addressId]);

  const loadAddress = async () => {
    // Simulate loading address data
    setTimeout(() => {
      const mockAddress: Address = {
        id: addressId,
        tripId: "1",
        type: "hotel",
        name: "Hotel Le Marais",
        address: "123 Rue de Rivoli",
        city: "Paris",
        country: "France",
        coordinates: { latitude: 48.8566, longitude: 2.3522 },
        phone: "+33 1 42 36 78 90",
        website: "https://hotelmarais.com",
        notes:
          "Check-in at 3 PM, check-out at 11 AM. Located in the heart of Le Marais district.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAddress(mockAddress);
      setLoading(false);
    }, 1000);
  };

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
    Alert.alert(
      t("addresses.details.editAddress"),
      t("addresses.details.featureSoon"),
      [{ text: t("common.ok") }]
    );
  };

  const handleGetDirections = () => {
    if (address?.coordinates) {
      const { latitude, longitude } = address.coordinates;
      const url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert(
        t("addresses.directionsTitle"),
        t("addresses.details.coordinatesNotAvailable")
      );
    }
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

  if (loading) {
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
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: getTypeColor(address.type) },
            ]}
          >
            <Ionicons
              name={getTypeIcon(address.type) as any}
              size={30}
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("addresses.details.address")}
          </Text>
          <Text style={styles.addressText}>{address.address}</Text>
          <Text style={styles.cityText}>
            {address.city}, {address.country}
          </Text>
        </View>

        {(address.phone || address.website) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("addresses.details.contactInformation")}
            </Text>
            {address.phone && (
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#007AFF" />
                <Text style={styles.contactText}>{address.phone}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            )}
            {address.website && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={handleVisitWebsite}
              >
                <Ionicons name="globe" size={20} color="#007AFF" />
                <Text style={styles.contactText}>{address.website}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {address.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("addresses.details.notes")}
            </Text>
            <Text style={styles.notesText}>{address.notes}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGetDirections}
          >
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.actionButtonText}>
              {t("addresses.details.getDirections")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleEditAddress}
          >
            <Ionicons name="create" size={20} color="#007AFF" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              {t("addresses.details.editAddress")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  typeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 20,
  },
  headerInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "white",
    marginBottom: 5,
  },
  addressLocation: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 15,
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    lineHeight: 22,
  },
  cityText: {
    fontSize: 14,
    color: "#666",
  },
  contactItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  notesText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginHorizontal: 5,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold" as const,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
});

export default AddressDetailsScreen;
