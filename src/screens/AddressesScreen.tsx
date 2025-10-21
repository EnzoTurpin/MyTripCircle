import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Address } from "../types";

type AddressesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const AddressesScreen: React.FC = () => {
  const navigation = useNavigation<AddressesScreenNavigationProp>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "hotel" | "restaurant" | "activity" | "transport" | "other"
  >("all");

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    // Simulate loading addresses
    setTimeout(() => {
      const mockAddresses: Address[] = [
        {
          id: "1",
          tripId: "1",
          type: "hotel",
          name: "Hotel Le Marais",
          address: "123 Rue de Rivoli",
          city: "Paris",
          country: "France",
          coordinates: { latitude: 48.8566, longitude: 2.3522 },
          phone: "+33 1 42 36 78 90",
          website: "https://hotelmarais.com",
          notes: "Check-in at 3 PM, check-out at 11 AM",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          tripId: "1",
          type: "restaurant",
          name: "Le Comptoir du Relais",
          address: "9 Carrefour de l'Odéon",
          city: "Paris",
          country: "France",
          coordinates: { latitude: 48.8522, longitude: 2.3387 },
          phone: "+33 1 44 27 07 50",
          notes: "Reservation for 2 people at 8 PM",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3",
          tripId: "1",
          type: "activity",
          name: "Louvre Museum",
          address: "Rue de Rivoli",
          city: "Paris",
          country: "France",
          coordinates: { latitude: 48.8606, longitude: 2.3376 },
          website: "https://louvre.fr",
          notes: "Skip-the-line tickets purchased",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "4",
          tripId: "2",
          type: "hotel",
          name: "Park Hyatt Tokyo",
          address: "3-7-1-2 Nishi-Shinjuku",
          city: "Tokyo",
          country: "Japan",
          coordinates: { latitude: 35.6762, longitude: 139.6503 },
          phone: "+81 3-5322-1234",
          website: "https://tokyo.park.hyatt.com",
          notes: "Luxury hotel with city views",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "5",
          tripId: "2",
          type: "activity",
          name: "Tokyo Skytree",
          address: "1-1-2 Oshiage",
          city: "Tokyo",
          country: "Japan",
          coordinates: { latitude: 35.7101, longitude: 139.8107 },
          website: "https://tokyo-skytree.jp",
          notes: "Observation deck tickets for 10 AM",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setAddresses(mockAddresses);
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

  const filteredAddresses = addresses.filter(
    (address) => selectedFilter === "all" || address.type === selectedFilter
  );

  const handleAddressPress = (address: Address) => {
    navigation.navigate("AddressDetails", { addressId: address.id });
  };

  const handleAddAddress = () => {
    Alert.alert("Add Address", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const handleDirections = (address: Address) => {
    Alert.alert("Directions", `Opening directions to ${address.name}`, [
      { text: "OK" },
    ]);
  };

  const renderAddressCard = ({ item }: { item: Address }) => (
    <TouchableOpacity
      style={styles.addressCard}
      onPress={() => handleAddressPress(item)}
    >
      <View style={styles.addressHeader}>
        <View
          style={[
            styles.typeIcon,
            { backgroundColor: getTypeColor(item.type) },
          ]}
        >
          <Ionicons
            name={getTypeIcon(item.type) as any}
            size={20}
            color="white"
          />
        </View>
        <View style={styles.addressInfo}>
          <Text style={styles.addressName}>{item.name}</Text>
          <Text style={styles.addressLocation}>
            {item.city}, {item.country}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => handleDirections(item)}
        >
          <Ionicons name="navigate" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.addressText}>{item.address}</Text>

      {(item.phone || item.website) && (
        <View style={styles.contactInfo}>
          {item.phone && (
            <View style={styles.contactItem}>
              <Ionicons name="call" size={14} color="#666" />
              <Text style={styles.contactText}>{item.phone}</Text>
            </View>
          )}
          {item.website && (
            <View style={styles.contactItem}>
              <Ionicons name="globe" size={14} color="#666" />
              <Text style={styles.contactText}>{item.website}</Text>
            </View>
          )}
        </View>
      )}

      {item.notes && (
        <View style={styles.notesContainer}>
          <Ionicons name="document-text" size={14} color="#666" />
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
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
        <Text style={styles.loadingText}>Loading your addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton("all", "All")}
          {renderFilterButton("hotel", "Hotels")}
          {renderFilterButton("restaurant", "Restaurants")}
          {renderFilterButton("activity", "Activities")}
          {renderFilterButton("transport", "Transport")}
          {renderFilterButton("other", "Other")}
        </ScrollView>
      </View>

      {filteredAddresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No addresses found</Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === "all"
              ? "Add your first address to get started"
              : `No ${selectedFilter} addresses found`}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddAddress}
          >
            <Text style={styles.createButtonText}>Add Address</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: "#f0f0f0",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressesList: {
    padding: 20,
  },
  addressCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center" as const,
    marginBottom: 10,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  addressLocation: {
    fontSize: 14,
    color: "#666",
  },
  directionsButton: {
    padding: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  contactInfo: {
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center" as const,
    marginBottom: 5,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default AddressesScreen;
