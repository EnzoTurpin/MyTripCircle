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
import { RootStackParamList, Booking } from "../types";

type BookingDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "BookingDetails"
>;
type BookingDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BookingDetails"
>;

const BookingDetailsScreen: React.FC = () => {
  const route = useRoute<BookingDetailsScreenRouteProp>();
  const navigation = useNavigation<BookingDetailsScreenNavigationProp>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    // Simulate loading booking data
    setTimeout(() => {
      const mockBooking: Booking = {
        id: bookingId,
        tripId: "1",
        type: "flight",
        title: "Paris Flight",
        description:
          "Round trip to Paris with Air France. Economy class with meal service included.",
        date: new Date("2024-03-15"),
        time: "14:30",
        address: "Charles de Gaulle Airport, Paris",
        confirmationNumber: "ABC123",
        price: 450,
        currency: "EUR",
        status: "confirmed",
        attachments: ["boarding-pass.pdf", "receipt.pdf"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setBooking(mockBooking);
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditBooking = () => {
    Alert.alert("Edit Booking", "This feature will be implemented soon!", [
      { text: "OK" },
    ]);
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: () => {} },
      ]
    );
  };

  const handleViewAttachment = (attachment: string) => {
    Alert.alert("View Attachment", `Opening ${attachment}`, [{ text: "OK" }]);
  };

  const handleGetDirections = () => {
    if (booking?.address) {
      const url = `https://maps.google.com/maps?q=${encodeURIComponent(
        booking.address
      )}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
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
              { backgroundColor: getTypeColor(booking.type) },
            ]}
          >
            <Ionicons
              name={getTypeIcon(booking.type) as any}
              size={30}
              color="white"
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.bookingTitle}>{booking.title}</Text>
            <Text style={styles.bookingDate}>
              {formatDate(booking.date)}
              {booking.time && ` • ${booking.time}`}
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(booking.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(booking.status) },
                ]}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {booking.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{booking.description}</Text>
          </View>
        )}

        {booking.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.addressText}>{booking.address}</Text>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={handleGetDirections}
            >
              <Ionicons name="navigate" size={16} color="#007AFF" />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          {booking.confirmationNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confirmation Number:</Text>
              <Text style={styles.detailValue}>
                {booking.confirmationNumber}
              </Text>
            </View>
          )}
          {booking.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>
                {booking.currency} {booking.price}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(booking.date)}</Text>
          </View>
          {booking.time && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{booking.time}</Text>
            </View>
          )}
        </View>

        {booking.attachments && booking.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            {booking.attachments.map((attachment, index) => (
              <TouchableOpacity
                key={index}
                style={styles.attachmentItem}
                onPress={() => handleViewAttachment(attachment)}
              >
                <Ionicons name="document" size={20} color="#007AFF" />
                <Text style={styles.attachmentText}>{attachment}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditBooking}
          >
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.actionButtonText}>Edit Booking</Text>
          </TouchableOpacity>
          {booking.status !== "cancelled" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelBooking}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
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
  bookingTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "white",
    marginBottom: 5,
  },
  bookingDate: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
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
  descriptionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 22,
  },
  directionsButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start",
  },
  directionsText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  attachmentItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attachmentText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
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
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold" as const,
    marginLeft: 8,
  },
});

export default BookingDetailsScreen;
