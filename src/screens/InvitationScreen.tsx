import React, { useState, useEffect, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";
import { useTranslation } from "react-i18next";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { parseApiError } from "../utils/i18n";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";
import { TabKey } from "../utils/invitationUtils";
import InvitationCard from "../components/invitations/InvitationCard";
import SentCard from "../components/invitations/SentCard";
import EmptyState from "../components/invitations/EmptyState";
import DeclineModal from "../components/invitations/DeclineModal";
import AcceptedToast from "../components/invitations/AcceptedToast";
import InvitationDetailView from "../components/invitations/InvitationDetailView";

type InvitationScreenRouteProp = RouteProp<RootStackParamList, "Invitation">;

const InvitationScreen: React.FC = () => {
  const route      = useRoute<InvitationScreenRouteProp>();
  const navigation = useNavigation<any>();
  const { t }      = useTranslation();

  const { respondToInvitation, getInvitationByToken, getUserInvitations, getSentInvitations, cancelInvitation } = useTrips();
  const { user }          = useAuth();
  const { markAllAsRead } = useNotifications();
  const { colors }        = useTheme();

  const initialToken = route.params?.token;
  const [currentToken, setCurrentToken] = useState<string | undefined>(initialToken);

  // ── Deep-link mode state ──
  const [invitation, setInvitation] = useState<any>(null);
  const [responding, setResponding] = useState(false);

  // ── List mode state ──
  const [invitations, setInvitations]         = useState<any[]>([]);
  const [sentInvitations, setSentInvitations] = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [tab, setTab]                         = useState<TabKey>("all");

  // Decline modal
  const [declineTarget, setDeclineTarget] = useState<any | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [declining, setDeclining]         = useState(false);

  // Accept loading (per token)
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Toast
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastTrip, setToastTrip] = useState<{ name: string; id: string } | null>(null);

  // ── Deep-link token sync ──
  useEffect(() => {
    if (route.params?.token && route.params.token !== currentToken) {
      setCurrentToken(route.params.token);
    }
  }, [route.params?.token]);

  useEffect(() => {
    if (currentToken) {
      loadSingleInvitation();
    } else {
      loadAllInvitations();
    }
  }, [currentToken]);

  // ── Loaders ──

  const loadAllInvitations = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await getUserInvitations(user.email);
      const sorted = [...data].sort((a: any, b: any) => {
        const order: Record<string, number> = { pending: 0, accepted: 1, declined: 2, expired: 3 };
        const diff = (order[a.status] ?? 4) - (order[b.status] ?? 4);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setInvitations(sorted);
      markAllAsRead();
    } catch (e) {
      console.error("InvitationScreen loadAll error:", e);
    }
  }, [user?.email]);

  const loadSentInvitations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getSentInvitations(user.id);
      const sorted = [...data].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSentInvitations(sorted);
    } catch (e) {
      console.error("InvitationScreen loadSent error:", e);
    }
  }, [user?.id]);

  const loadSingleInvitation = async () => {
    try {
      setLoading(true);
      const data = await getInvitationByToken(currentToken);
      const tripId = data?.tripId ?? data?.trip?._id;
      if (tripId) {
        setLoading(false);
        setCurrentToken(undefined);
        navigation.navigate("TripPublicView", { tripId, invitationToken: currentToken });
      } else {
        setInvitation(data);
        setLoading(false);
      }
    } catch (e) {
      console.error("InvitationScreen loadSingle error:", e);
      Alert.alert(t("common.error"), t("invitation.loadingError"));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentToken) {
      Promise.all([loadAllInvitations(), loadSentInvitations()]).finally(() =>
        setLoading(false)
      );
    }
  }, [loadAllInvitations, loadSentInvitations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAllInvitations(), loadSentInvitations()]);
    setRefreshing(false);
  };

  // ── Toast ──

  const showToast = (tripName: string, tripId: string) => {
    setToastTrip({ name: tripName, id: tripId });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastTrip(null));
  };

  // ── Accept / Decline (list) ──

  const handleAccept = async (inv: any) => {
    setAcceptingId(inv.token);
    try {
      const ok = await respondToInvitation(inv.token, "accept", user?.id);
      if (ok) {
        await loadAllInvitations();
        const name = inv.tripName ?? inv.trip?.title ?? t("invitation.thisTripRef");
        const id   = inv.tripId   ?? inv.trip?._id;
        showToast(name, id);
      } else {
        Alert.alert(t("common.error"), t("invitation.acceptError2"));
      }
    } catch (e) {
      Alert.alert(t("common.error"), parseApiError(e) || t("invitation.unexpectedError"));
    } finally {
      setAcceptingId(null);
    }
  };

  const openDecline = (inv: any) => {
    setDeclineTarget(inv);
    setDeclineReason("");
  };

  const confirmDecline = async () => {
    if (!declineTarget) return;
    setDeclining(true);
    try {
      const ok = await respondToInvitation(declineTarget.token, "decline", user?.id);
      if (ok) {
        setDeclineTarget(null);
        await loadAllInvitations();
      } else {
        Alert.alert(t("common.error"), t("invitation.declineError2"));
      }
    } catch (e) {
      Alert.alert(t("common.error"), parseApiError(e) || t("invitation.unexpectedError"));
    } finally {
      setDeclining(false);
    }
  };

  // ── Cancel sent invitation ──

  const handleCancelInvitation = (inv: any) => {
    const invitee  = inv.inviteeEmail ?? inv.inviteePhone ?? t("invitation.someoneRef");
    const tripName = inv.trip?.title ?? t("invitation.thisTripRef");
    Alert.alert(
      t("invitation.cancelInvitationTitle"),
      t("invitation.cancelInvitationMessage", { invitee, tripName }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              const id = inv._id ?? inv.id;
              const ok = await cancelInvitation(id);
              if (ok) {
                await loadSentInvitations();
              } else {
                Alert.alert(t("common.error"), t("invitation.cancelError"));
              }
            } catch (e) {
              Alert.alert(t("common.error"), parseApiError(e) || t("invitation.unexpectedError"));
            }
          },
        },
      ]
    );
  };

  // ── Accept / Decline (deep-link single view) ──

  const handleAcceptSingle = async () => {
    if (!invitation) return;
    if (!user) {
      Alert.alert(t("invitation.loginRequired"), t("invitation.loginToAccept"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("invitation.login"), onPress: () => navigation.navigate("Auth") },
      ]);
      return;
    }
    try {
      setResponding(true);
      const ok = await respondToInvitation(currentToken, "accept", user.id);
      if (ok) {
        Alert.alert(
          invitation.type === "link" ? t("invitation.tripJoined") : t("invitation.accepted"),
          invitation.type === "link" ? t("invitation.tripJoinedMessage") : t("invitation.acceptedMessage"),
          [{
            text: t("common.ok"),
            onPress: () => {
              if (invitation.tripId) {
                navigation.navigate("TripDetails", { tripId: invitation.tripId });
              } else {
                navigation.navigate("Main");
              }
            },
          }]
        );
      } else {
        Alert.alert(t("common.error"), t("invitation.acceptError"));
      }
    } catch (e) {
      Alert.alert(t("common.error"), parseApiError(e) || t("invitation.acceptError"));
    } finally {
      setResponding(false);
    }
  };

  const handleDeclineSingle = () => {
    Alert.alert(t("invitation.declineTitle"), t("invitation.declineMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("invitation.decline"),
        style: "destructive",
        onPress: async () => {
          try {
            setResponding(true);
            const ok = await respondToInvitation(currentToken, "decline", user?.id);
            if (ok) {
              Alert.alert(t("invitation.declined"), t("invitation.declinedMessage"), [
                { text: t("common.ok"), onPress: () => navigation.navigate("Main") },
              ]);
            } else {
              Alert.alert(t("common.error"), t("invitation.declineError"));
            }
          } catch (e) {
            Alert.alert(t("common.error"), parseApiError(e) || t("invitation.declineError"));
          } finally {
            setResponding(false);
          }
        },
      },
    ]);
  };

  // ── Derived lists ──

  const pending   = invitations.filter((i) => i.status === "pending");
  let displayed: typeof invitations;
  if (tab === "pending")    { displayed = pending; }
  else if (tab === "sent")  { displayed = sentInvitations; }
  else                      { displayed = invitations; }

  // ── Deep-link mode ──

  if (currentToken) {
    return (
      <InvitationDetailView
        invitation={invitation}
        loading={loading}
        currentToken={currentToken}
        initialToken={initialToken}
        responding={responding}
        onBack={() => {
          if (initialToken) {
            navigation.goBack();
          } else {
            setCurrentToken(undefined);
          }
        }}
        onAccept={handleAcceptSingle}
        onDecline={handleDeclineSingle}
        onNavigateToTrip={(tripId) => navigation.navigate("TripDetails", { tripId })}
        onNavigateBack={() => navigation.goBack()}
      />
    );
  }

  // ── List mode ──

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.bgMid }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={colors.textMid} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("invitation.myInvitations")}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Tabs ── */}
      <View style={[styles.tabBar, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        {([
          { key: "all",     label: t("invitation.tabAll",     { count: invitations.length })    },
          { key: "pending", label: t("invitation.tabPending", { count: pending.length })         },
          { key: "sent",    label: t("invitation.tabSent",    { count: sentInvitations.length }) },
        ] as { key: TabKey; label: string }[]).map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabItem, tab === key && styles.tabItemActive]}
            onPress={() => setTab(key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: colors.textLight }, tab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={{ paddingHorizontal: 14, paddingTop: 12, gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ borderRadius: 14, backgroundColor: colors.bgMid, padding: 14, gap: 10 }}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <SkeletonBox width={40} height={40} borderRadius={20} />
                <View style={{ flex: 1, gap: 8 }}>
                  <SkeletonBox width="65%" height={14} borderRadius={6} />
                  <SkeletonBox width="45%" height={12} borderRadius={5} />
                </View>
                <SkeletonBox width={60} height={22} borderRadius={10} />
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <SkeletonBox height={36} borderRadius={10} style={{ flex: 1 }} />
                <SkeletonBox height={36} borderRadius={10} style={{ flex: 1 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, displayed.length === 0 && styles.scrollEmpty]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C4714A" />
          }
        >
          {(() => {
            if (displayed.length === 0) return <EmptyState tab={tab} />;
            if (tab === "sent") return displayed.map((inv) => (
              <SentCard
                key={inv._id ?? inv.token ?? inv.id}
                invitation={inv}
                onViewTrip={() => {
                  const id = inv.tripId ?? inv.trip?._id;
                  if (id) navigation.navigate("TripDetails", { tripId: id });
                }}
                onCancel={() => handleCancelInvitation(inv)}
              />
            ));
            return displayed.map((inv) => (
              <InvitationCard
                key={inv._id ?? inv.token}
                invitation={inv}
                expanded={tab === "pending"}
                accepting={acceptingId === inv.token}
                onAccept={() => handleAccept(inv)}
                onDecline={() => openDecline(inv)}
                onDetail={() => {
                  const tripId = inv.tripId ?? inv.trip?._id;
                  if (tripId) {
                    navigation.navigate("TripPublicView", { tripId, invitationToken: inv.token });
                  } else {
                    setCurrentToken(inv.token);
                  }
                }}
                onViewTrip={() => {
                  const id = inv.tripId ?? inv.trip?._id;
                  if (id) navigation.navigate("TripDetails", { tripId: id });
                }}
              />
            ));
          })()}
        </ScrollView>
      )}

      <DeclineModal
        visible={!!declineTarget}
        declineTarget={declineTarget}
        declineReason={declineReason}
        declining={declining}
        onConfirm={confirmDecline}
        onCancel={() => setDeclineTarget(null)}
        onChangeReason={setDeclineReason}
      />

      <AcceptedToast
        toastTrip={toastTrip}
        toastAnim={toastAnim}
        onView={(tripId) => navigation.navigate("TripDetails", { tripId })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn:      { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1, marginLeft: 14 },
  headerTitle:  { fontSize: 34, fontFamily: F.sans700, color: "#2A2318" },
  tabBar: {
    flexDirection: "row", borderBottomWidth: 1,
    marginHorizontal: 20,
  },
  tabItem: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: "#C4714A" },
  tabText:       { fontSize: 15, fontFamily: F.sans600, color: "#B0A090" },
  tabTextActive: { color: "#C4714A" },
  scroll:        { padding: 16, gap: 14 },
  scrollEmpty:   { flex: 1 },
  center:        { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default InvitationScreen;
