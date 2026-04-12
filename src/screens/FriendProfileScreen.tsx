import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import { useFriendProfileActions } from "../hooks/useFriendProfileActions";
import TripSection from "../components/friendProfile/TripSection";
import ProfileSkeleton from "../components/friendProfile/ProfileSkeleton";
import ProfileActions from "../components/friendProfile/ProfileActions";

const FriendProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors }  = useTheme();
  const insets      = useSafeAreaInsets();
  const locale      = i18n.language === "fr" ? "fr-FR" : "en-US";

  const {
    profile, loading, sending,
    name, initials, avatarColor, isFriend,
    friendName,
    handleRemove, handleAddFriend,
    goToTrip, navigateInvite, goBack,
  } = useFriendProfileActions();

  const firstName = (profile?.name || friendName).split(" ")[0];

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cover ── */}
        <View style={styles.cover}>
          <LinearGradient
            colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.0)", "rgba(0,0,0,0.72)"]}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />

          <TouchableOpacity style={[styles.backBtn, { top: insets.top + 2 }]} onPress={goBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {!loading && (
            <View style={[styles.amiBadge, { top: insets.top + 2 }, !isFriend && styles.amiBadgeStranger]}>
              <Ionicons name={isFriend ? "checkmark" : "earth-outline"} size={15} color="#FFFFFF" />
              <Text style={styles.amiBadgeText}>{isFriend ? t("friendProfile.badgeFriend") : t("friendProfile.badgePublic")}</Text>
            </View>
          )}

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
                <View style={[styles.privateCard, { backgroundColor: colors.bgMid, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed" size={32} color={colors.textLight} />
                  <Text style={[styles.privateTitle, { color: colors.text }]}>{t("friendProfile.privateTitle")}</Text>
                  <Text style={[styles.privateSubtitle, { color: colors.textMid }]}>
                    {t("friendProfile.privateSubtitle", { name: firstName })}
                  </Text>
                </View>
                <ProfileActions
                  isFriend={isFriend}
                  sending={sending}
                  dangerBg={colors.dangerLight}
                  dangerColor={colors.danger}
                  onInvite={navigateInvite}
                  onRemove={handleRemove}
                  onAddFriend={handleAddFriend}
                />
              </>
            );

            const recentTrips = (profile?.sharedTrips || [])
              .filter((t: any) => new Date(t.endDate) < new Date())
              .slice(0, 8);
            const friendsTrips = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "friends");
            const publicTrips  = (profile?.sharedTrips || []).filter((t: any) => t.visibility === "public");

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

                {isFriend && (
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
                )}

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

                <ProfileActions
                  isFriend={isFriend}
                  sending={sending}
                  dangerBg={colors.dangerLight}
                  dangerColor={colors.danger}
                  onInvite={navigateInvite}
                  onRemove={handleRemove}
                  onAddFriend={handleAddFriend}
                />
              </>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: "#F5F0E8" },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  cover: {
    height: 300,
    backgroundColor: "#7A6A58",
    position: "relative",
    justifyContent: "flex-end",
  },
  backBtn: {
    position: "absolute",
    top: 16, left: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center", alignItems: "center",
  },
  amiBadge: {
    position: "absolute",
    top: 16, right: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(107,140,90,0.82)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  amiBadgeText:     { fontSize: 14, fontFamily: F.sans600, color: "#FFFFFF" },
  amiBadgeStranger: { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.35)" },
  identity: {
    flexDirection: "row", alignItems: "flex-end", gap: 14,
    paddingHorizontal: 18, paddingBottom: 18,
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#FFFFFF",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    overflow: "hidden",
  },
  avatarPhoto: { width: 70, height: 70, borderRadius: 35 },
  avatarText:  { fontSize: 22, fontFamily: F.sans700, color: "#FFFFFF" },
  coverName:   { fontSize: 26, fontFamily: F.sans700, color: "#FFFFFF" },
  coverSub:    { fontSize: 13, fontFamily: F.sans400, color: "rgba(255,255,255,0.7)", marginTop: 3 },

  body: { flex: 1, backgroundColor: "#F5F0E8" },

  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16, marginTop: 16, marginBottom: 22, gap: 8,
  },
  statBox: {
    flex: 1, borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 4, alignItems: "center",
  },
  statValue: { fontSize: 22, fontFamily: F.sans700, color: "#C4714A" },
  statLabel: { fontSize: 11, fontFamily: F.sans400, color: "#B0A090", textAlign: "center", marginTop: 4 },

  privateCard: {
    marginHorizontal: 14, marginTop: 24, marginBottom: 8,
    borderRadius: 16, paddingVertical: 36, paddingHorizontal: 24,
    alignItems: "center", gap: 10, borderWidth: 1,
  },
  privateTitle: { fontSize: 16, fontFamily: F.sans600, textAlign: "center" },
  privateSubtitle: {
    fontSize: 13, fontFamily: F.sans400, color: "#7A6A58",
    textAlign: "center", lineHeight: 19,
  },
});

export default FriendProfileScreen;
