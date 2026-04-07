import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { ApiService } from "../services/ApiService";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import i18n, { parseApiError } from "../utils/i18n";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";

// ── Helpers ────────────────────────────────────────────────────────────────────
const getLocale = () => (i18n.language === "fr" ? "fr-FR" : "en-US");

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString(getLocale(), { day: "numeric", month: "long", year: "numeric" });

const fmtDateShort = (d: string | Date) =>
  new Date(d).toLocaleDateString(getLocale(), { day: "numeric", month: "short" });

const tripDays = (start: string | Date, end: string | Date) =>
  Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));

const bookingIcon = (type: string): any => ({
  flight: "airplane", hotel: "bed", train: "train",
  restaurant: "restaurant", activity: "star", car: "car",
}[type] ?? "receipt");

const bookingColor = (type: string) => ({
  flight: "#5A8FAA", hotel: "#6B8C5A", train: "#C4714A",
  restaurant: "#C4714A", activity: "#8B70C0", car: "#7A6A58",
}[type] ?? "#C4714A");

const bookingBg = (type: string) => ({
  flight: "#DCF0F5", hotel: "#E2EDD9", train: "#F5E5DC",
  restaurant: "#F5E5DC", activity: "#EDE8F5", car: "#EDE5D8",
}[type] ?? "#F5E5DC");

const addressIcon = (type: string) => ({
  hotel: "🏨", restaurant: "🍽️", activity: "🎯",
}[type] ?? "📍");

// ── Screen ─────────────────────────────────────────────────────────────────────
const TripPublicViewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tripId, invitationToken } = route.params as { tripId: string; invitationToken?: string };
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { respondToInvitation } = useTrips();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [trip, setTrip] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "addresses">("bookings");
  const [responding, setResponding] = useState(false);
  const [invitationStatus, setInvitationStatus] = useState<"pending" | "accepted" | "declined" | null>(
    invitationToken ? "pending" : null
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [t, b, a] = await Promise.all([
          ApiService.getTripById(tripId),
          ApiService.getBookingsByTripId(tripId).catch(() => []),
          ApiService.getAddressesByTripId(tripId).catch(() => []),
        ]);
        setTrip(t);
        setBookings(b);
        setAddresses(a);
      } catch {
        // voyage inaccessible
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tripId]);

  const handleAccept = async () => {
    if (!invitationToken) return;
    setResponding(true);
    try {
      const ok = await respondToInvitation(invitationToken, "accept", user?.id);
      if (ok) {
        setInvitationStatus("accepted");
        Alert.alert(
          t("tripPublicView.joinedTitle"),
          t("tripPublicView.joinedMsg", { title: trip?.title ?? "" }),
          [{ text: t("tripPublicView.viewMyTrips"), onPress: () => navigation.navigate("Main") }]
        );
      } else {
        Alert.alert(t("common.error"), t("tripPublicView.acceptError"));
      }
    } catch (e) {
      Alert.alert(
        t("common.error"),
        parseApiError(e) || t("tripPublicView.unexpectedError"),
      );
    } finally {
      setResponding(false);
    }
  };

  const handleDecline = () => {
    Alert.alert(
      t("tripPublicView.declineTitle"),
      t("tripPublicView.declineMsg", { title: trip?.title ?? "" }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tripPublicView.decline"),
          style: "destructive",
          onPress: async () => {
            if (!invitationToken) return;
            setResponding(true);
            try {
              const ok = await respondToInvitation(invitationToken, "decline", user?.id);
              if (ok) {
                setInvitationStatus("declined");
                navigation.goBack();
              } else {
                Alert.alert(t("common.error"), t("tripPublicView.declineError"));
              }
            } catch (e) {
              Alert.alert(
                t("common.error"),
                parseApiError(e) || t("tripPublicView.unexpectedError"),
              );
            } finally {
              setResponding(false);
            }
          },
        },
      ]
    );
  };

  const hasInviteCta = !!invitationToken && invitationStatus === "pending";

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <ScrollView scrollEnabled={false}>
          {/* Hero */}
          <SkeletonBox width="100%" height={280} borderRadius={0} />

          <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 14 }}>
            {/* Destination + dates */}
            <SkeletonBox width="55%" height={26} borderRadius={8} />
            <SkeletonBox width="40%" height={14} borderRadius={6} />

            {/* Stats pills */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <SkeletonBox key={i} height={64} borderRadius={12} style={{ flex: 1 }} />
              ))}
            </View>

            {/* Members */}
            <SkeletonBox width={120} height={14} borderRadius={6} style={{ marginTop: 4 }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <SkeletonBox key={i} width={40} height={40} borderRadius={20} />
              ))}
            </View>

            {/* Booking list */}
            <SkeletonBox width={100} height={14} borderRadius={6} style={{ marginTop: 8 }} />
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <SkeletonBox width={40} height={40} borderRadius={10} />
                <View style={{ flex: 1, gap: 8 }}>
                  <SkeletonBox width="60%" height={14} borderRadius={6} />
                  <SkeletonBox width="40%" height={12} borderRadius={5} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.loaderFull, { backgroundColor: colors.bg }]}>
        <Ionicons name="lock-closed-outline" size={36} color="#B0A090" />
        <Text style={styles.noAccessText}>{t("tripPublicView.noAccess")}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backFallback}>
          <Text style={styles.backFallbackText}>{t("tripPublicView.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const status = now < start ? "upcoming" : now > end ? "past" : "ongoing";
  const statusLabel = {
    upcoming: t("tripPublicView.statusUpcoming"),
    past:     t("tripPublicView.statusPast"),
    ongoing:  t("tripPublicView.statusOngoing"),
  }[status];
  const statusColor = { upcoming: "#5A8FAA", past: "#7A6A58", ongoing: "#6B8C5A" }[status];
  const statusBg = { upcoming: "#DCF0F5", past: "#EDE5D8", ongoing: "#E2EDD9" }[status];
  const days = tripDays(trip.startDate, trip.endDate);
  const membersCount = 1 + (trip.collaborators?.length ?? 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: hasInviteCta ? 110 + insets.bottom : insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cover ── */}
        <View style={styles.cover}>
          {trip.coverImage ? (
            <Image source={{ uri: trip.coverImage }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill as any, { backgroundColor: "#7A6A58" }]} />
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill as any}
          />

          {/* Retour */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Badge lecture seule */}
          <View style={[styles.readOnlyBadge, { top: insets.top + 8 }]}>
            <Ionicons name="eye-outline" size={13} color="#FFFFFF" />
            <Text style={styles.readOnlyText}>{t("tripPublicView.readOnly")}</Text>
          </View>

          {/* Infos */}
          <View style={styles.coverBottom}>
            <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            <Text style={styles.coverTitle}>{trip.title}</Text>
            {trip.destination ? (
              <View style={styles.coverRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.coverSub}>{trip.destination}</Text>
              </View>
            ) : null}
            <View style={styles.coverRow}>
              <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.coverDates}>
                {fmtDateShort(trip.startDate)} – {fmtDate(trip.endDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { icon: "sunny-outline",   value: t("tripPublicView.statDurationDays", { count: days }), label: t("tripPublicView.statDuration") },
            { icon: "people-outline",  value: String(membersCount),    label: t("tripPublicView.statMembers")   },
            { icon: "receipt-outline", value: String(bookings.length), label: t("tripPublicView.statBookings")  },
            { icon: "location-outline",value: String(addresses.length),label: t("tripPublicView.statAddresses") },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: colors.bgMid }]}>
              <Ionicons name={s.icon as any} size={16} color="#C4714A" />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Description ── */}
        {trip.description ? (
          <View style={[styles.descBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.descText, { color: colors.textMid }]}>{trip.description}</Text>
          </View>
        ) : null}

        {/* ── Onglets ── */}
        <View style={[styles.tabs, { backgroundColor: colors.bgMid }]}>
          {(["bookings", "addresses"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && [styles.tabActive, { backgroundColor: colors.surface }]]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab === "bookings" ? "receipt-outline" : "location-outline"}
                size={15}
                color={activeTab === tab ? "#C4714A" : "#B0A090"}
              />
              <Text style={[styles.tabText, { color: colors.textLight }, activeTab === tab && styles.tabTextActive]}>
                {tab === "bookings"
                  ? t("tripPublicView.tabBookings", { count: bookings.length })
                  : t("tripPublicView.tabAddresses", { count: addresses.length })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Réservations ── */}
        {activeTab === "bookings" && (
          <View style={styles.list}>
            {!bookings.length ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={28} color="#B0A090" />
                <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("tripPublicView.noBookings")}</Text>
              </View>
            ) : bookings.map((b: any) => (
              <TouchableOpacity
                key={b._id ?? b.id}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate("BookingDetails", { bookingId: b._id ?? b.id, readOnly: true })}
              >
                <View style={[styles.itemIcon, { backgroundColor: bookingBg(b.type) }]}>
                  <Ionicons name={bookingIcon(b.type)} size={18} color={bookingColor(b.type)} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{b.title}</Text>
                  {b.startDate ? (
                    <Text style={[styles.itemSub, { color: colors.textLight }]}>{fmtDateShort(b.startDate)}{b.endDate ? ` – ${fmtDateShort(b.endDate)}` : ""}</Text>
                  ) : null}
                </View>
                {b.price != null ? (
                  <Text style={styles.itemPrice}>
                    {b.price}{b.currency ? ` ${b.currency}` : t("tripPublicView.currencyFallback")}
                  </Text>
                ) : null}
                <Ionicons name="chevron-forward" size={14} color="#D8CCBA" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Adresses ── */}
        {activeTab === "addresses" && (
          <View style={styles.list}>
            {!addresses.length ? (
              <View style={styles.emptyBox}>
                <Ionicons name="location-outline" size={28} color="#B0A090" />
                <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("tripPublicView.noAddresses")}</Text>
              </View>
            ) : addresses.map((a: any) => (
              <View key={a._id ?? a.id} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.itemIcon, { backgroundColor: colors.bgMid }]}>
                  <Text style={{ fontSize: 18 }}>{addressIcon(a.type)}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{a.name}</Text>
                  {a.city || a.country ? (
                    <Text style={[styles.itemSub, { color: colors.textLight }]}>{[a.city, a.country].filter(Boolean).join(", ")}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Barre CTA invitation ── */}
      {hasInviteCta && (
        <View style={[styles.inviteCta, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.inviteCtaHint}>
            <Ionicons name="mail-outline" size={16} color="#C4714A" />
            <Text style={styles.inviteCtaHintText} numberOfLines={1}>
              {t("tripPublicView.inviteHint")}
            </Text>
          </View>
          <View style={styles.inviteCtaButtons}>
            <TouchableOpacity
              style={styles.inviteCtaDecline}
              onPress={handleDecline}
              disabled={responding}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color={colors.textMid} />
              <Text style={[styles.inviteCtaDeclineText, { color: colors.textMid }]}>{t("tripPublicView.decline")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inviteCtaAccept}
              onPress={handleAccept}
              disabled={responding}
              activeOpacity={0.85}
            >
              {responding ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.inviteCtaAcceptText}>{t("tripPublicView.accept")}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F0E8" },
  scroll: { flex: 1 },

  loaderFull: { flex: 1, backgroundColor: "#F5F0E8", justifyContent: "center", alignItems: "center", gap: 14 },
  noAccessText: { fontSize: 15, fontFamily: F.sans400, color: "#B0A090" },
  backFallback: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#EDE5D8", borderRadius: 12 },
  backFallbackText: { fontSize: 14, fontFamily: F.sans600, color: "#7A6A58" },

  // Cover
  cover: { height: 280, position: "relative", justifyContent: "flex-end", backgroundColor: "#7A6A58" },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  readOnlyBadge: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  readOnlyText: { fontSize: 12, fontFamily: F.sans600, color: "#FFFFFF" },
  coverBottom: { padding: 18, gap: 5 },
  statusPill: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4 },
  statusText: { fontSize: 11, fontFamily: F.sans600 },
  coverTitle: { fontSize: 26, fontFamily: F.sans700, color: "#FFFFFF" },
  coverRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  coverSub: { fontSize: 14, fontFamily: F.sans400, color: "rgba(255,255,255,0.85)" },
  coverDates: { fontSize: 12, fontFamily: F.sans400, color: "rgba(255,255,255,0.7)" },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#EDE5D8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    gap: 3,
  },
  statValue: { fontSize: 15, fontFamily: F.sans700, color: "#C4714A" },
  statLabel: { fontSize: 9, fontFamily: F.sans400, color: "#B0A090", textAlign: "center" },

  // Description
  descBox: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8CCBA",
  },
  descText: { fontSize: 14, fontFamily: F.sans400, color: "#7A6A58", lineHeight: 21 },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "#EDE5D8",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#FFFFFF", shadowColor: "#2A2318", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 12, fontFamily: F.sans500, color: "#B0A090" },
  tabTextActive: { color: "#C4714A", fontFamily: F.sans600 },

  // List
  list: { paddingHorizontal: 16 },
  emptyBox: { alignItems: "center", gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 13, fontFamily: F.sans400, color: "#B0A090" },

  // Item card
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8CCBA",
    padding: 12,
    marginBottom: 8,
  },
  itemIcon: { width: 42, height: 42, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontFamily: F.sans600, color: "#2A2318" },
  itemSub: { fontSize: 11, fontFamily: F.sans400, color: "#B0A090", marginTop: 2 },
  itemPrice: { fontSize: 14, fontFamily: F.sans700, color: "#C4714A" },

  // Invitation CTA bar
  inviteCta: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#D8CCBA",
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    gap: 10,
  },
  inviteCtaHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5E5DC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inviteCtaHintText: {
    fontSize: 13,
    fontFamily: F.sans500,
    color: "#C4714A",
    flex: 1,
  },
  inviteCtaButtons: {
    flexDirection: "row",
    gap: 10,
  },
  inviteCtaDecline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EDE5D8",
    borderRadius: 14,
    paddingVertical: 15,
  },
  inviteCtaDeclineText: {
    fontSize: 16,
    fontFamily: F.sans600,
    color: "#7A6A58",
  },
  inviteCtaAccept: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C4714A",
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: "#C4714A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  inviteCtaAcceptText: {
    fontSize: 16,
    fontFamily: F.sans600,
    color: "#FFFFFF",
  },
});

export default TripPublicViewScreen;
