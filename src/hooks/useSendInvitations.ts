import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useTrips } from "../contexts/TripsContext";
import { parseApiError } from "../utils/i18n";
import { Trip, User } from "../types";

interface UseSendInvitationsOptions {
  trip: Trip | null;
  friends: User[];
}

export function useSendInvitations({ trip, friends }: UseSendInvitationsOptions) {
  const { t } = useTranslation();
  const { createInvitation } = useTrips();
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [sendingInvitations, setSendingInvitations] = useState(false);

  const toggleFriend = (id: string) =>
    setInvitedFriends((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const reset = () => {
    setInvitedFriends([]);
    setEmailInput("");
  };

  const handleSendInvitations = async (onComplete: () => Promise<void>) => {
    if (!trip) return;
    const byEmail = emailInput.trim();

    try {
      setSendingInvitations(true);
      const promises: Promise<any>[] = [];

      if (byEmail) {
        const valid = /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,253}\.[a-zA-Z]{2,}$/.test(byEmail);
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
        if (!friend.email) { skipped.push(friend.name); return; }
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
      await onComplete();
      Alert.alert(
        t("inviteFriends.invitationsSent"),
        t("inviteFriends.invitesSentCount", { count: promises.length })
      );
    } catch (error) {
      Alert.alert(t("common.error"), parseApiError(error) || t("inviteFriends.invitationError"));
    } finally {
      setSendingInvitations(false);
    }
  };

  const inviteCount = invitedFriends.length + (emailInput.trim() ? 1 : 0);

  return {
    invitedFriends,
    emailInput,
    setEmailInput,
    sendingInvitations,
    inviteCount,
    toggleFriend,
    reset,
    handleSendInvitations,
  };
}
