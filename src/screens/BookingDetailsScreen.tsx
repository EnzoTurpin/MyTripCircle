import React, { useState, useEffect } from "react";
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
import { RootStackParamList, Booking } from "../types";
import { useTranslation } from "react-i18next";
import { formatDateLong, getBookingStatusTranslation } from "../utils/i18n";
import { useTrips } from "../contexts/TripsContext";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";

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
  const { t } = useTranslation();
  const { bookings } = useTrips();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId, bookings]);

  const loadBooking = () => {
    setLoading(true);
    // Trouver la réservation dans la liste des réservations
    const foundBooking = bookings.find((b) => b.id === bookingId);
    if (foundBooking) {
      setBooking(foundBooking);
    } else {
      setBooking(null);
    }
    setLoading(false);
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

  const handleEditBooking = () => {
    Alert.alert(
      t("bookings.details.editBooking"),
      t("bookings.details.featureSoon"),
      [{ text: t("common.ok") }]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      t("bookings.details.cancelBooking"),
      t("bookings.details.cancelConfirm"),
      [
        { text: t("bookings.details.no"), style: "cancel" },
        {
          text: t("bookings.details.yes"),
          style: "destructive",
          onPress: () => {},
        },
      ]
    );
  };

  const handleViewAttachment = (attachment: string) => {
    Alert.alert(
      t("bookings.details.viewAttachment"),
      `${t("bookings.details.opening")} ${attachment}`,
      [{ text: t("common.ok") }]
    );
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
        <Text style={styles.loadingText}>{t("bookings.details.loading")}</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("bookings.details.notFound")}</Text>
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
                { backgroundColor: getTypeColor(booking.type) },
              ]}
            >
              <Ionicons
                name={getTypeIcon(booking.type) as any}
                size={32}
                color="white"
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.bookingTitle}>{booking.title}</Text>
              <Text style={styles.bookingDate}>
                {formatDateLong(booking.date)}
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
                  {booking.status
                    ? getBookingStatusTranslation(booking.status)
                    : t("common.unknown")}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {booking.description && (
            <ModernCard variant="elevated" style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("bookings.details.description")}
              </Text>
              <Text style={styles.descriptionText}>{booking.description}</Text>
            </ModernCard>
          )}

          {booking.address && (
            <ModernCard variant="elevated" style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("bookings.details.location")}
              </Text>
              <Text style={styles.addressText}>{booking.address}</Text>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={handleGetDirections}
                activeOpacity={0.7}
              >
                <Ionicons name="navigate" size={18} color="#2891FF" />
                <Text style={styles.directionsText}>
                  {t("bookings.details.getDirections")}
                </Text>
              </TouchableOpacity>
            </ModernCard>
          )}

          <ModernCard variant="elevated" style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("bookings.details.bookingDetails")}
            </Text>
            {booking.confirmationNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("bookings.details.confirmationNumber")}
                </Text>
                <Text style={styles.detailValue}>
                  {booking.confirmationNumber}
                </Text>
              </View>
            )}
            {booking.price && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("bookings.details.price")}
                </Text>
                <Text style={styles.detailValue}>
                  {booking.currency} {booking.price}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("bookings.details.date")}</Text>
              <Text style={styles.detailValue}>
                {formatDateLong(booking.date)}
                {booking.endDate && ` - ${formatDateLong(booking.endDate)}`}
              </Text>
            </View>
            {booking.time && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("bookings.details.time")}
                </Text>
                <Text style={styles.detailValue}>{booking.time}</Text>
              </View>
            )}
          </ModernCard>

          {booking.attachments && booking.attachments.length > 0 && (
            <ModernCard variant="elevated" style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("bookings.details.attachments")}
              </Text>
              {booking.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.attachmentItem}
                  onPress={() => handleViewAttachment(attachment)}
                  activeOpacity={0.7}
                >
                  <View style={styles.attachmentIconContainer}>
                    <Ionicons name="document" size={20} color="#2891FF" />
                  </View>
                  <Text style={styles.attachmentText}>{attachment}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
                </TouchableOpacity>
              ))}
            </ModernCard>
          )}

          <View style={styles.actionsContainer}>
            <ModernButton
              title={t("bookings.details.editBooking")}
              onPress={handleEditBooking}
              variant="primary"
              size="medium"
              icon="create-outline"
              style={styles.actionButton}
            />
            {booking.status !== "cancelled" && (
              <ModernButton
                title={t("bookings.details.cancelBooking")}
                onPress={handleCancelBooking}
                variant="outline"
                size="medium"
                icon="close-circle-outline"
                style={styles.actionButton}
              />
            )}
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
  bookingTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "white",
    marginBottom: 8,
  },
  bookingDate: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "white",
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
  descriptionText: {
    fontSize: 16,
    color: '#616161',
    lineHeight: 24,
  },
  addressText: {
    fontSize: 16,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 24,
  },
  directionsButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  directionsText: {
    fontSize: 15,
    color: '#2891FF',
    marginLeft: 6,
    fontWeight: '600' as const,
  },
  detailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLabel: {
    fontSize: 15,
    color: '#616161',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '600' as const,
  },
  attachmentItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  attachmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  attachmentText: {
    fontSize: 15,
    color: '#212121',
    flex: 1,
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

export default BookingDetailsScreen;
