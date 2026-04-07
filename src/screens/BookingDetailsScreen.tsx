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
import {
  formatDateLong,
  getBookingStatusTranslation,
  parseApiError,
} from "../utils/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTrips } from "../contexts/TripsContext";
import { ApiService } from "../services/ApiService";
import BookingForm from "../components/BookingForm";
import { F } from "../theme/fonts";
import { RADIUS } from "../theme";
import { useTheme } from "../contexts/ThemeContext";

// ─── Couleurs non-thémifiables ─────────────────────────────────────────────────
const MOSS = '#6B8C5A';
const SKY  = '#5A8FAA';

type BookingDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "BookingDetails"
>;
type BookingDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BookingDetails"
>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTypeIcon = (type: Booking["type"]) => {
  switch (type) {
    case "flight":     return "airplane";
    case "train":      return "train";
    case "hotel":      return "bed";
    case "restaurant": return "restaurant";
    case "activity":   return "ticket";
    default:           return "receipt";
  }
};

const getHeroGradient = (type: Booking["type"]): [string, string, string] => {
  switch (type) {
    case "flight":     return ['#1A3A5C', '#0D2540', '#1E4A70'];
    case "hotel":      return ['#1E3A2A', '#0D2418', '#2A4A35'];
    case "train":      return ['#3A2818', '#1E1408', '#4A3020'];
    case "restaurant": return ['#3A1A18', '#1E0E0C', '#4A2820'];
    case "activity":   return ['#2A1A3C', '#150E24', '#382A4E'];
    default:           return ['#2A2318', '#1A1610', '#3A3028'];
  }
};

const getTypeColors = (type: Booking["type"]): { stripe: string; bg: string } => {
  switch (type) {
    case "flight":     return { stripe: SKY,       bg: 'rgba(90,143,170,0.22)' };
    case "hotel":      return { stripe: MOSS,      bg: 'rgba(107,140,90,0.22)' };
    case "train":      return { stripe: '#C8A870', bg: 'rgba(200,168,112,0.22)' };
    case "restaurant": return { stripe: '#D08070', bg: 'rgba(208,128,112,0.22)' };
    case "activity":   return { stripe: '#A080D0', bg: 'rgba(160,128,208,0.22)' };
    default:           return { stripe: '#B0A090', bg: 'rgba(176,160,144,0.22)' };
  }
};

const getStatusColors = (status: Booking["status"]): { color: string; bg: string } => {
  switch (status) {
    case "confirmed": return { color: '#7BC88A', bg: 'rgba(107,200,138,0.22)' };
    case "pending":   return { color: '#E8B870', bg: 'rgba(232,184,112,0.22)' };
    case "cancelled": return { color: '#E08080', bg: 'rgba(224,128,128,0.22)' };
    default:          return { color: '#B0A090', bg: 'rgba(176,160,144,0.22)' };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const BookingDetailsScreen: React.FC = () => {
  const route      = useRoute<BookingDetailsScreenRouteProp>();
  const navigation = useNavigation<BookingDetailsScreenNavigationProp>();
  const { bookingId, readOnly = false } = route.params;
  const { t }      = useTranslation();
  const insets = useSafeAreaInsets();
  const { bookings, updateBooking, deleteBooking } = useTrips();
  const { colors } = useTheme();

  const getGridThirdLabel = (type: Booking["type"]): string => {
    const key = (
      {
        flight: "bookings.details.gridThirdLabel.flight",
        train: "bookings.details.gridThirdLabel.train",
        hotel: "bookings.details.gridThirdLabel.hotel",
        restaurant: "bookings.details.gridThirdLabel.restaurant",
        activity: "bookings.details.gridThirdLabel.activity",
      } as const
    )[type];
    return key ? t(key) : t("bookings.details.gridThirdLabel.default");
  };

  const [booking, setBooking]       = useState<Booking | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [bookingId, bookings]);

  const loadBooking = async () => {
    setLoading(true);
    const foundBooking = bookings.find((b) => b.id === bookingId || b._id === bookingId);
    if (foundBooking) {
      setBooking(foundBooking);
      setLoading(false);
      return;
    }
    try {
      const data = await ApiService.getBookingById(bookingId);
      setBooking({
        id: data._id ?? data.id,
        _id: data._id,
        tripId: data.tripId,
        type: data.type,
        title: data.title,
        description: data.description,
        date: data.date,
        endDate: data.endDate,
        time: data.time,
        address: data.address,
        confirmationNumber: data.confirmationNumber,
        status: data.status,
        attachments: data.attachments,
      } as any);
    } catch {
      setBooking(null);
    }
    setLoading(false);
  };

  const handleEditBooking = () => {
    setShowEditForm(true);
  };

  const handleSaveBooking = async (
    updates: Omit<Booking, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!booking) return;
    const id = (booking as any)._id ?? booking.id;
    try {
      await updateBooking(id, updates);
      await loadBooking();
      setShowEditForm(false);
    } catch (error) {
      Alert.alert(
        t("common.error"),
        parseApiError(error) || t("bookings.details.errorUpdateBooking"),
      );
    }
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
          onPress: async () => {
            try {
              const id = (booking as any)?._id ?? booking?.id;
              if (id) await deleteBooking(id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                t("common.error"),
                parseApiError(error) || t("bookings.details.errorDeleteBooking"),
              );
            }
          },
        },
      ]
    );
  };

  const handleViewAttachment = async (attachment: string) => {
    const isUri =
      attachment.startsWith("file://") ||
      attachment.startsWith("content://") ||
      attachment.startsWith("http://") ||
      attachment.startsWith("https://") ||
      attachment.startsWith("ph://");

    if (!isUri) {
      Alert.alert(
        t("common.error"),
        t("bookings.details.fileNotAccessible")
      );
      return;
    }

    try {
      await Linking.openURL(attachment);
    } catch (error) {
      Alert.alert(
        t("common.error"),
        t("bookings.details.fileOpenError")
      );
    }
  };

  const handleGetDirections = () => {
    if (booking?.address) {
      const url = `https://maps.google.com/maps?q=${encodeURIComponent(booking.address)}`;
      Linking.openURL(url);
    }
  };

  // ─── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.bg }]}>
        <Text style={[styles.centeredStateText, { color: colors.textMid }]}>{t("bookings.details.loading")}</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.bg }]}>
        <Text style={[styles.centeredStateText, { color: colors.danger }]}>
          {t("bookings.details.notFound")}
        </Text>
      </View>
    );
  }

  const typeC    = getTypeColors(booking.type);
  const statusC  = getStatusColors(booking.status);
  const gradient = getHeroGradient(booking.type);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >

        {/* ── Hero Cover ──────────────────────────────────────────────────── */}
        <View style={styles.heroCover}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Dark overlay */}
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Bottom content: badges + title */}
          <View style={styles.heroBottom}>
            <View style={styles.heroBadgeRow}>
              {/* Type badge */}
              <View style={[styles.heroBadge, { backgroundColor: typeC.bg }]}>
                <Ionicons name={getTypeIcon(booking.type) as any} size={13} color={typeC.stripe} />
                <Text style={[styles.heroBadgeText, { color: typeC.stripe }]}>
                  {t(`bookings.filters.${booking.type}`)}
                </Text>
              </View>
              {/* Status badge */}
              <View style={[styles.heroBadge, { backgroundColor: statusC.bg }]}>
                <Text style={[styles.heroBadgeText, { color: statusC.color }]}>
                  {booking.status ? getBookingStatusTranslation(booking.status) : t("common.unknown")}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{booking.title}</Text>
          </View>
        </View>

        {/* ── Info Grid ───────────────────────────────────────────────────── */}
        <View style={styles.infoGrid}>
          {/* Date */}
          <View style={[styles.infoPill, { backgroundColor: colors.bgMid }]}>
            <Text style={[styles.infoPillLabel, { color: colors.textLight }]}>{t("bookings.details.date")}</Text>
            <Text style={[styles.infoPillValue, { color: colors.text }]} numberOfLines={2}>
              {formatDateLong(booking.date)}
              {booking.endDate ? `\n– ${formatDateLong(booking.endDate)}` : ""}
            </Text>
          </View>
          {/* Time */}
          <View style={[styles.infoPill, { backgroundColor: colors.bgMid }]}>
            <Text style={[styles.infoPillLabel, { color: colors.textLight }]}>{t("bookings.details.time")}</Text>
            <Text style={[styles.infoPillValue, { color: colors.text }]}>{booking.time || "–"}</Text>
          </View>
          {/* Contextual ref (short) */}
          <View style={[styles.infoPill, { backgroundColor: colors.bgMid }]}>
            <Text style={[styles.infoPillLabel, { color: colors.textLight }]}>{getGridThirdLabel(booking.type)}</Text>
            <Text style={[styles.infoPillValue, { color: colors.text }]} numberOfLines={1}>
              {booking.confirmationNumber || "–"}
            </Text>
          </View>
        </View>

        {/* ── Confirmation Card ────────────────────────────────────────────── */}
        {booking.confirmationNumber ? (
          <View style={[styles.confirmCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.confirmLabel, { color: colors.textLight }]}>{t("bookings.details.confirmationNumberShort")}</Text>
            <Text style={[styles.confirmValue, { color: colors.text }]}>{booking.confirmationNumber}</Text>
          </View>
        ) : null}

        {/* ── Attachments ─────────────────────────────────────────────────── */}
        {booking.attachments && booking.attachments.length > 0 ? (
          <View style={styles.attachmentsSection}>
            <Text style={[styles.attachmentsSectionLabel, { color: colors.textLight }]}>{t("bookings.details.attachmentsSectionTitle")}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attachmentsScroll}
            >
              {booking.attachments.map((attachment, index) => {
                const [name, uri] = attachment.includes("::")
                  ? attachment.split("::")
                  : [attachment.split("/").pop() || attachment, attachment];
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.attachmentChip, { backgroundColor: colors.bgMid }]}
                    onPress={() => handleViewAttachment(uri)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.attachmentChipText, { color: colors.textMid }]}>📄 {name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* ── Description ─────────────────────────────────────────────────── */}
        {booking.description ? (
          <View style={[styles.descriptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.descriptionCardTitle, { color: colors.textLight }]}>{t("bookings.details.description")}</Text>
            <Text style={[styles.descriptionCardBody, { color: colors.text }]}>{booking.description}</Text>
          </View>
        ) : null}

        {/* ── Actions Row ─────────────────────────────────────────────────── */}
        {!readOnly && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionEdit, { backgroundColor: colors.bgMid }]}
              onPress={handleEditBooking}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionEditText, { color: colors.textMid }]}>{t("bookings.details.editButton")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionDelete, { backgroundColor: colors.dangerLight }]}
              onPress={handleCancelBooking}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionDeleteText, { color: colors.danger }]}>{t("bookings.details.deleteButton")}</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ── Edit Form Modal ───────────────────────────────────────────────── */}
      {booking && (
        <BookingForm
          visible={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveBooking}
          initialBooking={booking}
          preselectedTripId={booking.tripId}
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centeredState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredStateText: {
    fontSize: 16,
    fontFamily: F.sans400,
  },

  // Hero Cover
  heroCover: {
    height: 200,
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: "center",
    alignItems: "center",
  },
  heroBottom: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: F.sans600,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: F.sans700,
    color: "#FFFFFF",
    lineHeight: 32,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  infoPill: {
    flex: 1,
    minWidth: 80,
    borderRadius: RADIUS.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoPillLabel: {
    fontSize: 11,
    fontFamily: F.sans400,
    marginBottom: 3,
  },
  infoPillValue: {
    fontSize: 14,
    fontFamily: F.sans600,
    lineHeight: 19,
  },

  // Confirmation card
  confirmCard: {
    marginHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmLabel: {
    fontSize: 11,
    fontFamily: F.sans400,
    marginBottom: 4,
  },
  confirmValue: {
    fontSize: 17,
    fontFamily: F.sans600,
    letterSpacing: 0.5,
  },

  // Attachments section
  attachmentsSection: {
    marginHorizontal: 18,
    marginBottom: 12,
  },
  attachmentsSectionLabel: {
    fontSize: 12,
    fontFamily: F.sans600,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  attachmentsScroll: {
    gap: 8,
    paddingRight: 4,
  },
  attachmentChip: {
    borderRadius: RADIUS.input,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  attachmentChipText: {
    fontSize: 12,
    fontFamily: F.sans400,
  },

  // Description card
  descriptionCard: {
    marginHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: RADIUS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  descriptionCardTitle: {
    fontSize: 11,
    fontFamily: F.sans400,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descriptionCardBody: {
    fontSize: 14,
    fontFamily: F.sans400,
    lineHeight: 22,
  },

  // Actions row
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 8,
  },
  actionEdit: {
    flex: 1,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionEditText: {
    fontSize: 14,
    fontFamily: F.sans600,
  },
  actionDelete: {
    flex: 1,
    borderRadius: RADIUS.button,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(192,64,64,0.2)',
  },
  actionDeleteText: {
    fontSize: 14,
    fontFamily: F.sans600,
  },
});

export default BookingDetailsScreen;
