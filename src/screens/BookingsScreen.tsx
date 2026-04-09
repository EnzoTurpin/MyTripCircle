import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Booking } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "react-i18next";
import {
  formatDate,
  getBookingStatusTranslation,
  parseApiError,
} from "../utils/i18n";
import BookingForm from "../components/BookingForm";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { F } from "../theme/fonts";
import { COLORS as C } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";
import {
  getBookingTypeIcon,
  getBookingTypeColors,
  getBookingStatusColors,
} from "../utils/bookingHelpers";

type BookingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

// ─── Component ────────────────────────────────────────────────────────────────
const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const { bookings, loading, createBooking, refreshData } = useTrips();
  const { t } = useTranslation();
  const { colors } = useTheme();
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

  const filteredBookings = bookings.filter(
    (booking) => selectedFilter === "all" || booking.type === selectedFilter
  );

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate("BookingDetails", { bookingId: booking.id });
  };

  const handleAddBooking = () => {
    setShowBookingForm(true);
  };

  const handleSaveBooking = async (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await createBooking({
        ...booking,
        tripId: booking.tripId || "",
      });
      await refreshData();
      setShowBookingForm(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert(
        t("common.error"),
        parseApiError(error) ||
          t("bookings.saveError") ||
          t("bookings.createBookingError")
      );
    }
  };

  // ─── Booking card ────────────────────────────────────────────────────────────
  const renderBookingCard = ({ item }: { item: Booking }) => {
    const typeC   = getBookingTypeColors(item.type);
    const statusC = getBookingStatusColors(item.status);
    const stripeColor = typeC?.stripe ?? colors.textMid;
    const typeBg = typeC?.bg ?? colors.bgMid;
    const statusBgColor = statusC?.bg ?? colors.bgMid;
    const statusTextColor = statusC?.color ?? colors.textMid;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleBookingPress(item)}
        activeOpacity={0.85}
      >
        {/* Left colour stripe */}
        <View style={[styles.cardStripe, { backgroundColor: stripeColor }]} />

        {/* Card body */}
        <View style={styles.cardBody}>
          {/* Top row: icon + info + status */}
          <View style={styles.cardTopRow}>
            <View style={[styles.typeIconCircle, { backgroundColor: typeBg }]}>
              <Ionicons
                name={getBookingTypeIcon(item.type) as any}
                size={24}
                color={stripeColor}
              />
            </View>

            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textLight }]} numberOfLines={1}>
                {formatDate(item.date)}
                {item.time ? ` · ${item.time}` : ""}
              </Text>
            </View>

            <View style={styles.cardRight}>
              {/* Status badge */}
              <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                <Text style={[styles.statusBadgeText, { color: statusTextColor }]}>
                  {item.status ? getBookingStatusTranslation(item.status) : t("common.unknown")}
                </Text>
              </View>
            </View>
          </View>

          {/* Optional description */}
          {item.description ? (
            <Text style={[styles.cardDescription, { color: colors.textMid }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Optional address */}
          {item.address ? (
            <View style={styles.cardAddressRow}>
              <Ionicons name="location-outline" size={16} color={colors.textLight} />
              <Text style={[styles.cardAddressText, { color: colors.textLight }]} numberOfLines={1}>{item.address}</Text>
            </View>
          ) : null}

          {/* Confirmation number */}
          {item.confirmationNumber ? (
            <View style={styles.cardConfRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={MOSS} />
              <Text style={[styles.cardConfText, { color: colors.textMid }]}>{item.confirmationNumber}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Filter pill ─────────────────────────────────────────────────────────────
  const renderFilterButton = (filter: typeof selectedFilter, label: string) => {
    const active = selectedFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterPill, { backgroundColor: colors.bgMid }, active && styles.filterPillActive]}
        onPress={() => setSelectedFilter(filter)}
        activeOpacity={0.75}
      >
        <Text style={[styles.filterPillText, { color: colors.textMid }, active && styles.filterPillTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SwipeToNavigate currentIndex={1} totalTabs={5}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
          <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
          <ScrollView scrollEnabled={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: 14, paddingTop: 20, paddingBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
              <SkeletonBox width={160} height={28} borderRadius={8} />
              <SkeletonBox width={44} height={44} borderRadius={22} />
            </View>

            {/* Filter pills */}
            <View style={{ flexDirection: "row", paddingHorizontal: 14, gap: 8, marginBottom: 16 }}>
              {[{ id: "p1", w: 80 }, { id: "p2", w: 60 }, { id: "p3", w: 60 }, { id: "p4", w: 80 }, { id: "p5", w: 70 }].map(({ id, w }) => (
                <SkeletonBox key={id} width={w} height={34} borderRadius={20} />
              ))}
            </View>

            {/* Booking cards */}
            <View style={{ paddingHorizontal: 14, gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ borderRadius: 16, overflow: "hidden", flexDirection: "row" }}>
                  <SkeletonBox width={6} height={96} borderRadius={0} style={{ borderRadius: 0 }} />
                  <View style={{ flex: 1, backgroundColor: colors.bgMid, padding: 14, gap: 10 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <SkeletonBox width={130} height={16} borderRadius={6} />
                      <SkeletonBox width={70} height={22} borderRadius={10} />
                    </View>
                    <SkeletonBox width="80%" height={12} borderRadius={5} />
                    <SkeletonBox width="50%" height={12} borderRadius={5} />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </SwipeToNavigate>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <SwipeToNavigate currentIndex={1} totalTabs={5}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
        <View style={[styles.container, { backgroundColor: colors.bg }]}>

          {/* ── Header ── */}
          <View style={[styles.header, { backgroundColor: colors.bg }]}>
            <View>
              <Text style={[styles.headerEyebrow, { color: colors.textLight }]}>{t("bookings.myBookingsHeader")}</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t("bookings.header")}</Text>
            </View>
            {/* Add booking button */}
            <TouchableOpacity
              style={[styles.filterIconBtn, { backgroundColor: colors.terraLight }]}
              onPress={handleAddBooking}
              activeOpacity={0.75}
            >
              <Ionicons name="add" size={24} color={colors.terra} />
            </TouchableOpacity>
          </View>

          {/* Filter tabs */}
          <View style={styles.filtersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              {renderFilterButton("all",        t("bookings.filters.all"))}
              {renderFilterButton("flight",     t("bookings.filters.flight"))}
              {renderFilterButton("train",      t("bookings.filters.train"))}
              {renderFilterButton("hotel",      t("bookings.filters.hotel"))}
              {renderFilterButton("restaurant", t("bookings.filters.restaurant"))}
              {renderFilterButton("activity",   t("bookings.filters.activity"))}
            </ScrollView>
          </View>

          {/* Empty state */}
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.terraLight }]}>
                <Ionicons name="calendar-outline" size={44} color={colors.terra} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("bookings.emptyTitle")}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMid }]}>
                {selectedFilter === "all"
                  ? t("bookings.emptyAll")
                  : t("bookings.emptyFiltered", {
                      type: t(`bookings.filters.${selectedFilter}`),
                    })}
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={handleAddBooking}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.emptyAddButtonText}>{t("bookings.addBooking")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listWrapper}>
              <FlatList
                data={filteredBookings}
                renderItem={renderBookingCard}
                keyExtractor={(item, index) => item.id || `booking-${index}`}
                contentContainerStyle={styles.bookingsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Total bar — fixed above navbar */}
          {filteredBookings.length > 0 && (
            <View style={[styles.totalBar, { backgroundColor: colors.bgMid, borderTopColor: colors.border }]}>
              <Text style={[styles.totalBarLabel, { color: colors.textMid }]}>
                {t("bookings.totalCount", { count: filteredBookings.length })}
              </Text>
            </View>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: F.sans400,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerEyebrow: {
    fontFamily: F.sans400,
    fontSize: 13,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: F.sans700,
    fontSize: 28,
  },
  filterIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },

  // Filters
  filtersWrapper: {
    paddingBottom: 14,
  },
  filtersScroll: {
    paddingHorizontal: 24,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 0,
  },
  filterPillActive: {
    backgroundColor: "#C4714A", // terra — identique light/dark
  },
  filterPillText: {
    fontFamily: F.sans600,
    fontSize: 15,
  },
  filterPillTextActive: {
    fontFamily: F.sans600,
    fontSize: 15,
    color: "white",
  },

  // List wrapper (relative container for FAB)
  listWrapper: {
    flex: 1,
  },

  // List
  bookingsList: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.terra,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.terraDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  // Card
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 12,
  },
  cardStripe: {
    width: 5,
    height: 48,
    borderRadius: 3,
    marginRight: 4,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    paddingRight: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: F.sans600,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: F.sans400,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 13,
    fontFamily: F.sans600,
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
    fontFamily: F.sans400,
  },
  cardAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 5,
  },
  cardAddressText: {
    fontSize: 13,
    flex: 1,
    fontFamily: F.sans400,
  },
  cardConfRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 5,
  },
  cardConfText: {
    fontSize: 13,
    fontFamily: F.sans500,
  },

  // Total bar
  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  totalBarLabel: {
    fontSize: 17,
    fontFamily: F.sans500,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: F.sans700,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: F.sans400,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C4714A", // terra — identique light/dark
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyAddButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: F.sans600,
  },
});

export default BookingsScreen;
