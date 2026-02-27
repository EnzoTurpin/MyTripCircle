import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Address } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "react-i18next";
import { ModernCard } from "../components/ModernCard";
import { AddressForm } from "../components/AddressForm";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";

type AddressesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const AddressesScreen: React.FC = () => {
  const navigation = useNavigation<AddressesScreenNavigationProp>();
  const { addresses, loading, createAddress, refreshData } = useTrips();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "hotel" | "restaurant" | "activity" | "transport" | "other"
  >("all");
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Rafraîchir les données quand l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

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

  const filteredAddresses = addresses.filter(
    (address) => selectedFilter === "all" || address.type === selectedFilter
  );

  const handleAddressPress = (address: Address) => {
    navigation.navigate("AddressDetails", { addressId: address.id });
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (addressData: Omit<Address, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createAddress(addressData);
      // Rafraîchir les données pour afficher la nouvelle adresse
      await refreshData();
      setShowAddressForm(false);
    } catch (error) {
      console.error("Error creating address:", error);
      Alert.alert(
        t("common.error"),
        (error as Error).message || "Erreur lors de la création de l'adresse"
      );
    }
  };

  const handleDirections = (address: Address) => {
    Alert.alert(
      t("addresses.directionsTitle"),
      t("addresses.directionsOpening", { name: address.name }),
      [{ text: t("common.ok") }]
    );
  };

  const renderAddressCard = ({ item }: { item: Address }) => (
    <ModernCard
      variant="elevated"
      style={styles.addressCard}
      onPress={() => handleAddressPress(item)}
    >
      <View style={styles.addressHeader}>
        <View
          style={[
            styles.typeIcon,
            { backgroundColor: getTypeColor(item.type) + '15' },
          ]}
        >
          <Ionicons
            name={getTypeIcon(item.type) as any}
            size={24}
            color={getTypeColor(item.type)}
          />
        </View>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{item.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={"#616161"} />
            <Text style={styles.addressLocation}>
              {item.city}, {item.country}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => handleDirections(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="navigate" size={22} color={"#2891FF"} />
        </TouchableOpacity>
      </View>

      <View style={styles.addressTextContainer}>
        <Ionicons name="map" size={16} color={"#FF6B9D"} />
        <Text style={styles.addressText}>{item.address}</Text>
      </View>

      {(item.phone || item.website) && (
        <View style={styles.contactInfo}>
          {item.phone && (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="call" size={14} color={"#4CAF50"} />
              </View>
              <Text style={styles.contactText}>{item.phone}</Text>
            </View>
          )}
          {item.website && (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="globe" size={14} color={"#2196F3"} />
              </View>
              <Text style={styles.contactText} numberOfLines={1}>{item.website}</Text>
            </View>
          )}
        </View>
      )}

      {item.notes && (
        <View style={styles.notesContainer}>
          <Ionicons name="document-text" size={16} color={"#8869FF"} />
          <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
        </View>
      )}
    </ModernCard>
  );

  const renderFilterButton = (filter: typeof selectedFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("addresses.loading")}</Text>
      </View>
    );
  }

  return (
    <SwipeToNavigate currentIndex={2} totalTabs={4}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{t("addresses.header")}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress} activeOpacity={0.7}>
              <LinearGradient
                colors={['#2891FF', '#8869FF']}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={26} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.filtersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              {renderFilterButton("all", t("addresses.filters.all"))}
              {renderFilterButton("hotel", t("addresses.filters.hotel"))}
              {renderFilterButton("restaurant", t("addresses.filters.restaurant"))}
              {renderFilterButton("activity", t("addresses.filters.activity"))}
              {renderFilterButton("transport", t("addresses.filters.transport"))}
              {renderFilterButton("other", t("addresses.filters.other"))}
            </ScrollView>
          </View>

          {filteredAddresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="map-outline" size={64} color={"#7EBDFF"} />
              </View>
              <Text style={styles.emptyTitle}>{t("addresses.emptyTitle")}</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === "all"
                  ? t("addresses.emptyAll")
                  : t("addresses.emptyFiltered", {
                      type: t(`addresses.filters.${selectedFilter}`),
                    })}
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAddAddress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2891FF', '#8869FF']}
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.createButtonText}>
                    {t("addresses.addAddress")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredAddresses}
              renderItem={renderAddressCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.addressesList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Address Form Modal */}
        <AddressForm
          visible={showAddressForm}
          onClose={() => setShowAddressForm(false)}
          onSave={handleSaveAddress}
        />
      </SafeAreaView>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
  },
  addButton: {
    borderRadius: 9999,
    width: 44,
    height: 44,
    overflow: "hidden",
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  filtersContainer: {
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  filtersScroll: {
    paddingHorizontal: 24,
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  filterButtonActive: {
    backgroundColor: '#2891FF',
    borderColor: '#2891FF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
    textAlign: "center" as const,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#616161',
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    borderRadius: 9999,
    overflow: "hidden",
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  createButtonGradient: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressesList: {
    padding: 24,
    paddingBottom: 100,
  },
  addressCard: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center" as const,
    marginBottom: 16,
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  addressLocation: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 4,
  },
  directionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  addressTextContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-start",
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  contactInfo: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    marginBottom: 8,
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center" as const,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    flex: 1,
    minWidth: "45%",
  },
  contactIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  contactText: {
    fontSize: 12,
    color: '#212121',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: '#F3F0FF',
    padding: 16,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default AddressesScreen;
