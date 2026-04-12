import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { F } from "../theme/fonts";
import { TabKey } from "../utils/invitationUtils";
import { useInvitationManagement } from "../hooks/useInvitationManagement";
import SkeletonBox from "../components/SkeletonBox";
import InvitationCard from "../components/invitations/InvitationCard";
import SentCard from "../components/invitations/SentCard";
import EmptyState from "../components/invitations/EmptyState";
import DeclineModal from "../components/invitations/DeclineModal";
import AcceptedToast from "../components/invitations/AcceptedToast";
import InvitationDetailView from "../components/invitations/InvitationDetailView";
import BackButton from "../components/ui/BackButton";

const InvitationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t }      = useTranslation();
  const { colors } = useTheme();

  const {
    invitation, loading, currentToken, setCurrentToken, initialToken, responding,
    invitations, sentInvitations, refreshing, tab, setTab, pending, displayed,
    declineTarget, setDeclineTarget, declineReason, setDeclineReason, declining,
    acceptingId, toastAnim, toastTrip,
    onRefresh,
    handleAccept, openDecline, confirmDecline,
    handleCancelInvitation,
    handleAcceptSingle, handleDeclineSingle,
  } = useInvitationManagement();

  // ── Deep-link mode ──

  if (currentToken) {
    return (
      <InvitationDetailView
        invitation={invitation}
        loading={loading}
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
        <BackButton onPress={() => navigation.goBack()} />
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
  headerCenter: { flex: 1, marginLeft: 14 },
  headerTitle:  { fontSize: 28, fontFamily: F.sans700 },
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
});

export default InvitationScreen;
