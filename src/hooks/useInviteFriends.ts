import { useState, useEffect, useCallback } from "react";
import { Alert, Share } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useFriends } from "../contexts/FriendsContext";
import { useTranslation } from "react-i18next";
import ApiService from "../services/ApiService";
import { parseApiError } from "../utils/i18n";
import { RootStackParamList, Trip, User } from "../types";
import { useBottomSheet } from "./useBottomSheet";
import { useSendInvitations } from "./useSendInvitations";

type ScreenNavProp = StackNavigationProp<RootStackParamList, "InviteFriends">;

export interface CollabInfo {
  userId: string;
  name: string;
  email?: string;
  avatar?: string | null;
  isOwner: boolean;
}

export function useInviteFriends(tripId: string) {
  const navigation = useNavigation<ScreenNavProp>();
  const { t } = useTranslation();
  const { getSentInvitations, getTripInvitationLink, refreshData } = useTrips();
  const { user } = useAuth();
  const { friends: realFriends } = useFriends();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [owner, setOwner] = useState<CollabInfo | null>(null);
  const [activeMembers, setActiveMembers] = useState<CollabInfo[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [invitationLink, setInvitationLink] = useState<string>("");
  const [linkExpiry, setLinkExpiry] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CollabInfo | null>(null);

  const memberSheet = useBottomSheet({ outputRange: [340, 0] });
  const inviteSheet = useBottomSheet({ outputRange: [600, 0] });

  const isOwner = !!(user && owner?.userId === user.id);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const tripData = await ApiService.getTripById(tripId);
      if (!tripData) return;
      setTrip({ ...tripData, id: tripData._id ?? tripData.id });

      if (user && tripData.ownerId !== user.id) {
        const myCollab = tripData.collaborators?.find((c: any) => c.userId === user!.id);
        if (!myCollab?.permissions?.canInvite) {
          Alert.alert(t("inviteFriends.accessDenied"), t("inviteFriends.accessDeniedMsg"), [
            { text: t("common.ok"), onPress: () => navigation.goBack() },
          ]);
          return;
        }
      }

      const friendsMap: Record<string, string> = {};
      realFriends.forEach((f) => { friendsMap[f.friendId] = f.name; });

      const avatarMap: Record<string, string | null> = {};
      realFriends.forEach((f) => { avatarMap[f.friendId] = f.avatar ?? null; });

      const ownerAvatar =
        user?.id === tripData.ownerId ? (user?.avatar ?? null) : (avatarMap[tripData.ownerId] ?? null);
      setOwner({
        userId: tripData.ownerId,
        name:
          user?.id === tripData.ownerId
            ? (user?.name ?? t("inviteFriends.ownerFallback"))
            : (friendsMap[tripData.ownerId] ?? t("inviteFriends.ownerFallback")),
        email: user?.id === tripData.ownerId ? user?.email : undefined,
        avatar: ownerAvatar,
        isOwner: true,
      });

      const active: CollabInfo[] = (tripData.collaborators ?? []).map((c: any) => ({
        userId: c.userId,
        name: friendsMap[c.userId] ?? t("inviteFriends.memberFallback"),
        avatar: avatarMap[c.userId] ?? null,
        isOwner: false,
      }));
      setActiveMembers(active);

      setFriends(
        realFriends.map((f) => ({
          id: f.friendId,
          name: f.name,
          email: f.email ?? "",
          avatar: f.avatar,
          createdAt: f.createdAt,
        }))
      );

      if (user) {
        try {
          const sent = await getSentInvitations(user.id, "pending");
          const forTrip = sent.filter(
            (inv: any) =>
              inv.tripId === tripId &&
              inv.type !== "link" &&
              (inv.inviteeEmail || inv.inviteePhone)
          );
          setPendingInvitations(forTrip);
        } catch { /* non-bloquant */ }
      }

      try {
        const res = await getTripInvitationLink(tripId);
        setInvitationLink(res.link || "");
        const exp = new Date();
        exp.setDate(exp.getDate() + 7);
        setLinkExpiry(exp);
      } catch { /* non-bloquant */ }
    } catch (e) {
      console.error("InviteFriendsScreen loadData:", e);
      Alert.alert(t("common.error"), t("inviteFriends.loadingError"));
    } finally {
      setLoading(false);
    }
  }, [tripId, user, realFriends]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Sheet & panel controls ─────────────────────────────────────────────────

  const openSheet = (m: CollabInfo) => {
    setSelectedMember(m);
    memberSheet.open();
  };

  const closeSheet = () => {
    memberSheet.close(() => setSelectedMember(null));
  };

  const openInvitePanel = () => {
    setShowInvitePanel(true);
    inviteSheet.open();
  };

  const closeInvitePanel = () => {
    inviteSheet.close(() => {
      setShowInvitePanel(false);
      sendInvitations.reset();
    });
  };

  // ── Invitation link ────────────────────────────────────────────────────────

  const handleShareLink = async () => {
    if (!invitationLink) return;
    try {
      await Share.share({
        message: t("inviteFriends.shareMsg", { link: invitationLink }),
        url: invitationLink,
      });
    } catch { /* user cancelled */ }
  };

  const handleRenewLink = () => {
    Alert.alert(
      t("inviteFriends.renewTitle"),
      t("inviteFriends.renewMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("inviteFriends.renewConfirm"),
          onPress: async () => {
            try {
              const res = await getTripInvitationLink(tripId, true);
              setInvitationLink(res.link || "");
              const exp = new Date();
              exp.setDate(exp.getDate() + 7);
              setLinkExpiry(exp);
              Alert.alert(t("inviteFriends.renewSuccess"), t("inviteFriends.renewSuccessMsg"));
            } catch {
              Alert.alert(t("common.error"), t("inviteFriends.renewError"));
            }
          },
        },
      ]
    );
  };

  // ── Member actions ─────────────────────────────────────────────────────────

  const handleCancelInvitation = (inv: any) => {
    const label = inv.inviteeEmail || inv.inviteePhone || t("inviteFriends.guestFallback");
    Alert.alert(
      t("inviteFriends.cancelInviteTitle"),
      t("inviteFriends.cancelInviteMsg", { name: label }),
      [
        { text: t("inviteFriends.cancelInviteNo"), style: "cancel" },
        {
          text: t("inviteFriends.cancelInviteYes"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.cancelInvitation(inv._id || inv.id);
              await loadData();
            } catch {
              Alert.alert(t("common.error"), t("inviteFriends.cancelInviteError"));
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
    const member = selectedMember;
    closeSheet();
    Alert.alert(
      t("inviteFriends.removeTitle"),
      t("inviteFriends.removeMsg", { name: member.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("inviteFriends.removeConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.removeTripCollaborator(tripId, member.userId);
              await loadData();
              refreshData();
            } catch (e: any) {
              Alert.alert(t("common.error"), parseApiError(e) || t("inviteFriends.removeError"));
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
    const member = selectedMember;
    closeSheet();
    Alert.alert(
      t("inviteFriends.transferTitle"),
      t("inviteFriends.transferMsg", { name: member.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("inviteFriends.transferConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.transferTripOwnership(tripId, member.userId);
              await loadData();
              refreshData();
            } catch (e: unknown) {
              Alert.alert(t("common.error"), parseApiError(e) || t("inviteFriends.transferError"));
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
    navigation.navigate("FriendProfile", {
      friendId: selectedMember.userId,
      friendName: selectedMember.name,
    });
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const alreadyMemberIds = new Set([owner?.userId, ...activeMembers.map((m) => m.userId)]);
  const pendingEmails = new Set(
    pendingInvitations.map((inv: any) => inv.inviteeEmail).filter(Boolean)
  );
  const friendsToInvite = friends.filter(
    (f) => !alreadyMemberIds.has(f.id) && !pendingEmails.has(f.email)
  );
  const alreadyMembers = friends.filter((f) => alreadyMemberIds.has(f.id));

  const sendInvitations = useSendInvitations({ trip, friends });

  const handleSendInvitations = async () => {
    await sendInvitations.handleSendInvitations(async () => {
      closeInvitePanel();
      await loadData();
    });
  };

  return {
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
    selectedMember,
    isOwner,
    memberSheet,
    inviteSheet,
    // Invitation link
    handleShareLink,
    handleRenewLink,
    // Sheet controls
    openSheet,
    closeSheet,
    openInvitePanel,
    closeInvitePanel,
    // Member actions
    handleCancelInvitation,
    handleRemoveMember,
    handleTransferOwnership,
    handleViewProfile,
    // Send invitations (from useSendInvitations)
    invitedFriends: sendInvitations.invitedFriends,
    emailInput: sendInvitations.emailInput,
    setEmailInput: sendInvitations.setEmailInput,
    sendingInvitations: sendInvitations.sendingInvitations,
    inviteCount: sendInvitations.inviteCount,
    toggleFriend: sendInvitations.toggleFriend,
    handleSendInvitations,
  };
}
