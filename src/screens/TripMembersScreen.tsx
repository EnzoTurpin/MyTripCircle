import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Modal,
  Share,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";


const daysUntil = (date: Date) => {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ── Types ─────────────────────────────────────────────────────────────────────
type TripMembersScreenRouteProp = RouteProp<RootStackParamList, "TripMembers">;
type TripMembersScreenNavProp   = StackNavigationProp<RootStackParamList, "TripMembers">;

interface MemberInfo {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  status: "active" | "pending";
  invitedAt?: Date;
  invitationId?: string;
}

// ── Screen ────────────────────────────────────────────────────────────────────
const TripMembersScreen: React.FC = () => {
  const route      = useRoute<TripMembersScreenRouteProp>();
  const navigation = useNavigation<TripMembersScreenNavProp>();
  const { tripId } = route.params;
  const { user }   = useAuth();
  const { t }      = useTranslation();
  const { colors } = useTheme();

  const [tripTitle,      setTripTitle]      = useState<string>("");
  const [owner,          setOwner]          = useState<MemberInfo | null>(null);
  const [activeMembers,  setActiveMembers]  = useState<MemberInfo[]>([]);
  const [pendingMembers, setPendingMembers] = useState<MemberInfo[]>([]);
  const [inviteLink,     setInviteLink]     = useState<string>("");
  const [linkExpiry,     setLinkExpiry]     = useState<Date | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [actionLoading,  setActionLoading]  = useState(false);

  // Bottom sheet
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const sheetAnim    = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const isOwner = !!(user && owner?.userId === user.id);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tripData, sentInvs] = await Promise.all([
        ApiService.getTripById(tripId),
        user
          ? ApiService.getSentInvitations(user.id, "pending").catch(() => [] as any[])
          : Promise.resolve([] as any[]),
      ]);

      if (!tripData) return;
      setTripTitle(tripData.title || "");

      const collaboratorIds = (tripData.collaborators || []).map((c: any) => c.userId);
      const uniqueIds = [...new Set<string>([tripData.ownerId, ...collaboratorIds].filter(Boolean))];

      let usersMap: Record<string, any> = {};
      if (uniqueIds.length > 0) {
        try {
          const usersData = await ApiService.getUsersByIds(uniqueIds);
          usersData.forEach((u: any) => { usersMap[u._id || u.id] = u; });
        } catch { /* non-bloquant */ }
      }

      const ownerData = usersMap[tripData.ownerId];
      setOwner({
        userId: tripData.ownerId,
        name:   ownerData?.name || t("tripMembers.ownerFallback"),
        email:  ownerData?.email,
        avatar: ownerData?.avatar || null,
        role:   "owner",
        status: "active",
      });

      setActiveMembers((tripData.collaborators || []).map((c: any) => {
        const u = usersMap[c.userId] || {};
        return { userId: c.userId, name: u.name || c.userId, email: u.email, avatar: u.avatar || null, role: c.role || "viewer", status: "active" as const };
      }));

      const tripPending = (sentInvs as any[]).filter((inv: any) => inv.tripId === tripId);
      setPendingMembers(tripPending.map((inv: any) => ({
        userId:       inv._id || inv.id,
        name:         inv.inviteeEmail || inv.inviteePhone || t("tripMembers.guestFallback"),
        email:        inv.inviteeEmail,
        role:         "viewer" as const,
        status:       "pending" as const,
        invitedAt:    inv.createdAt ? new Date(inv.createdAt) : undefined,
        invitationId: inv._id || inv.id,
      })));

      try {
        const linkRes = await ApiService.getTripInvitationLink(tripId);
        setInviteLink(linkRes.link || "");
        const exp = new Date();
        exp.setDate(exp.getDate() + 7);
        setLinkExpiry(exp);
      } catch { /* non-bloquant */ }
    } catch (e) {
      console.error("TripMembersScreen loadData:", e);
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ── Bottom sheet ───────────────────────────────────────────────────────────
  const openSheet = (member: MemberInfo) => {
    setSelectedMember(member);
    Animated.parallel([
      Animated.spring(sheetAnim,    { toValue: 1, useNativeDriver: true, bounciness: 4 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetAnim,    { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setSelectedMember(null));
  };

  const sheetTranslate = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [340, 0] });

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleShareLink = async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: t("tripMembers.shareMsg", { link: inviteLink }),
        url: inviteLink,
      });
    } catch { /* user cancelled share */ }
  };

  const handleRenewLink = async () => {
    Alert.alert(
      t("tripMembers.renewTitle"),
      t("tripMembers.renewMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tripMembers.renewConfirm"),
          onPress: async () => {
            try {
              const res = await ApiService.getTripInvitationLink(tripId, true);
              setInviteLink(res.link || "");
              const exp = new Date();
              exp.setDate(exp.getDate() + 7);
              setLinkExpiry(exp);
              Alert.alert(t("tripMembers.renewSuccess"), t("tripMembers.renewSuccessMsg"));
            } catch {
              Alert.alert(t("common.error"), t("tripMembers.renewError"));
            }
          },
        },
      ]
    );
  };

  const handleCancelInvitation = (inv: MemberInfo) => {
    Alert.alert(
      t("tripMembers.cancelInviteTitle"),
      t("tripMembers.cancelInviteMsg", { name: inv.name }),
      [
        { text: t("tripMembers.cancelInviteNo"), style: "cancel" },
        {
          text: t("tripMembers.cancelInviteYes"), style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.cancelInvitation(inv.invitationId!);
              await loadData();
            } catch {
              Alert.alert(t("common.error"), t("tripMembers.cancelInviteError"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    closeSheet();
    Alert.alert(
      t("tripMembers.removeTitle"),
      t("tripMembers.removeMsg", { name: selectedMember.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tripMembers.removeConfirm"), style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.removeTripCollaborator(tripId, selectedMember.userId);
              await loadData();
            } catch {
              Alert.alert(t("common.error"), t("tripMembers.removeError"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTransferOwnership = () => {
    if (!selectedMember) return;
    closeSheet();
    Alert.alert(
      t("tripMembers.transferTitle"),
      t("tripMembers.transferMsg", { name: selectedMember.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tripMembers.transferConfirm"), style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.transferTripOwnership(tripId, selectedMember.userId);
              await loadData();
            } catch {
              Alert.alert(t("common.error"), t("tripMembers.transferError"));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewProfile = () => {
    if (!selectedMember) return;
    closeSheet();
    navigation.navigate("FriendProfile", { friendId: selectedMember.userId, friendName: selectedMember.name });
  };

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderAvatar = (name: string, size = 34, isOwnerAvatar = false, avatar?: string | null) => (
    <View style={[
      s.avatar,
      { width: size, height: size, backgroundColor: getAvatarColor(name) },
      isOwnerAvatar && { borderWidth: 2, borderColor: "#F5E5DC" },
    ]}>
      {avatar
        ? <Image source={{ uri: avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        : <Text style={[s.avatarTxt, { fontSize: size * 0.35 }]}>{getInitials(name)}</Text>
      }
    </View>
  );

  const renderMemberRow = (member: MemberInfo, isOwnerRow = false, tappable = true) => {
    const isSelected = selectedMember?.userId === member.userId;
    const isSelf     = member.userId === user?.id;
    const canTap     = tappable && isOwner && !isSelf;

    const inner = (
      <>
        {renderAvatar(member.name, 34, isOwnerRow, member.avatar)}
        <View style={{ flex: 1 }}>
          <Text style={[s.mn, { color: colors.text }]}>{member.name}</Text>
          <Text style={[s.ms, { color: colors.textLight }]}>
            {isOwnerRow
              ? (isSelf ? t("tripMembers.roleOrganizerSelf") : t("tripMembers.roleOrganizer"))
              : t("tripMembers.roleParticipant")}
          </Text>
        </View>
        {isSelf
          ? <View style={s.meTag}><Text style={s.meTagTxt}>{t("tripMembers.meLabel")}</Text></View>
          : canTap
            ? <Text style={s.rowChevron}>›</Text>
            : null
        }
      </>
    );

    if (canTap) {
      return (
        <TouchableOpacity
          key={member.userId}
          style={[s.mc, { backgroundColor: colors.surface, borderColor: colors.border }, isSelected && s.mcSelected]}
          onPress={() => openSheet(member)}
          activeOpacity={0.75}
        >
          {inner}
        </TouchableOpacity>
      );
    }

    return (
      <View key={member.userId} style={[s.mc, { backgroundColor: colors.surface, borderColor: colors.border }, isSelected && s.mcSelected]}>
        {inner}
      </View>
    );
  };

  const renderPendingRow = (inv: MemberInfo) => {
    const daysAgo = inv.invitedAt
      ? Math.floor((Date.now() - new Date(inv.invitedAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return (
      <View key={inv.userId} style={[s.mc, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.75 }]}>
        <View style={[s.avatar, { width: 34, height: 34, backgroundColor: colors.border }]}>
          <Text style={[s.avatarTxt, { fontSize: 12, color: colors.textMid }]}>{getInitials(inv.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.mn, { color: colors.text }]}>{inv.name}</Text>
          <Text style={[s.ms, { color: colors.textLight }]}>
            {t("tripMembers.pendingLabel")}{daysAgo != null ? ` ${t("tripMembers.pendingDaysAgo", { count: daysAgo })}` : ""}
          </Text>
        </View>
        {isOwner && (
          <TouchableOpacity onPress={() => handleCancelInvitation(inv)}>
            <Text style={s.cancelTxt}>{t("tripMembers.cancelInviteTitle")}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
        <View style={{ paddingHorizontal: 14, paddingTop: 16, gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <SkeletonBox width={36} height={36} borderRadius={18} />
            <SkeletonBox width={180} height={20} borderRadius={8} />
          </View>

          {/* Section label */}
          <SkeletonBox width={100} height={14} borderRadius={6} />

          {/* Member rows */}
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 }}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width="55%" height={14} borderRadius={6} />
                <SkeletonBox width="35%" height={12} borderRadius={5} />
              </View>
              <SkeletonBox width={28} height={28} borderRadius={14} />
            </View>
          ))}

          {/* Invite link block */}
          <View style={{ marginTop: 8, gap: 10 }}>
            <SkeletonBox width={140} height={14} borderRadius={6} />
            <SkeletonBox width="100%" height={48} borderRadius={12} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgLight} />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: colors.bgLight }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: colors.bgMid }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={16} color={colors.textMid} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[s.headerSub, { color: colors.textLight }]} numberOfLines={1}>{tripTitle}</Text>
          <Text style={[s.headerTitle, { color: colors.text }]}>{t("tripMembers.title")}</Text>
        </View>
        <TouchableOpacity style={s.inviteBtn} onPress={() => navigation.navigate("InviteFriends", { tripId })}>
          <Text style={s.inviteBtnTxt}>{t("tripMembers.invite")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C4714A"
            colors={["#C4714A"]}
          />
        }
      >
        {/* ── Lien d'invitation ── */}
        {inviteLink ? (
          <View style={[s.linkCard, { backgroundColor: colors.terraLight, borderColor: colors.border }]}>
            <Text style={[s.linkTitle, { color: colors.terra }]}>{t("tripMembers.linkTitle")}</Text>
            <View style={s.linkRow}>
              <Text style={[s.linkUrl, { color: colors.textMid, backgroundColor: colors.surface }]} numberOfLines={1}>{inviteLink}</Text>
              <TouchableOpacity style={s.copyBtn} onPress={handleShareLink}>
                <Text style={s.copyBtnTxt}>{t("tripMembers.linkShare")}</Text>
              </TouchableOpacity>
            </View>
            {linkExpiry && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                <Text style={[s.expiryTxt, { color: colors.terra }]}>{t("tripMembers.linkExpiry", { count: daysUntil(linkExpiry) })}</Text>
                <TouchableOpacity onPress={handleRenewLink}>
                  <Text style={[s.expiryTxt, { color: colors.terra, fontFamily: F.sans600, textDecorationLine: "underline" }]}>
                    {t("tripMembers.linkRenew")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}

        {/* ── Organisateur ── */}
        {owner && (
          <>
            <Text style={[s.sec, { color: colors.textLight }]}>{t("tripMembers.sectionOrganizer")}</Text>
            {renderMemberRow(owner, true, false)}
          </>
        )}

        {/* ── Membres actifs ── */}
        {activeMembers.length > 0 && (
          <>
            <Text style={[s.sec, { marginTop: 4, color: colors.textLight }]}>{t("tripMembers.sectionMembers", { count: activeMembers.length })}</Text>
            {activeMembers.map((m) => renderMemberRow(m))}
          </>
        )}

        {/* ── En attente ── */}
        {pendingMembers.length > 0 && (
          <>
            <Text style={[s.sec, { marginTop: 4, color: colors.textLight }]}>{t("tripMembers.sectionPending", { count: pendingMembers.length })}</Text>
            {pendingMembers.map((inv) => renderPendingRow(inv))}
          </>
        )}

        {/* ── CTA inviter depuis mes amis ── */}
        <TouchableOpacity
          style={[s.addBtn, { borderColor: colors.border, backgroundColor: colors.bg }]}
          onPress={() => navigation.navigate("InviteFriends", { tripId })}
        >
          <View style={s.addBtnIcon}>
            <Text style={{ fontSize: 15, color: "#C4714A" }}>+</Text>
          </View>
          <Text style={[s.addBtnTxt, { color: colors.textLight }]}>{t("tripMembers.inviteFromFriends")}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Overlay loading ── */}
      {actionLoading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#C4714A" />
        </View>
      )}

      {/* ── Bottom sheet ── */}
      {selectedMember && (
        <Modal transparent visible animationType="none" onRequestClose={closeSheet}>
          <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>

          <Animated.View style={[s.sheet, { backgroundColor: colors.bgLight, transform: [{ translateY: sheetTranslate }] }]}>
            {/* Handle */}
            <View style={[s.sheetHandle, { backgroundColor: colors.border }]} />

            {/* Identité */}
            <View style={[s.sheetId, { borderColor: colors.border }]}>
              {renderAvatar(selectedMember.name, 42)}
              <View style={{ flex: 1 }}>
                <Text style={[s.sheetName, { color: colors.text }]}>{selectedMember.name}</Text>
                {selectedMember.email ? (
                  <Text style={[s.sheetEmail, { color: colors.textMid }]} numberOfLines={1}>{selectedMember.email}</Text>
                ) : null}
                <Text style={[s.sheetRole, { color: colors.textLight }]}>{t("tripMembers.roleParticipant")}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={{ gap: 6 }}>
              <TouchableOpacity style={[s.sheetRow, { backgroundColor: colors.bgMid }]} onPress={handleViewProfile} activeOpacity={0.75}>
                <View style={[s.sheetIcon, { backgroundColor: "#E5EEF5" }]}>
                  <Text style={{ fontSize: 14 }}>👤</Text>
                </View>
                <Text style={[s.sheetRowLabel, { flex: 1, color: colors.text }]}>{t("tripMembers.viewProfile")}</Text>
                <Text style={{ fontSize: 15, color: colors.border, fontFamily: F.sans300 }}>›</Text>
              </TouchableOpacity>

              {isOwner && (
                <TouchableOpacity style={[s.sheetRow, { backgroundColor: colors.bgMid }]} onPress={handleTransferOwnership} activeOpacity={0.75}>
                  <View style={[s.sheetIcon, { backgroundColor: "#F5E5DC" }]}>
                    <Text style={{ fontSize: 14 }}>👑</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.sheetRowLabel, { color: colors.text }]}>{t("tripMembers.appointOrganizer")}</Text>
                    <Text style={[s.sheetRowSub, { color: colors.textLight }]}>{t("tripMembers.appointOrganizerSub")}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {isOwner && (
                <TouchableOpacity style={[s.sheetRow, s.sheetRowDanger]} onPress={handleRemoveMember} activeOpacity={0.75}>
                  <View style={[s.sheetIcon, { backgroundColor: "rgba(192,64,64,0.12)" }]}>
                    <Text style={{ fontSize: 14 }}>🚪</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.sheetRowLabel, { color: "#C04040" }]}>{t("tripMembers.removeFromTrip")}</Text>
                    <Text style={[s.sheetRowSub, { color: "#C04040", opacity: 0.7 }]}>
                      {t("tripMembers.removeFromTripSub")}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "#FDFAF5" },
  content: { paddingHorizontal: 13, paddingBottom: 40, paddingTop: 6 },

  // Header — compact, aligné sur la maquette
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8,
    backgroundColor: "#FDFAF5",
  },
  backBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#EDE5D8",
    alignItems: "center", justifyContent: "center",
  },
  headerSub:   { fontFamily: F.sans400, fontSize: 11, color: "#B0A090", textAlign: "center" },
  headerTitle: { fontFamily: F.sans700, fontSize: 16, color: "#2A2318", textAlign: "center" },
  inviteBtn: {
    backgroundColor: "#C4714A", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    shadowColor: "#C4714A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 3,
  },
  inviteBtnTxt: { fontFamily: F.sans600, fontSize: 11, color: "#FFFFFF" },

  // Lien d'invitation (fonds / bordures via colors dans le JSX)
  linkCard: {
    borderRadius: 11,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  linkTitle: { fontFamily: F.sans600, fontSize: 10, marginBottom: 5 },
  linkRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  linkUrl: {
    flex: 1, fontFamily: F.sans400, fontSize: 10,
    borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4,
  },
  copyBtn:    { backgroundColor: "#C4714A", borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  copyBtnTxt: { fontFamily: F.sans600, fontSize: 10, color: "#FFFFFF" },
  expiryTxt:  { fontFamily: F.sans400, fontSize: 9.5 },

  // Section label — identique .sec dans la maquette
  sec: {
    fontFamily: F.sans600,
    fontSize: 10, color: "#B0A090",
    textTransform: "uppercase", letterSpacing: 0.8,
    paddingTop: 2, paddingBottom: 5,
  },

  // Ligne membre — .mc dans la maquette
  mc: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 11, borderWidth: 1, borderColor: "#D8CCBA",
    paddingVertical: 8, paddingHorizontal: 10,
    marginBottom: 5,
  },
  avatar:    { borderRadius: 999, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarTxt: { fontFamily: F.sans600, color: "#FFFFFF" },
  mn: { fontFamily: F.sans600, fontSize: 13, color: "#2A2318" },
  ms: { fontFamily: F.sans400, fontSize: 11, color: "#B0A090", marginTop: 1 },

  // Badge "Moi"
  meTag:    { backgroundColor: "#F5E5DC", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  meTagTxt: { fontFamily: F.sans600, fontSize: 10, color: "#C4714A" },

  // Surbrillance ligne sélectionnée
  mcSelected: {
    backgroundColor: "rgba(196,113,74,0.06)",
    borderColor: "rgba(196,113,74,0.35)",
    borderWidth: 1.5,
  },

  // Chevron droit sur les lignes cliquables
  rowChevron: { fontSize: 18, color: "#D8CCBA", fontFamily: F.sans300, marginLeft: 2 },

  cancelTxt: { fontFamily: F.sans600, fontSize: 11, color: "#C04040" },

  // Bouton "Inviter depuis mes amis"
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    borderWidth: 1.5, borderStyle: "dashed", borderColor: "#D8CCBA",
    borderRadius: 11, paddingVertical: 9, paddingHorizontal: 10,
    backgroundColor: "#F5F0E8", marginTop: 6,
  },
  addBtnIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#F5E5DC", alignItems: "center", justifyContent: "center",
  },
  addBtnTxt: { fontFamily: F.sans400, fontSize: 12, color: "#B0A090" },

  // Overlay loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253,250,245,0.65)",
    alignItems: "center", justifyContent: "center",
  },

  // Bottom sheet
  backdrop: { backgroundColor: "rgba(42,35,24,0.45)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FDFAF5",
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 30,
    shadowColor: "#2A2318", shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18, shadowRadius: 28, elevation: 20,
  },
  sheetHandle: {
    width: 32, height: 3, borderRadius: 20,
    backgroundColor: "#D8CCBA", alignSelf: "center", marginBottom: 12,
  },
  sheetId: {
    flexDirection: "row", alignItems: "center", gap: 9,
    paddingBottom: 10, borderBottomWidth: 1, borderColor: "#D8CCBA", marginBottom: 10,
  },
  sheetName:  { fontFamily: F.sans600, fontSize: 13, color: "#2A2318" },
  sheetEmail: { fontFamily: F.sans400, fontSize: 10, color: "#7A6A58", marginTop: 1 },
  sheetRole:  { fontFamily: F.sans400, fontSize: 10, color: "#B0A090", marginTop: 1 },

  // Actions du bottom sheet
  sheetRow: {
    flexDirection: "row", alignItems: "center", gap: 9,
    backgroundColor: "#EDE5D8", borderRadius: 11,
    paddingVertical: 9, paddingHorizontal: 11,
  },
  sheetRowDanger: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1, borderColor: "rgba(192,64,64,0.15)",
  },
  sheetIcon:     { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sheetRowLabel: { fontFamily: F.sans600, fontSize: 12, color: "#2A2318" },
  sheetRowSub:   { fontFamily: F.sans400, fontSize: 9.5, color: "#B0A090", marginTop: 1 },
});

export default TripMembersScreen;
