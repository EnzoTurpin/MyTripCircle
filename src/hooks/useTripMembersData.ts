import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ApiService from "../services/ApiService";

export interface MemberInfo {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  status: "active" | "pending";
  invitedAt?: Date;
  invitationId?: string;
}

export function useTripMembersData(tripId: string, userId: string | undefined) {
  const { t } = useTranslation();
  const [tripTitle, setTripTitle] = useState("");
  const [owner, setOwner] = useState<MemberInfo | null>(null);
  const [activeMembers, setActiveMembers] = useState<MemberInfo[]>([]);
  const [pendingMembers, setPendingMembers] = useState<MemberInfo[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const [linkExpiry, setLinkExpiry] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tripData, sentInvs] = await Promise.all([
        ApiService.getTripById(tripId),
        userId
          ? ApiService.getSentInvitations(userId, "pending").catch(() => [] as any[])
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
        name: ownerData?.name || t("tripMembers.ownerFallback"),
        email: ownerData?.email,
        avatar: ownerData?.avatar || null,
        role: "owner",
        status: "active",
      });

      setActiveMembers(
        (tripData.collaborators || []).map((c: any) => {
          const u = usersMap[c.userId] || {};
          return {
            userId: c.userId,
            name: u.name || c.userId,
            email: u.email,
            avatar: u.avatar || null,
            role: (c.role || "viewer") as MemberInfo["role"],
            status: "active" as const,
          };
        })
      );

      const tripPending = sentInvs.filter((inv: any) => inv.tripId === tripId);
      setPendingMembers(
        tripPending.map((inv: any) => ({
          userId: inv._id || inv.id,
          name: inv.inviteeEmail || inv.inviteePhone || t("tripMembers.guestFallback"),
          email: inv.inviteeEmail,
          role: "viewer" as const,
          status: "pending" as const,
          invitedAt: inv.createdAt ? new Date(inv.createdAt) : undefined,
          invitationId: inv._id || inv.id,
        }))
      );

      try {
        const linkRes = await ApiService.getTripInvitationLink(tripId);
        setInviteLink(linkRes.link || "");
        const exp = new Date();
        exp.setDate(exp.getDate() + 7);
        setLinkExpiry(exp);
      } catch { /* non-bloquant */ }
    } catch (e) {
      console.error("useTripMembersData loadData:", e);
    } finally {
      setLoading(false);
    }
  }, [tripId, userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => { loadData(); }, [loadData]);

  return {
    tripTitle,
    owner,
    activeMembers,
    pendingMembers,
    inviteLink,
    setInviteLink,
    linkExpiry,
    setLinkExpiry,
    loading,
    refreshing,
    loadData,
    onRefresh,
  };
}
