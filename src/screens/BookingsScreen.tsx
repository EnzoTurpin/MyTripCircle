import React, { useState, useEffect, useCallback } from "react";
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
import { RootStackParamList, Booking } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "react-i18next";
import { formatDate, getBookingStatusTranslation } from "../utils/i18n";
import BookingForm from "../components/BookingForm";
import { ModernCard } from "../components/ModernCard";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";

type BookingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const { bookings, loading, createBooking, refreshData } = useTrips();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "flight" | "train" | "hotel" | "restaurant" | "activity"
  >("all");
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Rafraîchir les données quand l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

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
    // Ouvrir directement le formulaire de réservation
    setShowBookingForm(true);
  };

  const handleSaveBooking = async (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Créer la réservation avec un tripId vide (sera associé plus tard si nécessaire)
      await createBooking({
        ...booking,
        tripId: booking.tripId || "",
      });
      // Rafraîchir les données pour afficher la nouvelle réservation
      await refreshData();
      setShowBookingForm(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert(
        t("common.error"),
        (error as Error).message || t("bookings.saveError") || "Erreur lors de la création de la réservation"
      );
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <ModernCard
      variant="elevated"
      style={styles.bookingCard}
      onPress={() => handleBookingPress(item)}
    >
      <View style={styles.bookingHeader}>
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
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTitle}>{item.title}</Text>
          <View style={styles.dateRow}>
            <Ionicons 
              name="time-outline" 
              size={14} 
              color={"#616161"} 
            />
            <Text style={styles.bookingDate}>
              {formatDate(item.date)}
              {item.time && ` • ${item.time}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingStatus}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '15' },
          ]}
        >
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
              ? getBookingStatusTranslation(item.status)
              : t("common.unknown")}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.bookingDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.address && (
        <View style={styles.addressContainer}>
          <Ionicons 
            name="location" 
            size={16} 
            color={"#FF6B9D"} 
          />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      )}

      <View style={styles.bookingFooter}>
        {item.confirmationNumber && (
          <View style={styles.confirmationContainer}>
            <Ionicons 
              name="checkmark-circle" 
              size={14} 
              color={"#4CAF50"} 
            />
            <Text style={styles.confirmationText}>
              {item.confirmationNumber}
            </Text>
          </View>
        )}
        {item.price && (
          <Text style={styles.priceText}>
            {item.currency} {item.price}
          </Text>
        )}
      </View>
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
        <Text style={styles.loadingText}>{t("bookings.loading")}</Text>
      </View>
    );
  }

  return (
    <SwipeToNavigate currentIndex={1} totalTabs={4}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{t("bookings.header")}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddBooking} activeOpacity={0.7}>
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
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={64} color={"#7EBDFF"} />
              </View>
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
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2891FF', '#8869FF']}
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.createButtonText}>
                    {t("bookings.addBooking")}
                  </Text>
                </LinearGradient>
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

          {/* Booking Form Modal */}
          <BookingForm
            visible={showBookingForm}
            onClose={() => setShowBookingForm(false)}
            onSave={handleSaveBooking}
          />
        </View>
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
  bookingsList: {
    padding: 24,
    paddingBottom: 100, // Espace pour la navbar floating
  },
  bookingCard: {
    marginBottom: 16,
  },
  bookingHeader: {
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
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  bookingDate: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 4,
  },
  bookingStatus: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
    lineHeight: 20,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center" as const,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center" as const,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  confirmationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  confirmationText: {
    fontSize: 12,
    color: '#616161',
    marginLeft: 4,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2891FF',
  },
});

export default BookingsScreen;
