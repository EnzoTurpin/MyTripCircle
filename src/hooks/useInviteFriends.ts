import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, Animated, Share } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useFriends } from "../contexts/FriendsContext";
import { useTranslation } from "react-i18next";
import ApiService from "../services/ApiService";
import { parseApiError } from "../utils/i18n";
import { RootStackParamList, Trip, User } from "../types";

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
  const { createInvitation, getSentInvitations, getTripInvitationLink, refreshData } = useTrips();
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
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [sendingInvitations, setSendingInvitations] = useState(false);

  const [selectedMember, setSelectedMember] = useState<CollabInfo | null>(null);

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const inviteAnim = useRef(new Animated.Value(0)).current;
  const inviteBackdrop = useRef(new Animated.Value(0)).current;

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

  const openSheet = (m: CollabInfo) => {
    setSelectedMember(m);
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, bounciness: 4 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setSelectedMember(null));
  };

  const sheetY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [340, 0] });

  const openInvitePanel = () => {
    setShowInvitePanel(true);
    Animated.parallel([
      Animated.spring(inviteAnim, { toValue: 1, useNativeDriver: true, bounciness: 4 }),
      Animated.timing(inviteBackdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeInvitePanel = () => {
    Animated.parallel([
      Animated.timing(inviteAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(inviteBackdrop, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setShowInvitePanel(false);
      setInvitedFriends([]);
      setEmailInput("");
    });
  };

  const inviteY = inviteAnim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

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
              Alert.alert(
                t("common.error"),
                parseApiError(e) || t("inviteFriends.removeError"),
              );
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
              Alert.alert(
                t("common.error"),
                parseApiError(e) || t("inviteFriends.transferError"),
              );
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

  const toggleFriend = (id: string) =>
    setInvitedFriends((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSendInvitations = async () => {
    if (!trip || !user) return;
    const byEmail = emailInput.trim();

    try {
      setSendingInvitations(true);
      const promises: Promise<any>[] = [];

      if (byEmail) {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(byEmail);
        if (!valid) {
          Alert.alert(t("inviteFriends.error"), t("inviteFriends.invalidEmail"));
          return;
        }
        promises.push(
          createInvitation({
            tripId: trip.id,
            inviteeEmail: byEmail,
            message: `${t("inviteFriends.invitationMessage")} "${trip.title}"`,
            permissions: { role: "editor", canEdit: true, canInvite: false, canDelete: false },
          })
        );
      }

      const skipped: string[] = [];
      invitedFriends.forEach((fId) => {
        const friend = friends.find((f) => f.id === fId);
        if (!friend) return;
        if (!friend.email) {
          skipped.push(friend.name);
          return;
        }
        promises.push(
          createInvitation({
            tripId: trip.id,
            inviteeEmail: friend.email,
            message: `${t("inviteFriends.invitationMessage")} "${trip.title}"`,
            permissions: { role: "editor", canEdit: true, canInvite: false, canDelete: false },
          })
        );
      });

      if (skipped.length > 0) {
        Alert.alert(
          t("inviteFriends.noEmailFriends"),
          t("inviteFriends.noEmailFriendsMsg", { names: skipped.join(", ") })
        );
      }

      if (promises.length === 0) {
        Alert.alert(t("inviteFriends.noInviteSelected"), t("inviteFriends.noInviteSelectedMsg"));
        return;
      }

      await Promise.all(promises);
      closeInvitePanel();
      await loadData();
      Alert.alert(
        t("inviteFriends.invitationsSent"),
        t("inviteFriends.invitesSentCount", { count: promises.length })
      );
    } catch (error) {
      Alert.alert(
        t("common.error"),
        parseApiError(error) || t("inviteFriends.invitationError"),
      );
    } finally {
      setSendingInvitations(false);
    }
  };

  const alreadyMemberIds = new Set([owner?.userId, ...activeMembers.map((m) => m.userId)]);
  const pendingEmails = new Set(
    pendingInvitations.map((inv: any) => inv.inviteeEmail).filter(Boolean)
  );
  const friendsToInvite = friends.filter(
    (f) => !alreadyMemberIds.has(f.id) && !pendingEmails.has(f.email)
  );
  const alreadyMembers = friends.filter((f) => alreadyMemberIds.has(f.id));
  const inviteCount = invitedFriends.length + (emailInput.trim() ? 1 : 0);

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
    invitedFriends,
    emailInput,
    setEmailInput,
    sendingInvitations,
    inviteCount,
    selectedMember,
    isOwner,
    sheetAnim,
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
  };
}
