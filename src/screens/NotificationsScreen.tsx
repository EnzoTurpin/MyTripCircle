import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { F } from "../theme/fonts";
import { useTranslation } from "react-i18next";
import { parseApiError } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";
import NotifItem from "../components/notifications/NotifItem";
import NotifEmptyState from "../components/notifications/NotifEmptyState";
import BackButton from "../components/ui/BackButton";

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
        markAsRead(token);
        await load();
      } else {
        Alert.alert(t("common.error"), t("notifications.declineError"));
      }
    } catch (e) {
      Alert.alert(t("common.error"), parseApiError(e) || t("friendInvitation.errorOccurred"));
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} translucent={false} />

      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.text }]}>{t("notifications.title")}</Text>
        </View>
        <TouchableOpacity onPress={() => markAllAsRead()} activeOpacity={0.7}>
          <Text style={styles.markAll}>{t("notifications.markAllRead")}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 14, paddingTop: 12, gap: 14 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
              <View style={{ flex: 1, gap: 8, paddingTop: 4 }}>
                <SkeletonBox width="75%" height={14} borderRadius={6} />
                <SkeletonBox width="50%" height={12} borderRadius={5} />
                <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                  <SkeletonBox width={90} height={30} borderRadius={8} />
                  <SkeletonBox width={90} height={30} borderRadius={8} />
                </View>
              </View>
            </View>
          ))}
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
            <NotifEmptyState />
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
                  onPress={() => markAsRead(id)}
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

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  headerCenter: { flex: 1, marginLeft: 14 },
  title:   { fontSize: 28, fontFamily: F.sans700 },
  markAll: { fontSize: 15, fontFamily: F.sans600, color: "#C4714A" },

  scrollContent: { paddingTop: 8, paddingBottom: 32 },
  scrollEmpty:   { flex: 1 },
});

export default NotificationsScreen;
