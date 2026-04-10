import { useState, useCallback } from "react";
import { Alert, Share } from "react-native";
import { useTranslation } from "react-i18next";
import { useTrips } from "../contexts/TripsContext";

export function useInvitationLink(tripId: string) {
  const { t } = useTranslation();
  const { getTripInvitationLink } = useTrips();
  const [invitationLink, setInvitationLink] = useState<string>("");
  const [linkExpiry, setLinkExpiry] = useState<Date | null>(null);

  const loadLink = useCallback(async () => {
    try {
      const res = await getTripInvitationLink(tripId);
      setInvitationLink(res.link || "");
      const exp = new Date();
      exp.setDate(exp.getDate() + 7);
      setLinkExpiry(exp);
    } catch { /* non-bloquant */ }
  }, [tripId]);

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
    Alert.alert(t("inviteFriends.renewTitle"), t("inviteFriends.renewMsg"), [
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
    ]);
  };

  return { invitationLink, linkExpiry, loadLink, handleShareLink, handleRenewLink };
}
