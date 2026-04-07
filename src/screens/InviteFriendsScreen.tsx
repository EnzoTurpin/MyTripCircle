import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";
import { useInviteFriends } from "../hooks/useInviteFriends";
import MemberRow from "../components/inviteFriends/MemberRow";
import PendingRow from "../components/inviteFriends/PendingRow";
import MemberActionSheet from "../components/inviteFriends/MemberActionSheet";
import InvitePanelSheet from "../components/inviteFriends/InvitePanelSheet";
import { F } from "../theme/fonts";

const daysUntil = (date: Date) =>
  Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));

type ScreenRouteProp = RouteProp<RootStackParamList, "InviteFriends">;
type ScreenNavProp = StackNavigationProp<RootStackParamList, "InviteFriends">;

const InviteFriendsScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation<ScreenNavProp>();
  const { tripId } = route.params;
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    trip,
    owner,
    activeMembers,
    pendingInvitations,
    friends,
    friendsToInvite,
    alreadyMembers,
    invitationLink,
    linkExpiry,
    loading,
    actionLoading,
    showInvitePanel,
    invitedFriends,
    emailInput,
    setEmailInput,
    sendingInvitations,
    inviteCount,
    selectedMember,
    isOwner,
    backdropAnim,
    sheetY,
    inviteAnim,
    inviteBackdrop,
    inviteY,
    openSheet,
    closeSheet,
    openInvitePanel,
    closeInvitePanel,
    handleShareLink,
    handleRenewLink,
    handleCancelInvitation,
    handleRemoveMember,
    handleTransferOwnership,
    handleViewProfile,
    toggleFriend,
    handleSendInvitations,
  } = useInviteFriends(tripId);

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
        <View style={{ paddingHorizontal: 14, paddingTop: 16, gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <SkeletonBox width={36} height={36} borderRadius={18} />
            <SkeletonBox width={180} height={20} borderRadius={8} />
          </View>

          {/* Trip info card */}
          <SkeletonBox width="100%" height={80} borderRadius={12} />

          {/* Invite link */}
          <SkeletonBox width="100%" height={52} borderRadius={12} />

          {/* Section label */}
          <SkeletonBox width={120} height={14} borderRadius={6} />

          {/* Member rows */}
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 2 }}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width="55%" height={14} borderRadius={6} />
                <SkeletonBox width="35%" height={12} borderRadius={5} />
              </View>
              <SkeletonBox width={72} height={30} borderRadius={15} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgLight }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgLight} />

      <View style={[s.header, { backgroundColor: colors.bgLight }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: colors.bgMid }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textMid} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          {trip && (
            <Text style={[s.headerSub, { color: colors.textLight }]} numberOfLines={1}>
              {trip.title}
            </Text>
          )}
          <Text style={[s.headerTitle, { color: colors.text }]}>
            {t("inviteFriends.manageMembers")}
          </Text>
        </View>
        <TouchableOpacity style={s.inviteBtn} onPress={openInvitePanel}>
          <Text style={s.inviteBtnTxt}>{t("inviteFriends.inviteBtn")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.linkCard, { backgroundColor: colors.terraLight, borderColor: colors.border }]}>
          <Text style={[s.linkTitle, { color: colors.terra }]}>
            {t("inviteFriends.linkTitle")}
          </Text>
          <View style={s.linkRow}>
            <Text
              style={[s.linkUrl, { color: colors.textMid, backgroundColor: colors.surface }]}
              numberOfLines={1}
            >
              {invitationLink || t("inviteFriends.linkGenerating")}
            </Text>
            <TouchableOpacity
              style={s.copyBtn}
              onPress={handleShareLink}
              disabled={!invitationLink}
            >
              <Text style={s.copyBtnTxt}>{t("inviteFriends.linkShare")}</Text>
            </TouchableOpacity>
          </View>
          {linkExpiry && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
              <Text style={[s.expiryTxt, { color: colors.terra }]}>
                {t("inviteFriends.linkExpiry", { count: daysUntil(linkExpiry) })}
              </Text>
              <TouchableOpacity onPress={handleRenewLink}>
                <Text
                  style={[
                    s.expiryTxt,
                    { color: colors.terra, fontFamily: F.sans600, textDecorationLine: "underline" },
                  ]}
                >
                  {t("inviteFriends.linkRenew")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {owner && (
          <>
            <Text style={[s.sec, { color: colors.textMid }]}>
              {t("inviteFriends.sectionOrganizer")}
            </Text>
            <MemberRow member={owner} isOwner={isOwner} onPress={openSheet} />
          </>
        )}

        {activeMembers.length > 0 && (
          <>
            <Text style={[s.sec, { marginTop: 4, color: colors.textMid }]}>
              {t("inviteFriends.sectionMembers", { count: activeMembers.length })}
            </Text>
            {activeMembers.map((m) => (
              <MemberRow key={m.userId} member={m} isOwner={isOwner} onPress={openSheet} />
            ))}
          </>
        )}

        {pendingInvitations.length > 0 && (
          <>
            <Text style={[s.sec, { marginTop: 4, color: colors.textMid }]}>
              {t("inviteFriends.sectionPending", { count: pendingInvitations.length })}
            </Text>
            {pendingInvitations.map((inv) => (
              <PendingRow
                key={inv._id || inv.id}
                invitation={inv}
                friends={friends}
                isOwner={isOwner}
                onCancel={handleCancelInvitation}
              />
            ))}
          </>
        )}

        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
          onPress={openInvitePanel}
        >
          <View style={s.addBtnIcon}>
            <Text style={{ fontSize: 22, color: "#C4714A" }}>+</Text>
          </View>
          <Text style={[s.addBtnTxt, { color: colors.textLight }]}>
            {t("inviteFriends.inviteFromFriends")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {actionLoading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#C4714A" />
        </View>
      )}

      {selectedMember && (
        <MemberActionSheet
          member={selectedMember}
          isOwner={isOwner}
          backdropAnim={backdropAnim}
          sheetY={sheetY}
          onClose={closeSheet}
          onViewProfile={handleViewProfile}
          onTransfer={handleTransferOwnership}
          onRemove={handleRemoveMember}
        />
      )}

      {showInvitePanel && (
        <InvitePanelSheet
          inviteAnim={inviteAnim}
          inviteBackdrop={inviteBackdrop}
          inviteY={inviteY}
          friendsToInvite={friendsToInvite}
          alreadyMembers={alreadyMembers}
          invitedFriends={invitedFriends}
          emailInput={emailInput}
          sendingInvitations={sendingInvitations}
          inviteCount={inviteCount}
          onClose={closeInvitePanel}
          onToggleFriend={toggleFriend}
          onChangeEmail={setEmailInput}
          onSend={handleSendInvitations}
        />
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 10 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
  backBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  headerSub: { fontFamily: F.sans400, fontSize: 14, textAlign: "center" },
  headerTitle: { fontFamily: F.sans700, fontSize: 16, textAlign: "center" },
  inviteBtn: { backgroundColor: "#C4714A", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, shadowColor: "#C4714A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 3 },
  inviteBtnTxt: { fontFamily: F.sans600, fontSize: 15, color: "#FFFFFF" },
  linkCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 18 },
  linkTitle: { fontFamily: F.sans600, fontSize: 14, marginBottom: 10 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  linkUrl: { flex: 1, fontFamily: F.sans400, fontSize: 13, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  copyBtn: { backgroundColor: "#C4714A", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  copyBtnTxt: { fontFamily: F.sans600, fontSize: 13, color: "#FFFFFF" },
  expiryTxt: { fontFamily: F.sans400, fontSize: 12 },
  sec: { fontFamily: F.sans700, fontSize: 16, textTransform: "uppercase", letterSpacing: 1.2, paddingTop: 10, paddingBottom: 10 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 2, borderStyle: "dashed", borderRadius: 18, paddingVertical: 16, paddingHorizontal: 16, marginTop: 8 },
  addBtnIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F5E5DC", alignItems: "center", justifyContent: "center" },
  addBtnTxt: { fontFamily: F.sans400, fontSize: 15 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(253,250,245,0.65)", alignItems: "center", justifyContent: "center" },
});

export default InviteFriendsScreen;
