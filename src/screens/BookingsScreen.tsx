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
import { RootStackParamList, Booking } from "../types";

type BookingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "flight" | "train" | "hotel" | "restaurant" | "activity"
  >("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    // Simulate loading bookings
    setTimeout(() => {
      const mockBookings: Booking[] = [
        {
          id: "1",
          tripId: "1",
          type: "flight",
          title: "Paris Flight",
          description: "Round trip to Paris",
          date: new Date("2024-03-15"),
          time: "14:30",
          confirmationNumber: "ABC123",
          price: 450,
          currency: "EUR",
          status: "confirmed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          tripId: "1",
          type: "hotel",
          title: "Hotel Le Marais",
          description: "3 nights in Paris",
          date: new Date("2024-03-15"),
          address: "123 Rue de Rivoli, Paris",
          confirmationNumber: "HOT456",
          price: 300,
          currency: "EUR",
          status: "confirmed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3",
          tripId: "1",
          type: "restaurant",
          title: "Le Comptoir du Relais",
          description: "Dinner reservation",
          date: new Date("2024-03-16"),
          time: "20:00",
          address: "9 Carrefour de l'Odéon, Paris",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "4",
          tripId: "2",
          type: "activity",
          title: "Tokyo Skytree Visit",
          description: "Observation deck tickets",
          date: new Date("2024-06-12"),
          time: "10:00",
          price: 25,
          currency: "USD",
          status: "confirmed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  };

  const getTypeIcon = (type: Booking["type"]) => {
    switch (type) {
      case "flight":
        return "airplane";
      case "train":
        return "train";
      case "hotel":
        return "bed";
      case "restaurant":
        return "restaurant";
      case "activity":
        return "ticket";
      default:
        return "receipt";
    }
  };

  const getTypeColor = (type: Booking["type"]) => {
    switch (type) {
      case "flight":
        return "#007AFF";
      case "train":
        return "#34C759";
      case "hotel":
        return "#FF9500";
      case "restaurant":
        return "#FF3B30";
      case "activity":
        return "#5856D6";
      default:
        return "#8E8E93";
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "#34C759";
      case "pending":
        return "#FF9500";
      case "cancelled":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const filteredBookings = bookings.filter(
    (booking) => selectedFilter === "all" || booking.type === selectedFilter
  );

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate("BookingDetails", { bookingId: booking.id });
  };

  const handleAddBooking = () => {
    Alert.alert("Add Booking", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => handleBookingPress(item)}
    >
      <View style={styles.bookingHeader}>
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
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTitle}>{item.title}</Text>
          <Text style={styles.bookingDate}>
            {formatDate(item.date)}
            {item.time && ` • ${item.time}`}
          </Text>
        </View>
        <View style={styles.bookingStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.bookingDescription}>{item.description}</Text>
      )}

      {item.address && (
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.addressText}>{item.address}</Text>
        </View>
      )}

      <View style={styles.bookingFooter}>
        {item.confirmationNumber && (
          <Text style={styles.confirmationText}>
            Conf: {item.confirmationNumber}
          </Text>
        )}
        {item.price && (
          <Text style={styles.priceText}>
            {item.currency} {item.price}
          </Text>
        )}
      </View>
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
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBooking}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton("all", "All")}
          {renderFilterButton("flight", "Flights")}
          {renderFilterButton("train", "Trains")}
          {renderFilterButton("hotel", "Hotels")}
          {renderFilterButton("restaurant", "Restaurants")}
          {renderFilterButton("activity", "Activities")}
        </ScrollView>
      </View>

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === "all"
              ? "Add your first booking to get started"
              : `No ${selectedFilter} bookings found`}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddBooking}
          >
            <Text style={styles.createButtonText}>Add Booking</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookingsList}
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
  bookingsList: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookingHeader: {
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
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  bookingDate: {
    fontSize: 14,
    color: "#666",
  },
  bookingStatus: {
    flexDirection: "row",
    alignItems: "center" as const,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  bookingDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    lineHeight: 20,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center" as const,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center" as const,
  },
  confirmationText: {
    fontSize: 12,
    color: "#999",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
});

export default BookingsScreen;
