import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";
import { useTripMembersData, MemberInfo } from "../hooks/useTripMembersData";
import BackButton from "../components/ui/BackButton";
import { useTripMembersActions } from "../hooks/useTripMembersActions";
import { useBottomSheet } from "../hooks/useBottomSheet";
import { s } from "./TripMembersScreen.styles";

type TripMembersScreenRouteProp = RouteProp<RootStackParamList, "TripMembers">;
type TripMembersScreenNavProp   = StackNavigationProp<RootStackParamList, "TripMembers">;

const daysUntil = (date: Date) => {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const TripMembersScreen: React.FC = () => {
  const route      = useRoute<TripMembersScreenRouteProp>();
  const navigation = useNavigation<TripMembersScreenNavProp>();
  const { tripId } = route.params;
  const { user }   = useAuth();
  const { t }      = useTranslation();
  const { colors } = useTheme();

  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);

  const {
    tripTitle, owner, activeMembers, pendingMembers,
    inviteLink, setInviteLink, linkExpiry, setLinkExpiry,
    loading, refreshing, loadData, onRefresh,
  } = useTripMembersData(tripId, user?.id);

  const sheet = useBottomSheet({ outputRange: [340, 0] });

  const { actionLoading, handleShareLink, handleRenewLink, handleCancelInvitation, handleRemoveMember, handleTransferOwnership, handleViewProfile } =
    useTripMembersActions(tripId, loadData);

  const isOwner = !!(user && owner?.userId === user.id);

  const openSheet = (member: MemberInfo) => {
    setSelectedMember(member);
    sheet.open();
  };

  const closeSheet = () => {
    sheet.close(() => setSelectedMember(null));
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

    const organizerRole = isSelf ? t("tripMembers.roleOrganizerSelf") : t("tripMembers.roleOrganizer");
    const roleText = isOwnerRow ? organizerRole : t("tripMembers.roleParticipant");

    let trailingEl: React.ReactNode = null;
    if (isSelf) {
      trailingEl = <View style={s.meTag}><Text style={s.meTagTxt}>{t("tripMembers.meLabel")}</Text></View>;
    } else if (canTap) {
      trailingEl = <Text style={s.rowChevron}>›</Text>;
    }

    const inner = (
      <>
        {renderAvatar(member.name, 34, isOwnerRow, member.avatar)}
        <View style={{ flex: 1 }}>
          <Text style={[s.mn, { color: colors.text }]}>{member.name}</Text>
          <Text style={[s.ms, { color: colors.textLight }]}>{roleText}</Text>
        </View>
        {trailingEl}
      </>
    );

    const rowStyle = [s.mc, { backgroundColor: colors.surface, borderColor: colors.border }, isSelected && s.mcSelected];

    if (canTap) {
      return (
        <TouchableOpacity key={member.userId} style={rowStyle} onPress={() => openSheet(member)} activeOpacity={0.75}>
          {inner}
        </TouchableOpacity>
      );
    }
    return <View key={member.userId} style={rowStyle}>{inner}</View>;
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
            {t("tripMembers.pendingLabel")}{daysAgo == null ? "" : ` ${t("tripMembers.pendingDaysAgo", { count: daysAgo })}`}
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

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
        <View style={{ paddingHorizontal: 14, paddingTop: 16, gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <SkeletonBox width={36} height={36} borderRadius={18} />
            <SkeletonBox width={180} height={20} borderRadius={8} />
          </View>
          <SkeletonBox width={100} height={14} borderRadius={6} />
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
          <View style={{ marginTop: 8, gap: 10 }}>
            <SkeletonBox width={140} height={14} borderRadius={6} />
            <SkeletonBox width="100%" height={48} borderRadius={12} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgLight} />

      <View style={[s.header, { backgroundColor: colors.bgLight }]}>
        <BackButton onPress={() => navigation.goBack()} />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C4714A" colors={["#C4714A"]} />
        }
      >
        {inviteLink ? (
          <View style={[s.linkCard, { backgroundColor: colors.terraLight, borderColor: colors.border }]}>
            <Text style={[s.linkTitle, { color: colors.terra }]}>{t("tripMembers.linkTitle")}</Text>
            <View style={s.linkRow}>
              <Text style={[s.linkUrl, { color: colors.textMid, backgroundColor: colors.surface }]} numberOfLines={1}>{inviteLink}</Text>
              <TouchableOpacity style={s.copyBtn} onPress={() => handleShareLink(inviteLink)}>
                <Text style={s.copyBtnTxt}>{t("tripMembers.linkShare")}</Text>
              </TouchableOpacity>
            </View>
            {linkExpiry && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                <Text style={[s.expiryTxt, { color: colors.terra }]}>{t("tripMembers.linkExpiry", { count: daysUntil(linkExpiry) })}</Text>
                <TouchableOpacity onPress={() => handleRenewLink({ setInviteLink, setLinkExpiry })}>
                  <Text style={[s.expiryTxt, { color: colors.terra, fontFamily: F.sans600, textDecorationLine: "underline" }]}>
                    {t("tripMembers.linkRenew")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}

        {owner && (
          <>
            <Text style={[s.sec, { color: colors.textLight }]}>{t("tripMembers.sectionOrganizer")}</Text>
            {renderMemberRow(owner, true, false)}
          </>
        )}

        {activeMembers.length > 0 && (
          <>
            <Text style={[s.sec, { marginTop: 4, color: colors.textLight }]}>{t("tripMembers.sectionMembers", { count: activeMembers.length })}</Text>
            {activeMembers.map((m) => renderMemberRow(m))}
          </>
        )}

        {pendingMembers.length > 0 && (
          <>
            <Text style={[s.sec, { marginTop: 4, color: colors.textLight }]}>{t("tripMembers.sectionPending", { count: pendingMembers.length })}</Text>
            {pendingMembers.map((inv) => renderPendingRow(inv))}
          </>
        )}

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

      {actionLoading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#C4714A" />
        </View>
      )}

      {selectedMember && (
        <Modal transparent visible animationType="none" onRequestClose={closeSheet}>
          <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, { opacity: sheet.backdropAnim }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>

          <Animated.View style={[s.sheet, { backgroundColor: colors.bgLight, transform: [{ translateY: sheet.translateY }] }]}>
            <View style={[s.sheetHandle, { backgroundColor: colors.border }]} />

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

            <View style={{ gap: 6 }}>
              <TouchableOpacity style={[s.sheetRow, { backgroundColor: colors.bgMid }]} onPress={() => handleViewProfile(selectedMember, closeSheet)} activeOpacity={0.75}>
                <View style={[s.sheetIcon, { backgroundColor: "#E5EEF5" }]}>
                  <Text style={{ fontSize: 14 }}>👤</Text>
                </View>
                <Text style={[s.sheetRowLabel, { flex: 1, color: colors.text }]}>{t("tripMembers.viewProfile")}</Text>
                <Text style={{ fontSize: 15, color: colors.border, fontFamily: F.sans300 }}>›</Text>
              </TouchableOpacity>

              {isOwner && (
                <TouchableOpacity style={[s.sheetRow, { backgroundColor: colors.bgMid }]} onPress={() => handleTransferOwnership(selectedMember, closeSheet)} activeOpacity={0.75}>
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
                <TouchableOpacity style={[s.sheetRow, s.sheetRowDanger]} onPress={() => handleRemoveMember(selectedMember, closeSheet)} activeOpacity={0.75}>
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

export default TripMembersScreen;
