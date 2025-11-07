import React, { useState } from "react";
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
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/i18n";

type BookingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const { bookings, loading } = useTrips();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "flight" | "train" | "hotel" | "restaurant" | "activity"
  >("all");

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
    Alert.alert(t("bookings.addBooking"), t("bookings.featureSoon"), [
      { text: t("common.ok") },
    ]);
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
            {item.status
              ? t(`bookings.status.${item.status}`)
              : t("common.unknown")}
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
            {t("bookings.confirmationShort", { code: item.confirmationNumber })}
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
        <Text style={styles.loadingText}>{t("bookings.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("bookings.header")}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBooking}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton("all", t("bookings.filters.all"))}
          {renderFilterButton("flight", t("bookings.filters.flight"))}
          {renderFilterButton("train", t("bookings.filters.train"))}
          {renderFilterButton("hotel", t("bookings.filters.hotel"))}
          {renderFilterButton("restaurant", t("bookings.filters.restaurant"))}
          {renderFilterButton("activity", t("bookings.filters.activity"))}
        </ScrollView>
      </View>

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>{t("bookings.emptyTitle")}</Text>
          <Text style={styles.emptySubtitle}>
            {selectedFilter === "all"
              ? t("bookings.emptyAll")
              : t("bookings.emptyFiltered", {
                  type: t(`bookings.filters.${selectedFilter}`),
                })}
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleAddBooking}
          >
            <Text style={styles.createButtonText}>
              {t("bookings.addBooking")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item, index) => item.id || `booking-${index}`}
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
