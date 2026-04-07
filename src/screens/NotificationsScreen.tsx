import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { F } from "../theme/fonts";
import { RADIUS } from "../theme";
import { useTranslation } from "react-i18next";
import i18n, { parseApiError } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

const timeAgo = (raw: string): string => {
  const diff = Date.now() - new Date(raw).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return i18n.t("notifications.timeAgo.justNow");
  if (m < 60) return i18n.t("notifications.timeAgo.minutes", { count: m });
  const h = Math.floor(m / 60);
  if (h < 24) return i18n.t("notifications.timeAgo.hours", { count: h });
  const d = Math.floor(h / 24);
  if (d === 1) return i18n.t("notifications.timeAgo.yesterday");
  return i18n.t("notifications.timeAgo.days", { count: d });
};

const iconForStatus = (status: string): { emoji: string; bg: string } => {
  if (status === "accepted") return { emoji: "✅", bg: "#E2EDD9" };
  if (status === "declined") return { emoji: "❌", bg: "#FDEAEA" };
  return { emoji: "✈️", bg: "#F5E5DC" };
};

const titleForInvitation = (inv: any): string => {
  const inviter = inv.inviterName ?? inv.inviter?.name ?? i18n.t("invitation.someoneRef");
  if (inv.status === "accepted") return i18n.t("notifications.inviteAccepted", { inviter });
  if (inv.status === "declined") return i18n.t("notifications.inviteDeclined", { inviter });
  return i18n.t("notifications.inviteReceived", { inviter });
};

const subtitleForInvitation = (inv: any, date: string): string => {
  const trip = inv.tripName ?? inv.trip?.title ?? inv.trip?.name ?? "";
  return trip ? `${trip} · ${date}` : date;
};

// ── Screen ────────────────────────────────────────────────────────────────────

const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { getUserInvitations, respondToInvitation } = useTrips();
  const { user } = useAuth();
  const { markAllAsRead, markAsRead, readIds } = useNotifications();

  const [invitations, setInvitations]   = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await getUserInvitations(user.email);
      const sorted = [...data].sort((a: any, b: any) => {
        const order = { pending: 0, accepted: 1, declined: 2 };
        const diff =
          (order[a.status as keyof typeof order] ?? 3) -
          (order[b.status as keyof typeof order] ?? 3);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setInvitations(sorted);
    } catch (e) {
      console.error("NotificationsScreen load error:", e);
    }
  }, [user?.email]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const markRead = (id: string) => {
    markAsRead(id);
  };

  const handleRespond = async (token: string, action: "accept" | "decline") => {
    if (action === "decline") {
      Alert.alert(
        t("notifications.declineConfirmTitle"),
        t("notifications.declineConfirmMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("notifications.decline"), style: "destructive", onPress: () => doRespond(token, action) },
        ]
      );
    } else {
      doRespond(token, action);
    }
  };

  const doRespond = async (token: string, action: "accept" | "decline") => {
    setRespondingId(token);
    try {
      const ok = await respondToInvitation(token, action, user?.id);
      if (ok) {
        markRead(token);
        await load();
      } else {
        Alert.alert(t("common.error"), t("notifications.declineError"));
      }
    } catch (e) {
      Alert.alert(
        t("common.error"),
        parseApiError(e) || t("friendInvitation.errorOccurred"),
      );
    } finally {
      setRespondingId(null);
    }
  };

  const unreadCount = invitations.filter(
    (i) => i.status === "pending" && !readIds.has(i._id ?? i.token ?? "")
  ).length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} translucent={false} />

      {/* ── Header (même style que FriendsScreen) ── */}
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.bgMid }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.textMid} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.text }]}>{t("notifications.title")}</Text>
        </View>
        <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
          <Text style={styles.markAll}>{t("notifications.markAllRead")}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.terra} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            invitations.length === 0 && styles.scrollEmpty,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terra} />
          }
        >
          {invitations.length === 0 ? (
            <EmptyState />
          ) : (
            invitations.map((inv) => {
              const id = inv._id ?? inv.token;
              const isUnread = inv.status === "pending" && !readIds.has(id);
              return (
                <NotifItem
                  key={id}
                  invitation={inv}
                  unread={isUnread}
                  responding={respondingId === inv.token}
                  onPress={() => markRead(id)}
                  onAccept={() => handleRespond(inv.token, "accept")}
                  onDecline={() => handleRespond(inv.token, "decline")}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ── NotifItem ─────────────────────────────────────────────────────────────────

interface NotifItemProps {
  invitation: any;
  unread: boolean;
  responding: boolean;
  onPress: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const NotifItem: React.FC<NotifItemProps> = ({
  invitation, unread, responding, onPress, onAccept, onDecline,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const status            = invitation.status ?? "pending";
  const { emoji, bg }     = iconForStatus(status);
  const title             = titleForInvitation(invitation);
  const date              = invitation.createdAt ? timeAgo(invitation.createdAt) : "";
  const subtitle          = subtitleForInvitation(invitation, date);

  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }, unread ? styles.itemUnread : styles.itemRead, status === "pending" && styles.itemPending]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Icon — carré arrondi comme dans la maquette */}
      <View style={[styles.notifIcon, { backgroundColor: bg }]}>
        <Text style={styles.notifEmoji}>{emoji}</Text>
      </View>

      {/* Texte */}
      <View style={styles.itemBody}>
        <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={2}>{title}</Text>
        <Text style={[styles.notifSub, { color: colors.textLight }]} numberOfLines={1}>{subtitle}</Text>

        {/* Boutons uniquement sur les invitations en attente */}
        {status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={onAccept}
              disabled={responding}
              activeOpacity={0.8}
            >
              {responding ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.acceptText}>{t("notifications.accept")}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.declineBtn, { backgroundColor: colors.bgMid }]}
              onPress={onDecline}
              disabled={responding}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={15} color={colors.textMid} style={{ marginRight: 4 }} />
              <Text style={[styles.declineText, { color: colors.textMid }]}>{t("notifications.decline")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Point non-lu — uniquement pour les pending non lus */}
      {unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

// ── EmptyState ────────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIconBox, { backgroundColor: colors.bgMid }]}>
        <Ionicons name="notifications-off-outline" size={40} color={colors.textLight} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("notifications.allRead")}</Text>
      <Text style={[styles.emptySub, { color: colors.textMid }]}>{t("notifications.allReadMessage")}</Text>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },

  // ── Header (calqué sur FriendsScreen)
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#F5F0E8",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDE5D8",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 14,
  },
  eyebrow: {
    fontSize: 14,
    fontFamily: F.sans400,
    color: "#B0A090",
    marginBottom: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 34,
    fontFamily: F.sans700,
    color: "#2A2318",
  },
  badge: {
    backgroundColor: "#C4714A",
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: F.sans600,
    color: "#FFFFFF",
  },
  markAll: {
    fontSize: 15,
    fontFamily: F.sans600,
    color: "#C4714A",
  },

  // ── Scroll
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  scrollEmpty: {
    flex: 1,
  },

  // ── Item
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8CCBA",
    borderRadius: RADIUS.card,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  itemUnread: {
    borderColor: "rgba(196,113,74,0.3)",
    borderWidth: 1.5,
  },
  itemRead: {},
  itemPending: {
    alignItems: "flex-start",
  },

  // ── Icon — carré arrondi
  notifIcon: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifEmoji: {
    fontSize: 26,
  },

  // ── Texte
  itemBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 17,
    fontFamily: F.sans600,
    color: "#2A2318",
    lineHeight: 23,
  },
  notifSub: {
    fontSize: 14,
    fontFamily: F.sans400,
    color: "#B0A090",
    marginTop: 3,
  },

  // ── Boutons
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 20,
  },
  acceptBtn: {
    backgroundColor: "#C4714A",
  },
  declineBtn: {
    backgroundColor: "#EDE5D8",
  },
  acceptText: {
    fontSize: 14,
    fontFamily: F.sans600,
    color: "#FFFFFF",
  },
  declineText: {
    fontSize: 14,
    fontFamily: F.sans600,
    color: "#7A6A58",
  },

  // ── Dot non-lu
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#C4714A",
    flexShrink: 0,
    marginTop: 6,
  },

  // ── Loader
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Empty state
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: "#EDE5D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: F.serif700,
    color: "#2A2318",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    fontFamily: F.sans400,
    color: "#7A6A58",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 22,
  },
});

export default NotificationsScreen;
