import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { useFriends } from "../contexts/FriendsContext";
import { useTranslation } from "react-i18next";
import ApiService from "../services/ApiService";
import { RootStackParamList, Trip, User } from "../types";
import { useBottomSheet } from "./useBottomSheet";
import { useSendInvitations } from "./useSendInvitations";
import { useInvitationLink } from "./useInvitationLink";
import { usePendingInvitations } from "./usePendingInvitations";
import { useTripMembers } from "./useTripMembers";
import { CollabInfo } from "./useTripMembers";

// Re-exporté pour la compatibilité descendante (MemberRow, MemberActionSheet)
export type { CollabInfo } from "./useTripMembers";

type ScreenNavProp = StackNavigationProp<RootStackParamList, "InviteFriends">;

export function useInviteFriends(tripId: string) {
  const navigation = useNavigation<ScreenNavProp>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { friends: realFriends } = useFriends();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [owner, setOwner] = useState<CollabInfo | null>(null);
  const [activeMembers, setActiveMembers] = useState<CollabInfo[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvitePanel, setShowInvitePanel] = useState(false);

  const inviteSheet = useBottomSheet({ outputRange: [600, 0] });

  // loadData est défini avant les sous-hooks qui le consomment comme callback.
  // Les setters locaux (setOwner, setActiveMembers) sont stables entre les rendus.
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
        user?.id === tripData.ownerId
          ? (user?.avatar ?? null)
          : (avatarMap[tripData.ownerId] ?? null);

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

      setActiveMembers(
        (tripData.collaborators ?? []).map((c: any) => ({
          userId: c.userId,
          name: friendsMap[c.userId] ?? t("inviteFriends.memberFallback"),
          avatar: avatarMap[c.userId] ?? null,
          isOwner: false,
        })),
      );

      setFriends(
        realFriends.map((f) => ({
          id: f.friendId,
          name: f.name,
          email: f.email ?? "",
          avatar: f.avatar,
          createdAt: f.createdAt,
        })),
      );
    } catch (e) {
      console.error("InviteFriendsScreen loadData:", e);
      Alert.alert(t("common.error"), t("inviteFriends.loadingError"));
    } finally {
      setLoading(false);
    }
  }, [tripId, user, realFriends]);

  const members = useTripMembers(tripId, loadData);
  const invitations = usePendingInvitations(tripId, user?.id);
  const link = useInvitationLink(tripId);

  useEffect(() => {
    void loadData();
    void invitations.loadPendingInvitations();
    void link.loadLink();
  }, [loadData, invitations.loadPendingInvitations, link.loadLink]);

  const sendInvitations = useSendInvitations({ trip, friends });

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

  const handleCancelInvitation = (inv: any) => {
    invitations.handleCancelInvitation(inv, async () => {
      await loadData();
      await invitations.loadPendingInvitations();
    });
  };

  const handleSendInvitations = async () => {
    await sendInvitations.handleSendInvitations(async () => {
      closeInvitePanel();
      await loadData();
    });
  };

  const alreadyMemberIds = new Set([owner?.userId, ...activeMembers.map((m) => m.userId)]);
  const pendingEmails = new Set(
    invitations.pendingInvitations.map((inv: any) => inv.inviteeEmail).filter(Boolean),
  );
  const friendsToInvite = friends.filter(
    (f) => !alreadyMemberIds.has(f.id) && !pendingEmails.has(f.email),
  );
  const alreadyMembers = friends.filter((f) => alreadyMemberIds.has(f.id));

  const isOwner = !!(user && owner?.userId === user.id);
  const actionLoading = members.actionLoading || invitations.actionLoading;

  return {
    trip,
    owner,
    activeMembers,
    pendingInvitations: invitations.pendingInvitations,
    friends,
    friendsToInvite,
    alreadyMembers,
    invitationLink: link.invitationLink,
    linkExpiry: link.linkExpiry,
    loading,
    actionLoading,
    showInvitePanel,
    selectedMember: members.selectedMember,
    isOwner,
    memberSheet: members.memberSheet,
    inviteSheet,
    // Invitation link
    handleShareLink: link.handleShareLink,
    handleRenewLink: link.handleRenewLink,
    // Sheet controls
    openSheet: members.openSheet,
    closeSheet: members.closeSheet,
    openInvitePanel,
    closeInvitePanel,
    // Member actions
    handleCancelInvitation,
    handleRemoveMember: members.handleRemoveMember,
    handleTransferOwnership: members.handleTransferOwnership,
    handleViewProfile: members.handleViewProfile,
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
