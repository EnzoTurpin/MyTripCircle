import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { F } from "../theme/fonts";
import { RADIUS } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";

// Curated travel photos cycling by index
const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80&fit=crop",
];

const MINI_PHOTOS = [
  "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&q=80&fit=crop",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=200&q=80&fit=crop",
];

type TripsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

const formatShortDate = (date: Date, monthsShort: string[]): string => {
  const d = new Date(date);
  return `${d.getDate()} ${monthsShort[d.getMonth()]}`;
};

const TripsScreen: React.FC = () => {
  const navigation = useNavigation<TripsScreenNavigationProp>();
  const { trips, loading, refreshData } = useTrips();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const MONTHS_SHORT = t("trips.months").split(",");

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const handleCreateTrip = () => navigation.navigate("CreateTrip");
  const handleTripPress = (trip: Trip) => navigation.navigate("TripDetails", { tripId: trip.id });

  const getFirstName = () => {
    if (!user?.name) return "";
    return user.name.trim().split(" ")[0];
  };

  const daysUntil = (date: Date): number => {
    const now = new Date();
    const diffMs = new Date(date).getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  const [showAllTrips, setShowAllTrips] = useState(false);

  const now = new Date();
  const upcomingTrips = trips.filter((t) => new Date(t.endDate) >= now);

  const heroTrip: Trip | null = upcomingTrips.find((t) => t.status !== "draft") ?? upcomingTrips[0] ?? null;
  const miniTrips: Trip[] = heroTrip ? upcomingTrips.filter((t) => t.id !== heroTrip.id) : [];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SkeletonBox width={44} height={44} borderRadius={12} />
              <View style={{ gap: 6 }}>
                <SkeletonBox width={120} height={12} borderRadius={6} />
                <SkeletonBox width={160} height={20} borderRadius={8} />
              </View>
            </View>
            <SkeletonBox width={44} height={44} borderRadius={22} />
          </View>

          {/* Hero card */}
          <View style={{ marginHorizontal: 14, marginBottom: 8 }}>
            <SkeletonBox width="100%" height={180} borderRadius={18} />
          </View>

          {/* Pills row */}
          <View style={[styles.pillsRow, { paddingTop: 12 }]}>
            {[0, 1, 2].map((i) => (
              <SkeletonBox key={i} height={72} borderRadius={12} style={{ flex: 1 }} />
            ))}
          </View>

          {/* Section header */}
          <View style={[styles.sectionHeader, { paddingTop: 12 }]}>
            <SkeletonBox width={160} height={22} borderRadius={8} />
            <SkeletonBox width={60} height={14} borderRadius={6} />
          </View>

          {/* Mini cards */}
          <View style={{ flexDirection: "row", paddingHorizontal: 14, gap: 12 }}>
            {[0, 1].map((i) => (
              <SkeletonBox key={i} width={190} height={176} borderRadius={16} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SwipeToNavigate currentIndex={0} totalTabs={5}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Header ───────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.headerEyebrow, { color: colors.textLight }]}>{t("trips.greeting", { name: getFirstName() })}</Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t("trips.header")}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addTripBtn}
              onPress={handleCreateTrip}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {upcomingTrips.length === 0 ? (
            /* ── Empty state ─────────────────────────────────────────────── */
            <>
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.terraLight }]}>
                  <Ionicons name="airplane-outline" size={40} color={colors.terra} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("trips.emptyTitle")}</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMid }]}>{t("trips.emptySubtitle")}</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.miniScroll}
              >
                <TouchableOpacity style={[styles.dashedCard, { borderColor: colors.bgDark, backgroundColor: colors.bg }]} onPress={handleCreateTrip} activeOpacity={0.8}>
                  <View style={[styles.dashedAddCircle, { backgroundColor: colors.terraLight }]}>
                    <Text style={[styles.dashedAddPlus, { color: colors.terra }]}>+</Text>
                  </View>
                  <Text style={[styles.dashedNewLabel, { color: colors.textLight }]}>{t("trips.newButton")}</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          ) : (
            <>
              {/* ── Hero card ─────────────────────────────────────────────── */}
              {heroTrip && (
                <>
                  <TouchableOpacity
                    style={styles.heroCard}
                    onPress={() => handleTripPress(heroTrip)}
                    activeOpacity={0.88}
                  >
                    {/* Photo background */}
                    <Image
                      source={{ uri: HERO_PHOTOS[trips.indexOf(heroTrip) % HERO_PHOTOS.length] }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />

                    {/* Gradient overlay */}
                    <LinearGradient
                      colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.72)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* Status badge */}
                    <View style={styles.heroStatusBadge}>
                      <Text style={styles.heroStatusText}>
                        {heroTrip.status === "draft" ? t("trips.statusDraft") : t("trips.statusActive")}
                      </Text>
                    </View>

                    {/* Arrow button */}
                    <View style={styles.heroArrowBtn}>
                      <Ionicons name="arrow-forward-outline" size={16} color="#A35830" />
                    </View>

                    {/* Bottom content */}
                    <View style={styles.heroBottom}>
                      <Text style={styles.heroTitle} numberOfLines={1}>
                        {heroTrip.title}
                      </Text>
                      <Text style={styles.heroMeta} numberOfLines={1}>
                        📍 {heroTrip.destination} · {formatShortDate(heroTrip.startDate, MONTHS_SHORT)}–{formatShortDate(heroTrip.endDate, MONTHS_SHORT)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* ── Stats pills ─────────────────────────────────────── */}
                  <View style={styles.pillsRow}>
                    <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
                      <Text style={[styles.pillValue, { color: colors.terra }]}>{heroTrip.stats?.totalBookings ?? 0}</Text>
                      <Text style={[styles.pillLabel, { color: colors.textLight }]}>{t("trips.bookingsLabel")}</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
                      <Text style={[styles.pillValue, { color: colors.terra }]}>{(heroTrip.collaborators?.length ?? 0) + 1}</Text>
                      <Text style={[styles.pillLabel, { color: colors.textLight }]}>{t("trips.coTravelers")}</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: colors.bgMid }]}>
                      <Text style={[styles.pillValue, { color: colors.terra }]}>{daysUntil(heroTrip.startDate)}j</Text>
                      <Text style={[styles.pillLabel, { color: colors.textLight }]}>{t("trips.beforeDeparture")}</Text>
                    </View>
                  </View>
                </>
              )}

              {/* ── Section header ──────────────────────────────────────── */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("trips.upcomingTrips")}</Text>
                <TouchableOpacity onPress={() => setShowAllTrips((v) => !v)} activeOpacity={0.7}>
                  <Text style={[styles.sectionLink, { color: colors.terra }]}>{showAllTrips ? t("trips.showLess") : t("trips.showAll")}</Text>
                </TouchableOpacity>
              </View>

              {showAllTrips ? (
                /* ── All trips vertical list ──────────────────────────────── */
                <View style={styles.allTripsContainer}>
                  {miniTrips.map((trip, idx) => (
                    <TouchableOpacity
                      key={trip.id ?? `all-${idx}`}
                      style={[styles.allTripRow, { backgroundColor: colors.surface, borderColor: colors.bgMid }]}
                      onPress={() => handleTripPress(trip)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: MINI_PHOTOS[idx % MINI_PHOTOS.length] }}
                        style={styles.allTripPhoto}
                        resizeMode="cover"
                      />
                      <View style={styles.allTripInfo}>
                        <Text style={[styles.allTripName, { color: colors.text }]} numberOfLines={1}>{trip.title}</Text>
                        <Text style={[styles.allTripMeta, { color: colors.textMid }]} numberOfLines={1}>
                          📍 {trip.destination} · {formatShortDate(trip.startDate, MONTHS_SHORT)}–{formatShortDate(trip.endDate, MONTHS_SHORT)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={colors.textLight} />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[styles.dashedCard, { borderColor: colors.bgDark, backgroundColor: colors.bg }]} onPress={handleCreateTrip} activeOpacity={0.8}>
                    <View style={[styles.dashedAddCircle, { backgroundColor: colors.terraLight }]}>
                      <Text style={[styles.dashedAddPlus, { color: colors.terra }]}>+</Text>
                    </View>
                    <Text style={[styles.dashedNewLabel, { color: colors.textLight }]}>{t("trips.newButton")}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── Mini cards horizontal scroll ─────────────────────────── */
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.miniScroll}
                >
                  {miniTrips.map((trip, idx) => (
                    <TouchableOpacity
                      key={trip.id ?? `mini-${idx}`}
                      style={[styles.miniCard, { backgroundColor: colors.bgMid }]}
                      onPress={() => handleTripPress(trip)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={{ uri: MINI_PHOTOS[idx % MINI_PHOTOS.length] }}
                        style={styles.miniPhoto}
                        resizeMode="cover"
                      />
                      <View style={styles.miniBottom}>
                        <Text style={[styles.miniName, { color: colors.text }]} numberOfLines={1}>{trip.title}</Text>
                        <Text style={[styles.miniDate, { color: colors.textLight }]}>{formatShortDate(trip.startDate, MONTHS_SHORT)}–{formatShortDate(trip.endDate, MONTHS_SHORT)}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Dashed "Nouveau" card */}
                  <TouchableOpacity style={[styles.dashedCard, { borderColor: colors.bgDark, backgroundColor: colors.bg }]} onPress={handleCreateTrip} activeOpacity={0.8}>
                    <View style={[styles.dashedAddCircle, { backgroundColor: colors.terraLight }]}>
                      <Text style={[styles.dashedAddPlus, { color: colors.terra }]}>+</Text>
                    </View>
                    <Text style={[styles.dashedNewLabel, { color: colors.textLight }]}>{t("trips.newButton")}</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, fontFamily: F.sans400 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  headerEyebrow: {
    fontSize: 14,
    fontFamily: F.sans400,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: F.sans700,
  },
  addTripBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C4714A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A35830",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  // ── Hero card ────────────────────────────────────────────────────────────────
  heroCard: {
    aspectRatio: 202 / 128,
    borderRadius: 18,
    marginHorizontal: 14,
    marginBottom: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroStatusBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroStatusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: F.sans500,
  },
  heroArrowBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBottom: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: F.sans700,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontFamily: F.sans400,
  },

  // ── Stats pills ──────────────────────────────────────────────────────────────
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 12,
  },
  pill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  pillValue: {
    fontSize: 28,
    fontFamily: F.sans700,
  },
  pillLabel: {
    fontSize: 13,
    fontFamily: F.sans400,
    marginTop: 3,
  },

  // ── Section header ───────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: F.sans700,
  },
  sectionLink: {
    fontSize: 13,
    fontFamily: F.sans500,
  },

  // ── Horizontal mini scroll ───────────────────────────────────────────────────
  miniScroll: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  // ── Mini trip card ───────────────────────────────────────────────────────────
  miniCard: {
    width: 190,
    height: 176,
    borderRadius: 16,
    overflow: "hidden",
  },
  miniPhoto: {
    width: 190,
    height: 112,
  },
  miniBottom: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
  },
  miniName: {
    fontSize: 16,
    fontFamily: F.sans600,
  },
  miniDate: {
    fontSize: 13,
    fontFamily: F.sans400,
    marginTop: 2,
  },

  // ── All trips vertical list ──────────────────────────────────────────────────
  allTripsContainer: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  allTripRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.card,
    overflow: "hidden",
    borderWidth: 1,
  },
  allTripPhoto: {
    width: 64,
    height: 64,
  },
  allTripInfo: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
  allTripName: {
    fontSize: 14,
    fontFamily: F.sans600,
  },
  allTripMeta: {
    fontSize: 12,
    fontFamily: F.sans400,
  },

  // ── Dashed "Nouveau" card ────────────────────────────────────────────────────
  dashedCard: {
    width: 190,
    height: 176,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dashedAddCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  dashedAddPlus: {
    fontSize: 36,
    lineHeight: 38,
    fontFamily: F.sans400,
  },
  dashedNewLabel: {
    fontSize: 14,
    fontFamily: F.sans500,
  },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 48,
    paddingTop: 60,
    paddingBottom: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: F.sans700,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: F.sans400,
  },
});

export default TripsScreen;
