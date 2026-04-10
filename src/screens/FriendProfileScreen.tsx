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
import TripSquare from "../components/friendProfile/TripSquare";
import TripSection from "../components/friendProfile/TripSection";
import ProfileSkeleton from "../components/friendProfile/ProfileSkeleton";

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
            if (loading) return <ProfileSkeleton />;
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
                <TripSection
                  title={t("friendProfile.sectionCommonTrips")}
                  marginTop={0}
                  trips={profile?.commonTrips ?? []}
                  emptyIcon="airplane-outline"
                  emptyText={t("friendProfile.emptyCommonTrips")}
                  bgMid={colors.bgMid}
                  textLight={colors.textLight}
                  onPress={goToTrip}
                />
              )}

              {/* ── 2. Voyages récents (passés) ── */}
              {(() => {
                const now = new Date();
                const firstName = (profile?.name || friendName).split(" ")[0];
                const recentTrips = (profile?.sharedTrips || [])
                  .filter((t: any) => new Date(t.endDate) < now)
                  .slice(0, 8);
                return (
                  <TripSection
                    title={t("friendProfile.sectionRecentTrips")}
                    marginTop={isFriend ? 20 : 0}
                    trips={recentTrips}
                    emptyIcon="earth-outline"
                    emptyText={t("friendProfile.emptyRecentTrips", { name: firstName })}
                    bgMid={colors.bgMid}
                    textLight={colors.textLight}
                    onPress={goToTrip}
                  />
                );
              })()}

              {/* ── 3. Partagés avec les amis — uniquement si ami ── */}
              {isFriend && (() => {
                const friendsTrips = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "friends");
                return (
                  <TripSection
                    title={t("friendProfile.sectionFriendsTrips")}
                    marginTop={20}
                    trips={friendsTrips}
                    emptyIcon="people-outline"
                    emptyText={t("friendProfile.emptyFriendsTrips")}
                    bgMid={colors.bgMid}
                    textLight={colors.textLight}
                    onPress={goToTrip}
                  />
                );
              })()}

              {/* ── 4. Voyages publics ── */}
              {(() => {
                const firstName = (profile?.name || friendName).split(" ")[0];
                const publicTrips = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "public");
                return (
                  <TripSection
                    title={t("friendProfile.sectionPublicTrips")}
                    marginTop={20}
                    trips={publicTrips}
                    emptyIcon="earth-outline"
                    emptyText={t("friendProfile.emptyPublicTrips", { name: firstName })}
                    bgMid={colors.bgMid}
                    textLight={colors.textLight}
                    onPress={goToTrip}
                  />
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
  statValue: { fontSize: 22, fontFamily: F.sans700, color: "#C4714A" },
  statLabel: { fontSize: 11, fontFamily: F.sans400, color: "#B0A090", textAlign: "center", marginTop: 4 },

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
