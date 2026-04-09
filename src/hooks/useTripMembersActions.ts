import { useState } from "react";
import { Alert, Share } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import ApiService from "../services/ApiService";
import { RootStackParamList } from "../types";
import { MemberInfo } from "./useTripMembersData";

type NavProp = StackNavigationProp<RootStackParamList, "TripMembers">;

interface LinkSetters {
  setInviteLink: (link: string) => void;
  setLinkExpiry: (date: Date) => void;
}

export function useTripMembersActions(tripId: string, onSuccess: () => Promise<void>) {
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const [actionLoading, setActionLoading] = useState(false);

  const handleShareLink = async (inviteLink: string) => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: t("tripMembers.shareMsg", { link: inviteLink }),
        url: inviteLink,
      });
    } catch { /* user cancelled */ }
  };

  const handleRenewLink = (setters: LinkSetters) => {
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
              setters.setInviteLink(res.link || "");
              const exp = new Date();
              exp.setDate(exp.getDate() + 7);
              setters.setLinkExpiry(exp);
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
          text: t("tripMembers.cancelInviteYes"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.cancelInvitation(inv.invitationId!);
              await onSuccess();
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

  const handleRemoveMember = (selectedMember: MemberInfo | null, closeSheet: () => void) => {
    if (!selectedMember) return;
    closeSheet();
    Alert.alert(
      t("tripMembers.removeTitle"),
      t("tripMembers.removeMsg", { name: selectedMember.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tripMembers.removeConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.removeTripCollaborator(tripId, selectedMember.userId);
              await onSuccess();
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

  const handleTransferOwnership = (selectedMember: MemberInfo | null, closeSheet: () => void) => {
    if (!selectedMember) return;
    closeSheet();
    Alert.alert(
      t("tripMembers.transferTitle"),
      t("tripMembers.transferMsg", { name: selectedMember.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("tripMembers.transferConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await ApiService.transferTripOwnership(tripId, selectedMember.userId);
              await onSuccess();
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

  const handleViewProfile = (selectedMember: MemberInfo | null, closeSheet: () => void) => {
    if (!selectedMember) return;
    closeSheet();
    navigation.navigate("FriendProfile", {
      friendId: selectedMember.userId,
      friendName: selectedMember.name,
    });
  };

  return {
    actionLoading,
    handleShareLink,
    handleRenewLink,
    handleCancelInvitation,
    handleRemoveMember,
    handleTransferOwnership,
    handleViewProfile,
  };
}
