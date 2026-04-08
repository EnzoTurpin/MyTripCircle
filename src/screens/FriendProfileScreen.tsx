import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ApiService } from "../services/ApiService";
import { useFriends } from "../contexts/FriendsContext";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { parseApiError } from "../utils/i18n";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";


const formatDateRange = (start: string | Date, end: string | Date, locale: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${s.toLocaleDateString(locale, opts)} – ${e.toLocaleDateString(locale, opts)}`;
};

// ── TripSquare — carré photo avec gradient (maquette) ─────────────────────────
const TripSquare: React.FC<{ trip: any; onPress: () => void }> = ({ trip, onPress }) => (
  <TouchableOpacity style={sqStyles.wrap} onPress={onPress} activeOpacity={0.85}>
    {trip.coverImage ? (
      <Image source={{ uri: trip.coverImage }} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
    ) : (
      <View style={[StyleSheet.absoluteFill as any, { backgroundColor: "#7A6A58" }]} />
    )}
    <LinearGradient
      colors={["transparent", "rgba(0,0,0,0.68)"]}
      locations={[0.4, 1]}
      style={StyleSheet.absoluteFill as any}
    />
    <View style={sqStyles.bottom}>
      <Text style={sqStyles.dest} numberOfLines={1}>{trip.destination || trip.title}</Text>
    </View>
  </TouchableOpacity>
);

const sqStyles = StyleSheet.create({
  wrap: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
    justifyContent: "flex-end",
  },
  bottom: { padding: 7 },
  dest: { fontSize: 11, fontFamily: F.sans600, color: "#FFFFFF" },
});


const tcStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8CCBA",
    borderRadius: 10,
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 8,
  },
  thumb: { width: 44, height: 44, borderRadius: 8, flexShrink: 0 },
  thumbPlaceholder: { backgroundColor: "#EDE5D8", justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  title: { fontSize: 14, fontFamily: F.sans600, color: "#2A2318" },
  dates: { fontSize: 11, fontFamily: F.sans400, color: "#B0A090", marginTop: 3 },
  pill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 11, fontFamily: F.sans600 },
  visBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  visBadgePublic: { backgroundColor: "#DCF0F5" },
  visBadgeFriends: { backgroundColor: "#E2EDD9" },
  visText: { fontSize: 10, fontFamily: F.sans600 },
});

// ── Screen ─────────────────────────────────────────────────────────────────────
const FriendProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { friendId, friendName } = route.params as { friendId: string; friendName: string };

  const { removeFriend, sendFriendRequest } = useFriends();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const locale = i18n.language === "fr" ? "fr-FR" : "en-US";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadProfile = () => {
    setLoading(true);
    ApiService.getFriendProfile(friendId)
      .then(setProfile)
      .catch(() => Alert.alert(t("common.error"), t("friendProfile.loadError")))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProfile(); }, [friendId]);

  const goToTrip = (tripId: string) => navigation.navigate("TripPublicView", { tripId });

  const handleRemove = () => {
    Alert.alert(
      t("friendProfile.removeTitle"),
      t("friendProfile.removeMsg", { name: profile?.name || friendName }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("friendProfile.removeConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriend(friendId);
              navigation.goBack();
            } catch {
              Alert.alert(t("common.error"), t("friendProfile.removeError"));
            }
          },
        },
      ]
    );
  };

  const handleAddFriend = async () => {
    try {
      setSending(true);
      const res = await sendFriendRequest({ recipientId: friendId });
      if (res?.autoAccepted) {
        Alert.alert(t("friends.success"), t("friendProfile.successNowFriends"), [{ text: t("common.ok"), onPress: loadProfile }]);
      } else {
        Alert.alert(t("friends.success"), t("friendProfile.successRequestSent"));
      }
    } catch (err: unknown) {
      Alert.alert(
        t("common.error"),
        parseApiError(err) || t("friendProfile.errorDefault"),
      );
    } finally {
      setSending(false);
    }
  };

  const name = profile?.name || friendName;
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);
  const isFriend = profile?.isFriend ?? false;

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>

        {/* ── Cover ── */}
        <View style={styles.cover}>
          <LinearGradient
            colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.0)", "rgba(0,0,0,0.72)"]}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Bouton retour */}
          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 2 }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Badge relation */}
          {!loading && (
            <View style={[styles.amiBadge, { top: insets.top + 2 }, !isFriend && styles.amiBadgeStranger]}>
              <Ionicons name={isFriend ? "checkmark" : "earth-outline"} size={15} color="#FFFFFF" />
              <Text style={styles.amiBadgeText}>{isFriend ? t("friendProfile.badgeFriend") : t("friendProfile.badgePublic")}</Text>
            </View>
          )}

          {/* Identité */}
          <View style={styles.identity}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              {profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatarPhoto} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View>
              <Text style={styles.coverName}>{name}</Text>
              {isFriend && profile?.friendSince && (
                <Text style={styles.coverSub}>
                  {t("friendProfile.friendSince", {
                    date: new Date(profile.friendSince).toLocaleDateString(locale, { month: "short", year: "numeric" }),
                  })}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Contenu ── */}
        <View style={[styles.body, { backgroundColor: colors.bg }]}>

          {(() => {
            if (loading) return (
              <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 20 }}>
                {/* Avatar + name */}
                <View style={{ alignItems: "center", gap: 12 }}>
                  <SkeletonBox width={88} height={88} borderRadius={44} />
                  <SkeletonBox width={160} height={20} borderRadius={8} />
                  <SkeletonBox width={100} height={14} borderRadius={6} />
                </View>

                {/* Stats row */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <SkeletonBox key={i} height={64} borderRadius={12} style={{ flex: 1 }} />
                  ))}
                </View>

                {/* Trip grid */}
                <SkeletonBox width={120} height={16} borderRadius={6} />
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <SkeletonBox key={i} width={100} height={100} borderRadius={12} />
                  ))}
                </View>

                {/* Action buttons */}
                <SkeletonBox width="100%" height={48} borderRadius={12} />
              </View>
            );
            if (profile?.isPublicProfile === false) return (
            <>
              {/* ── Profil privé ── */}
              <View style={[styles.privateCard, { backgroundColor: colors.bgMid, borderColor: colors.border }]}>
                <Ionicons name="lock-closed" size={32} color={colors.textLight} />
                <Text style={[styles.privateTitle, { color: colors.text }]}>{t("friendProfile.privateTitle")}</Text>
                <Text style={[styles.privateSubtitle, { color: colors.textMid }]}>{t("friendProfile.privateSubtitle", { name: (profile?.name || friendName).split(" ")[0] })}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {isFriend ? (
                  <>
                    <TouchableOpacity
                      style={styles.inviteBtn}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate("InviteFriends", { preselectedFriend: friendId })}
                    >
                      <Ionicons name="airplane" size={16} color="#FFFFFF" />
                      <Text style={styles.inviteBtnText}>{t("friendProfile.inviteToTrip")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.removeBtn, { backgroundColor: colors.dangerLight }]} onPress={handleRemove} activeOpacity={0.8}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.inviteBtn, sending && { opacity: 0.6 }]}
                    activeOpacity={0.85}
                    onPress={handleAddFriend}
                    disabled={sending}
                  >
                    {sending
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
                      : <Ionicons name="person-add" size={16} color="#FFFFFF" />
                    }
                    <Text style={styles.inviteBtnText}>{t("friendProfile.addFriend")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
            );
            return (
            <>
              {/* Stats */}
              <View style={styles.statsRow}>
                {[
                  { value: profile?.stats?.totalTrips ?? 0,    label: t("friendProfile.statTrips") },
                  { value: profile?.stats?.countries ?? 0,     label: t("friendProfile.statCountries") },
                  { value: profile?.stats?.commonFriends ?? 0, label: t("friendProfile.statCommonFriends") },
                  { value: profile?.stats?.totalBookings ?? 0, label: t("friendProfile.statBookings") },
                ].map((s) => (
                  <View key={s.label} style={[styles.statBox, { backgroundColor: colors.bgMid }]}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.textLight }]} numberOfLines={1} adjustsFontSizeToFit>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* ── 1. Voyages en commun — uniquement si ami ── */}
              {isFriend && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t("friendProfile.sectionCommonTrips")}</Text>
                  {profile?.commonTrips?.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.squaresRow}>
                      {profile.commonTrips.map((trip: any) => (
                        <TripSquare key={trip._id ?? trip.id} trip={trip} onPress={() => goToTrip(trip._id ?? trip.id)} />
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={[styles.emptyCard, { backgroundColor: colors.bgMid }]}>
                      <Ionicons name="airplane-outline" size={26} color={colors.textLight} />
                      <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("friendProfile.emptyCommonTrips")}</Text>
                    </View>
                  )}
                </>
              )}

              {/* ── 2. Voyages récents (passés) ── */}
              {(() => {
                const now = new Date();
                const firstName = (profile?.name || friendName).split(" ")[0];
                const recentTrips = (profile?.sharedTrips || [])
                  .filter((t: any) => new Date(t.endDate) < now)
                  .slice(0, 8);
                return (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: isFriend ? 20 : 0 }]}>{t("friendProfile.sectionRecentTrips")}</Text>
                    {recentTrips.length ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.squaresRow}>
                        {recentTrips.map((trip: any) => (
                          <TripSquare key={trip._id ?? trip.id} trip={trip} onPress={() => goToTrip(trip._id ?? trip.id)} />
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={[styles.emptyCard, { backgroundColor: colors.bgMid }]}>
                        <Ionicons name="earth-outline" size={26} color={colors.textLight} />
                        <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("friendProfile.emptyRecentTrips", { name: firstName })}</Text>
                      </View>
                    )}
                  </>
                );
              })()}

              {/* ── 3. Partagés avec les amis — uniquement si ami ── */}
              {isFriend && (() => {
                const friendsTrips = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "friends");
                return (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t("friendProfile.sectionFriendsTrips")}</Text>
                    {friendsTrips.length ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.squaresRow}>
                        {friendsTrips.map((trip: any) => (
                          <TripSquare key={trip._id ?? trip.id} trip={trip} onPress={() => goToTrip(trip._id ?? trip.id)} />
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={[styles.emptyCard, { backgroundColor: colors.bgMid }]}>
                        <Ionicons name="people-outline" size={26} color={colors.textLight} />
                        <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("friendProfile.emptyFriendsTrips")}</Text>
                      </View>
                    )}
                  </>
                );
              })()}

              {/* ── 4. Voyages publics ── */}
              {(() => {
                const firstName = (profile?.name || friendName).split(" ")[0];
                const publicTrips = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "public");
                return (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: 20 }]}>{t("friendProfile.sectionPublicTrips")}</Text>
                    {publicTrips.length ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.squaresRow}>
                        {publicTrips.map((trip: any) => (
                          <TripSquare key={trip._id ?? trip.id} trip={trip} onPress={() => goToTrip(trip._id ?? trip.id)} />
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={[styles.emptyCard, { backgroundColor: colors.bgMid }]}>
                        <Ionicons name="earth-outline" size={26} color={colors.textLight} />
                        <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("friendProfile.emptyPublicTrips", { name: firstName })}</Text>
                      </View>
                    )}
                  </>
                );
              })()}

              {/* Actions */}
              <View style={styles.actions}>
                {isFriend ? (
                  <>
                    <TouchableOpacity
                      style={styles.inviteBtn}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate("InviteFriends", { preselectedFriend: friendId })}
                    >
                      <Ionicons name="airplane" size={16} color="#FFFFFF" />
                      <Text style={styles.inviteBtnText}>{t("friendProfile.inviteToTrip")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.removeBtn, { backgroundColor: colors.dangerLight }]} onPress={handleRemove} activeOpacity={0.8}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.inviteBtn, sending && { opacity: 0.6 }]}
                    activeOpacity={0.85}
                    onPress={handleAddFriend}
                    disabled={sending}
                  >
                    {sending
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
                      : <Ionicons name="person-add" size={16} color="#FFFFFF" />
                    }
                    <Text style={styles.inviteBtnText}>{t("friendProfile.addFriend")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F0E8" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Cover — photo immersive avec gradient fort en bas
  cover: {
    height: 300,
    backgroundColor: "#7A6A58",
    position: "relative",
    justifyContent: "flex-end",
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Badge verre (ami vert / inconnu blanc translucide)
  amiBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(107,140,90,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  amiBadgeText: { fontSize: 14, fontFamily: F.sans600, color: "#FFFFFF" },
  amiBadgeStranger: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.35)",
  },
  identity: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  avatarPhoto: { width: 70, height: 70, borderRadius: 35 },
  avatarText: { fontSize: 22, fontFamily: F.sans700, color: "#FFFFFF" },
  coverName: { fontSize: 26, fontFamily: F.sans700, color: "#FFFFFF" },
  coverSub: { fontSize: 13, fontFamily: F.sans400, color: "rgba(255,255,255,0.7)", marginTop: 3 },

  // Body
  body: { flex: 1, backgroundColor: "#F5F0E8" },
  loaderWrap: { paddingVertical: 60, alignItems: "center" },

  // Stats — fond sandMid comme la maquette (pas blanc)
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 22,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#EDE5D8",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  statBoxMid: {},
  statValue: { fontSize: 22, fontFamily: F.sans700, color: "#C4714A" },
  statLabel: { fontSize: 11, fontFamily: F.sans400, color: "#B0A090", textAlign: "center", marginTop: 4 },

  // Squares horizontal row
  squaresRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
    flexDirection: "row",
  },

  // Section label
  sectionLabel: {
    fontSize: 10,
    fontFamily: F.sans600,
    color: "#B0A090",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginHorizontal: 14,
    marginBottom: 8,
  },

  // Private profile
  privateCard: {
    marginHorizontal: 14,
    marginTop: 24,
    marginBottom: 8,
    backgroundColor: "#EDE5D8",
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#D8CCBA",
  },
  privateTitle: {
    fontSize: 16,
    fontFamily: F.sans600,
    color: "#2A2318",
    textAlign: "center",
  },
  privateSubtitle: {
    fontSize: 13,
    fontFamily: F.sans400,
    color: "#7A6A58",
    textAlign: "center",
    lineHeight: 19,
  },

  // Empty
  emptyCard: {
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#EDE5D8",
    borderRadius: 10,
    paddingVertical: 22,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 12, fontFamily: F.sans400, color: "#B0A090", textAlign: "center", paddingHorizontal: 16 },

  // Actions
  actions: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 14,
    marginTop: 18,
  },
  inviteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C4714A",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#C4714A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  inviteBtnText: { fontSize: 14, fontFamily: F.sans600, color: "#FFFFFF" },
  removeBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FDEAEA",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FriendProfileScreen;
