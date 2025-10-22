import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip, Booking, Address } from "../types";
import { useTrips } from "../contexts/TripsContext";

type TripDetailsScreenRouteProp = RouteProp<RootStackParamList, "TripDetails">;
type TripDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TripDetails"
>;

const TripDetailsScreen: React.FC = () => {
  const route = useRoute<TripDetailsScreenRouteProp>();
  const navigation = useNavigation<TripDetailsScreenNavigationProp>();
  const { tripId } = route.params;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { getTripById, getBookingsByTripId, getAddressesByTripId } = useTrips();

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const foundTrip = getTripById(tripId);
      const tripBookings = getBookingsByTripId(tripId);
      const tripAddresses = getAddressesByTripId(tripId);

      setTrip(foundTrip);
      setBookings(tripBookings);
      setAddresses(tripAddresses);
    } catch (error) {
      console.error("Error loading trip data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleInviteFriends = () => {
    navigation.navigate("InviteFriends", { tripId });
  };

  const handleEditTrip = () => {
    Alert.alert("Edit Trip", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const handleAddBooking = () => {
    Alert.alert("Add Booking", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const handleAddAddress = () => {
    Alert.alert("Add Address", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <Text style={styles.tripTitle}>{trip.title}</Text>
        <Text style={styles.tripDestination}>{trip.destination}</Text>
        <Text style={styles.tripDates}>
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </Text>
        {trip.description && (
          <Text style={styles.tripDescription}>{trip.description}</Text>
        )}
      </LinearGradient>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleInviteFriends}
        >
          <Ionicons name="person-add" size={20} color="white" />
          <Text style={styles.actionButtonText}>Invite Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditTrip}>
          <Ionicons name="create" size={20} color="white" />
          <Text style={styles.actionButtonText}>Edit Trip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bookings</Text>
          <TouchableOpacity onPress={handleAddBooking}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {bookings.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="receipt-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingItem}>
              <View style={styles.bookingHeader}>
                <Ionicons
                  name={
                    booking.type === "flight"
                      ? "airplane"
                      : booking.type === "hotel"
                      ? "bed"
                      : "receipt"
                  }
                  size={20}
                  color="#007AFF"
                />
                <Text style={styles.bookingTitle}>{booking.title}</Text>
              </View>
              <Text style={styles.bookingDate}>
                {formatDate(booking.date)}
                {booking.time && ` • ${booking.time}`}
              </Text>
              {booking.confirmationNumber && (
                <Text style={styles.confirmationText}>
                  Confirmation: {booking.confirmationNumber}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Addresses</Text>
          <TouchableOpacity onPress={handleAddAddress}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {addresses.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="location-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No addresses yet</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressItem}>
              <View style={styles.addressHeader}>
                <Ionicons
                  name={
                    address.type === "hotel"
                      ? "bed"
                      : address.type === "restaurant"
                      ? "restaurant"
                      : "location"
                  }
                  size={20}
                  color="#007AFF"
                />
                <Text style={styles.addressName}>{address.name}</Text>
              </View>
              <Text style={styles.addressText}>{address.address}</Text>
              <Text style={styles.addressLocation}>
                {address.city}, {address.country}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.collaboratorsSection}>
        <Text style={styles.sectionTitle}>Collaborators</Text>
        <View style={styles.collaboratorsList}>
          <View style={styles.collaboratorItem}>
            <View style={styles.collaboratorAvatar}>
              <Ionicons name="person" size={20} color="white" />
            </View>
            <Text style={styles.collaboratorName}>You (Owner)</Text>
          </View>
          {trip.collaborators.map((collaboratorId, index) => (
            <View key={collaboratorId} style={styles.collaboratorItem}>
              <View style={styles.collaboratorAvatar}>
                <Ionicons name="person" size={20} color="white" />
              </View>
              <Text style={styles.collaboratorName}>
                Collaborator {index + 1}
              </Text>
            </View>
          ))}
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
  tripTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "white",
    marginBottom: 10,
  },
  tripDestination: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 5,
  },
  tripDates: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 15,
  },
  tripDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold" as const,
    marginLeft: 8,
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
  },
  emptySection: {
    alignItems: "center" as const,
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  bookingItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bookingHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 5,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
  },
  bookingDate: {
    fontSize: 14,
    color: "#666",
    marginLeft: 30,
  },
  confirmationText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 30,
    marginTop: 5,
  },
  addressItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  addressHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 5,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 30,
    marginBottom: 2,
  },
  addressLocation: {
    fontSize: 12,
    color: "#999",
    marginLeft: 30,
  },
  collaboratorsSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collaboratorsList: {
    marginTop: 10,
  },
  collaboratorItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 10,
  },
  collaboratorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 15,
  },
  collaboratorName: {
    fontSize: 16,
    color: "#333",
  },
});

export default TripDetailsScreen;
