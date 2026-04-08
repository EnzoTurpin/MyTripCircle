import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
  LayoutAnimation,
  Share,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useFriends } from "../contexts/FriendsContext";
import { useAuth } from "../contexts/AuthContext";
import { Friend, FriendRequest, FriendSuggestion } from "../types";
import { F } from "../theme/fonts";
import { RADIUS, SHADOW } from "../theme";
import { ApiService } from "../services/ApiService";
import { useTranslation } from "react-i18next";
import i18n, { parseApiError } from "../utils/i18n";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonBox from "../components/SkeletonBox";


const timeAgo = (date: Date | string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return i18n.t("friends.timeAgo.justNow");
  return i18n.t("friends.timeAgo.minutes", { count: mins });
};

// ── Component ─────────────────────────────────────────────────────────────────
type Tab = "friends" | "requests" | "suggestions";

const tabBarStyles = StyleSheet.create({
  tabBar: { flexDirection: "row" as const, borderBottomWidth: 1, marginHorizontal: 20, marginBottom: 16 },
  tabItem: { flex: 1, flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 5, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabItemActive: { borderBottomColor: "#C4714A" },
  tabText: { fontSize: 15, fontFamily: F.sans600 },
  tabTextActive: { color: "#C4714A" },
  badge: { backgroundColor: "#C4714A", borderRadius: 10, minWidth: 18, height: 18, justifyContent: "center" as const, alignItems: "center" as const, paddingHorizontal: 4 },
  badgeText: { fontSize: 12, fontFamily: F.sans700, color: "#FFFFFF" },
});

interface FriendsTabBarProps {
  activeTab: Tab;
  friendsCount: number;
  totalPending: number;
  onTabChange: (tab: Tab) => void;
  t: (key: string, opts?: any) => string;
  colors: any;
}

const FriendsTabBar: React.FC<FriendsTabBarProps> = ({ activeTab, friendsCount, totalPending, onTabChange, t, colors }) => (
  <View style={[tabBarStyles.tabBar, { borderBottomColor: colors.bgDark }]}>
    <TouchableOpacity
      style={[tabBarStyles.tabItem, activeTab === "friends" && tabBarStyles.tabItemActive]}
      onPress={() => onTabChange("friends")}
      activeOpacity={0.7}
    >
      <Text style={[tabBarStyles.tabText, { color: colors.textLight }, activeTab === "friends" && tabBarStyles.tabTextActive]}>
        {t("friends.tabs.friends", { count: friendsCount })}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[tabBarStyles.tabItem, activeTab === "requests" && tabBarStyles.tabItemActive]}
      onPress={() => onTabChange("requests")}
      activeOpacity={0.7}
    >
      <Text style={[tabBarStyles.tabText, { color: colors.textLight }, activeTab === "requests" && tabBarStyles.tabTextActive]}>
        {t("friends.tabs.requests")}
      </Text>
      {totalPending > 0 && (
        <View style={tabBarStyles.badge}>
          <Text style={tabBarStyles.badgeText}>{totalPending}</Text>
        </View>
      )}
    </TouchableOpacity>
    <TouchableOpacity
      style={[tabBarStyles.tabItem, activeTab === "suggestions" && tabBarStyles.tabItemActive]}
      onPress={() => onTabChange("suggestions")}
      activeOpacity={0.7}
    >
      <Text style={[tabBarStyles.tabText, { color: colors.textLight }, activeTab === "suggestions" && tabBarStyles.tabTextActive]}>
        {t("friends.tabs.suggestions")}
      </Text>
    </TouchableOpacity>
  </View>
);

const FriendsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const {
    friends,
    friendRequests,
    suggestions,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    removeFriend,
    refreshFriendRequests,
    refreshFriends,
    refreshSuggestions,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sharingLink, setSharingLink] = useState(false);

  const handleTabChange = (tab: Tab) => {
    LayoutAnimation.configureNext({
      duration: 240,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "spring", springDamping: 0.85 },
    });
    setActiveTab(tab);
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshFriendRequests();
      refreshFriends();
      refreshSuggestions();
    }, [])
  );

  // Separate received vs sent pending requests
  const receivedRequests = friendRequests.filter(
    (r) => r.status === "pending" && r.senderId !== user?.id
  );
  const sentRequests = friendRequests.filter(
    (r) => r.status === "pending" && r.senderId === user?.id
  );
  const totalPending = receivedRequests.length;

  const filteredFriends = friends.filter((f) =>
    searchQuery.trim()
      ? f.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSendToSuggestion = async (suggestion: FriendSuggestion) => {
    try {
      setSending(true);
      const res = await sendFriendRequest({ recipientEmail: suggestion.email });
      navigation.navigate("FriendRequestConfirmation", {
        recipientName: suggestion.name,
        recipientEmail: suggestion.email,
        autoAccepted: !!res?.autoAccepted,
      });
    } catch (error: unknown) {
      Alert.alert(
        t("common.error"),
        parseApiError(error) || t("friends.sendError"),
      );
    } finally {
      setSending(false);
    }
  };

  const handleRespondRequest = async (requestId: string, action: "accept" | "decline") => {
    try {
      await respondToFriendRequest(requestId, action);
      if (action === "accept") Alert.alert(t("friends.success"), t("friends.requestAccepted"));
    } catch (error: unknown) {
      Alert.alert(
        t("common.error"),
        parseApiError(error) || t("friends.sendError"),
      );
    }
  };

  const handleCancelRequest = (request: FriendRequest) => {
    const name = request.recipientName || request.recipientEmail || request.recipientPhone || t("common.unknown");
    Alert.alert(
      t("friends.cancelRequest"),
      t("friends.cancelRequestConfirm", { name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("friends.cancelRequest"),
          style: "destructive",
          onPress: async () => {
            try {
              await cancelFriendRequest(request.id);
            } catch (error: unknown) {
              Alert.alert(
                t("common.error"),
                parseApiError(error) || t("friends.sendError"),
              );
            }
          },
        },
      ]
    );
  };

  const handleShareInviteLink = async () => {
    setSharingLink(true);
    try {
      const { link } = await ApiService.getFriendInviteLink();
      await Share.share({
        message: t("friends.shareMessage", { link }),
        title: "MyTripCircle",
      });
    } catch (error: unknown) {
      const raw =
        error instanceof Error ? error.message : String(error ?? "");
      if (raw !== "User did not share") {
        Alert.alert(
          t("common.error"),
          parseApiError(error) || t("friends.sendError"),
        );
      }
    } finally {
      setSharingLink(false);
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    Alert.alert(
      t("friends.removeFriend"),
      t("friends.removeFriendConfirm", { name: friend.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("friends.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriend(friend.friendId);
            } catch (error: unknown) {
              Alert.alert(
                t("common.error"),
                parseApiError(error) || t("friends.sendError"),
              );
            }
          },
        },
      ]
    );
  };

  // ── Render helpers ───────────────────────────────────────────────────────────
  const renderFriendItem = ({ item, index }: { item: Friend; index: number }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate("FriendProfile", { friendId: item.friendId, friendName: item.name })}
      onLongPress={() => handleRemoveFriend(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarPhoto} />
        ) : (
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.cardSub, { color: colors.textLight }]}>
          {(item as any).commonTrips
            ? t("friends.commonTrips", { count: (item as any).commonTrips })
            : item.email || item.phone || t("friends.tabs.friends", { count: 1 }).replace(/ \(.*\)/, "")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </TouchableOpacity>
  );

  const renderReceivedItem = ({ item, index }: { item: FriendRequest; index: number }) => (
    <View style={[styles.card, styles.receivedCard, { backgroundColor: colors.surface }]}>
      <View style={styles.receivedTop}>
        <View style={[styles.avatar, styles.receivedAvatar, { backgroundColor: getAvatarColor(item.senderName || "?") }]}>
          <Text style={styles.receivedAvatarText}>{getInitials(item.senderName || "?")}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.receivedName, { color: colors.text }]}>{item.senderName}</Text>
          <Text style={[styles.receivedSub, { color: colors.textMid }]}>
            {[
              t("friends.receivedTime", { time: timeAgo(item.createdAt) }),
              item.commonFriends
                ? t("friends.commonFriend", { count: item.commonFriends })
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      </View>
      <View style={styles.receivedActions}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleRespondRequest(item.id, "accept")}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.acceptBtnText}>{t("friends.accept")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.declineBtn, { backgroundColor: colors.bgMid }]}
          onPress={() => handleRespondRequest(item.id, "decline")}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color={colors.textMid} />
          <Text style={[styles.declineBtnText, { color: colors.textMid }]}>{t("friends.decline")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentItem = ({ item, index }: { item: FriendRequest; index: number }) => {
    const displayName =
      item.recipientName || item.recipientEmail || item.recipientPhone || t("common.unknown");
    const initial = displayName.charAt(0).toUpperCase();
    return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(displayName) }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.cardSub, { color: colors.textLight }]}>{t("friends.requestSent")}</Text>
      </View>
      <View style={[styles.pendingPill, { backgroundColor: colors.bgMid }]}>
        <Text style={[styles.pendingPillText, { color: colors.textMid }]}>{t("friends.requestPending")}</Text>
      </View>
      <TouchableOpacity
        style={[styles.cancelBtn, { backgroundColor: colors.dangerLight }]}
        onPress={() => handleCancelRequest(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={14} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
  };

  const renderSuggestionItem = ({ item, index }: { item: FriendSuggestion; index: number }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.suggLeft}
        onPress={() => navigation.navigate("FriendProfile", { friendId: item.id, friendName: item.name })}
        activeOpacity={0.8}
      >
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name), overflow: "hidden" }]}>
          {item.avatar
            ? <Image source={{ uri: item.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            : <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          }
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardSub, { color: colors.textLight }]}>
            {t("friends.commonFriend", { count: item.commonFriends })}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addSuggBtn}
        onPress={() => handleSendToSuggestion(item)}
        disabled={sending}
        activeOpacity={0.8}
      >
        <Text style={styles.addSuggBtnText}>{t("friends.addButton")}</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bg }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgMid }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textMid} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("friends.title")}</Text>
        </View>
        <TouchableOpacity
          style={styles.addCircleBtn}
          onPress={() => navigation.navigate("AddFriend" as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.addCirclePlus}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Tab bar (underline style) ── */}
        <FriendsTabBar activeTab={activeTab} friendsCount={friends.length} totalPending={totalPending} onTabChange={handleTabChange} t={t} colors={colors} />

        {/* ── Content (includes invite banner and search bar for friends tab) ── */}
        {(() => {
          if (loading) return (
            <View style={{ paddingHorizontal: 14, paddingTop: 8, gap: 12 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 }}>
                  <SkeletonBox width={48} height={48} borderRadius={24} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <SkeletonBox width="60%" height={14} borderRadius={6} />
                    <SkeletonBox width="40%" height={12} borderRadius={5} />
                  </View>
                  <SkeletonBox width={80} height={32} borderRadius={16} />
                </View>
              ))}
            </View>
          );

          if (activeTab === "friends") return (
            <>
              <TouchableOpacity
                style={[styles.inviteBanner, { backgroundColor: colors.terraLight }]}
                onPress={handleShareInviteLink}
                disabled={sharingLink}
                activeOpacity={0.85}
              >
                <View style={[styles.inviteBannerIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="link-outline" size={20} color={colors.terra} />
                </View>
                <View style={styles.inviteBannerText}>
                  <Text style={[styles.inviteBannerTitle, { color: colors.terraDark }]}>{t("friends.shareInviteLink")}</Text>
                  <Text style={[styles.inviteBannerSub, { color: colors.textMid }]}>
                    {sharingLink ? t("friends.generatingLink") : t("friends.shareInviteDescription")}
                  </Text>
                </View>
                <Ionicons name="share-outline" size={20} color={colors.textLight} />
              </TouchableOpacity>
              <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search" size={18} color={colors.textLight} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder={t("friends.searchPlaceholder")}
                  placeholderTextColor={colors.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
              </View>
              {filteredFriends.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconWrap, { backgroundColor: colors.terraLight }]}>
                    <Ionicons name="people-outline" size={40} color={colors.terra} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("friends.emptyFriends")}</Text>
                  <Text style={[styles.emptyText, { color: colors.textMid }]}>{t("friends.emptyFriendsSubtitle")}</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredFriends}
                  renderItem={renderFriendItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </>
          );

          if (activeTab === "requests") return (
            <>
              {/* Reçues */}
              <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t("friends.receivedSection", { count: receivedRequests.length })}</Text>
              {receivedRequests.length === 0 ? (
                <View style={[styles.emptyState, { paddingVertical: 20 }]}>
                  <Text style={[styles.emptyText, { color: colors.textMid }]}>{t("friends.noRequestsReceived")}</Text>
                </View>
              ) : (
                <FlatList
                  data={receivedRequests}
                  renderItem={renderReceivedItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={{ marginBottom: 14 }}
                />
              )}

              {/* Envoyées */}
              <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t("friends.sentSection", { count: sentRequests.length })}</Text>
              {sentRequests.length === 0 ? (
                <View style={[styles.emptyState, { paddingVertical: 20 }]}>
                  <Text style={[styles.emptyText, { color: colors.textMid }]}>{t("friends.noRequestsSent")}</Text>
                </View>
              ) : (
                <FlatList
                  data={sentRequests}
                  renderItem={renderSentItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </>
          );

          /* Suggestions tab */
          return (
            suggestions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.terraLight }]}>
                  <Ionicons name="person-add-outline" size={40} color={colors.terra} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("friends.noSuggestions")}</Text>
                <Text style={[styles.emptyText, { color: colors.textMid }]}>{t("friends.noSuggestionsDesc")}</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t("friends.youMightKnow")}</Text>
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </>
            )
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  // Header
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1, marginLeft: 14 },
  headerEyebrow: { fontSize: 14, fontFamily: F.sans400, marginBottom: 1 },
  headerTitle: { fontSize: 34, fontFamily: F.sans700 },
  addCircleBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#C4714A",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#C4714A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  addCirclePlus: { fontSize: 22, color: "#FFFFFF", lineHeight: 26, marginTop: -1, fontFamily: F.sans400 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Tab bar
  tabBar: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 20, marginBottom: 16 },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabItemActive: { borderBottomColor: "#C4714A" },
  tabText: { fontSize: 15, fontFamily: F.sans600 },
  tabTextActive: { color: "#C4714A" },
  badge: { backgroundColor: "#C4714A", borderRadius: 10, minWidth: 18, height: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  badgeText: { fontSize: 12, fontFamily: F.sans700, color: "#FFFFFF" },

  // Invite link banner
  inviteBanner: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(196,113,74,0.25)", borderRadius: RADIUS.card, paddingVertical: 13, paddingHorizontal: 14, marginHorizontal: 20, marginBottom: 14 },
  inviteBannerIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  inviteBannerText: { flex: 1 },
  inviteBannerTitle: { fontSize: 14, fontFamily: F.sans600, marginBottom: 2 },
  inviteBannerSub: { fontSize: 12, fontFamily: F.sans400 },

  // Search bar
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, marginBottom: 14, borderWidth: 1, borderRadius: 28, paddingHorizontal: 16, paddingVertical: 12, ...SHADOW.light },
  searchInput: { flex: 1, fontSize: 17, fontFamily: F.sans400, padding: 0, margin: 0 },

  // Cards
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D8CCBA", borderRadius: RADIUS.card, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8, marginHorizontal: 20 },
  receivedCard: { flexDirection: "column", gap: 0, borderColor: "rgba(196,113,74,0.3)", borderWidth: 1.5, paddingVertical: 16, paddingHorizontal: 16 },
  receivedTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  receivedActions: { flexDirection: "row", gap: 10 },
  avatarPhoto: { width: 48, height: 48, borderRadius: 24 },
  avatar: { width: 48, height: 48, borderRadius: 24, overflow: "hidden", justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { fontSize: 17, fontFamily: F.sans600, color: "#FFFFFF" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 17, fontFamily: F.sans600, color: "#2A2318" },
  cardSub: { fontSize: 14, fontFamily: F.sans400, color: "#B0A090", marginTop: 2 },

  receivedAvatar: { width: 58, height: 58, borderRadius: 29 },
  receivedAvatarText: { fontSize: 20, fontFamily: F.sans600, color: "#FFFFFF" },
  receivedName: { fontSize: 19, fontFamily: F.sans700, color: "#2A2318" },
  receivedSub: { fontSize: 15, fontFamily: F.sans400, color: "#7A6A58", marginTop: 3 },

  // Accept / decline buttons
  acceptBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#C4714A", borderRadius: RADIUS.button, paddingVertical: 13 },
  acceptBtnText: { fontSize: 17, fontFamily: F.sans600, color: "#FFFFFF" },
  declineBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#EDE5D8", borderRadius: RADIUS.button, paddingVertical: 13 },
  declineBtnText: { fontSize: 17, fontFamily: F.sans600, color: "#7A6A58" },

  // Sent request
  pendingPill: { backgroundColor: "#EDE5D8", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  pendingPillText: { fontSize: 14, fontFamily: F.sans600, color: "#7A6A58" },
  cancelBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FDEAEA", justifyContent: "center", alignItems: "center" },

  // Suggestion
  suggLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  addSuggBtn: { backgroundColor: "#C4714A", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  addSuggBtnText: { fontSize: 14, fontFamily: F.sans600, color: "#FFFFFF" },

  // Section labels
  sectionLabel: { fontSize: 13, fontFamily: F.sans600, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 10, marginTop: 4, marginHorizontal: 20 },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 19, fontFamily: F.sans600, marginBottom: 6 },
  emptyText: { fontSize: 15, fontFamily: F.sans400, textAlign: "center", paddingHorizontal: 32 },
});

export default FriendsScreen;
