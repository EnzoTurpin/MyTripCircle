import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ApiService } from "../services/ApiService";
import { useFriends } from "../contexts/FriendsContext";
import { FriendSuggestion } from "../types";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { parseApiError } from "../utils/i18n";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";
import { useTheme } from "../contexts/ThemeContext";

const HISTORY_KEY = "add_friend_search_history";
const MAX_HISTORY = 6;

// Couleurs non-thémifiables
const MOSS = "#6B8C5A";
const MOSS_LIGHT = "#E2EDD9";

const detectContactType = (input: string): "email" | "phone" | null => {
  const t = input.trim();
  if (/^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,253}\.[a-zA-Z]{2,}$/.test(t)) return "email";
  if (/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{6,15}$/.test(t.replaceAll(/[\s-()]/g, ""))) return "phone";
  return null;
};

// ── Screen ─────────────────────────────────────────────────────────────────────
const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { sendFriendRequest, suggestions, refreshSuggestions } = useFriends();
  const { colors } = useTheme();

  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    refreshSuggestions();
    AsyncStorage.getItem(HISTORY_KEY).then((val) => {
      if (val) setHistory(JSON.parse(val));
    });
  }, []);

  const saveToHistory = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const removeFromHistory = async (query: string) => {
    const updated = history.filter((h) => h !== query);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const clearHistory = async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  // ── Lookup debounce ───────────────────────────────────────────────────────
  const handleInputChange = (text: string) => {
    setInput(text);
    setSearchResult(null);
    setSearchError(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    const trimmed = text.trim();
    if (!trimmed) return;
    const type = detectContactType(trimmed);
    if (!type) return;
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await ApiService.lookupUser(
          type === "email" ? { email: trimmed } : { phone: trimmed }
        );
        setSearchResult(result);
        saveToHistory(trimmed);
      } catch (e: any) {
        const msg = (() => { try { return JSON.parse(e.message)?.error; } catch { return e.message; } })();
        if (msg?.includes("not found") || msg?.includes("404"))
          setSearchError(t("addFriend.errorNotFound"));
        else if (msg?.includes("yourself"))
          setSearchError(t("addFriend.errorYourself"));
        setSearchResult(null);
      } finally {
        setSearching(false);
      }
    }, 600);
  };

  // ── Envoyer demande ───────────────────────────────────────────────────────
  const handleSend = async (recipientEmail?: string, recipientPhone?: string, overrideName?: string) => {
    const trimmed = input.trim();
    const type = detectContactType(trimmed);
    try {
      setSending(true);
      const res = await sendFriendRequest(
        recipientEmail
          ? { recipientEmail }
          : type === "email"
          ? { recipientEmail: trimmed }
          : { recipientPhone: trimmed }
      );
      const name = overrideName ?? searchResult?.name ?? trimmed;
      const email = recipientEmail ?? searchResult?.email ?? (type === "email" ? trimmed : undefined);
      navigation.replace("FriendRequestConfirmation", {
        recipientName: name,
        recipientEmail: email,
        autoAccepted: !!res?.autoAccepted,
      });
    } catch (err: unknown) {
      Alert.alert(
        t("common.error"),
        parseApiError(err) || t("addFriend.errorDefault"),
      );
    } finally {
      setSending(false);
    }
  };

  // ── Render result card ────────────────────────────────────────────────────
  const renderResult = () => {
    const r = searchResult;
    const initials = getInitials(r.name);
    const avatarColor = getAvatarColor(r.name);
    const isAlreadyFriend = r.relation === "friend";
    const isPendingSent = r.relation === "pending_sent";
    const isPendingReceived = r.relation === "pending_received";

    return (
      <>
        <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t("addFriend.sectionResult")}</Text>
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: "rgba(196,113,74,0.4)" }]}>
          {/* Identité */}
          <View style={styles.resultRow}>
            <View style={[styles.avatar, { backgroundColor: avatarColor, overflow: "hidden" }]}>
              {r.avatar
                ? <Image source={{ uri: r.avatar }} style={{ width: 52, height: 52, borderRadius: 26 }} />
                : <Text style={styles.avatarText}>{initials}</Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultName, { color: colors.text }]}>{r.name}</Text>
              <Text style={[styles.resultEmail, { color: colors.textLight }]}>{r.email}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              navigation.navigate("FriendProfile", { friendId: r.id, friendName: r.name });
            }}>
              <Text style={styles.seeProfileLink}>{t("addFriend.viewProfile")}</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.bgMid }]}>
              <Text style={styles.statValue}>{r.stats.totalTrips}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("addFriend.statTrips")}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.bgMid }]}>
              <Text style={styles.statValue}>{r.stats.countries}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("addFriend.statCountries")}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.bgMid }]}>
              <Text style={styles.statValue}>{r.stats.commonFriends}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>{t("addFriend.statCommonFriends")}</Text>
            </View>
          </View>

          {/* Action */}
          {isAlreadyFriend ? (
            <View style={[styles.alreadyPill, { backgroundColor: MOSS_LIGHT }]}>
              <Ionicons name="checkmark-circle" size={17} color={MOSS} />
              <Text style={[styles.alreadyText, { color: MOSS }]}>{t("addFriend.alreadyFriend")}</Text>
            </View>
          ) : isPendingSent ? (
            <View style={[styles.actionBtn, { backgroundColor: colors.bgMid }]}>
              <Ionicons name="hourglass-outline" size={17} color={colors.textMid} />
              <Text style={[styles.actionBtnText, { color: colors.textMid }]}>{t("addFriend.requestSent")}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, sending && { opacity: 0.6 }]}
              onPress={() => handleSend()}
              disabled={sending}
              activeOpacity={0.85}
            >
              {sending
                ? <ActivityIndicator size="small" color={colors.white} />
                : <Ionicons name={isPendingReceived ? "checkmark" : "person-add-outline"} size={17} color={colors.white} />
              }
              <Text style={styles.actionBtnText}>
                {isPendingReceived ? t("addFriend.acceptRequest") : t("addFriend.sendRequest")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  // ── Render suggestion item ────────────────────────────────────────────────
  const renderSuggestion = ({ item }: { item: FriendSuggestion }) => (
    <View style={[styles.suggCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => navigation.navigate("FriendProfile", { friendId: item.id, friendName: item.name })}
        activeOpacity={0.8}
        style={styles.suggAvatarWrap}
      >
        <View style={[styles.suggAvatar, { backgroundColor: getAvatarColor(item.name), overflow: "hidden" }]}>
          {item.avatar
            ? <Image source={{ uri: item.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
            : <Text style={styles.suggAvatarText}>{getInitials(item.name)}</Text>
          }
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => navigation.navigate("FriendProfile", { friendId: item.id, friendName: item.name })}
        activeOpacity={0.8}
      >
        <Text style={[styles.suggName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.suggSub, { color: colors.textLight }]}>
          {t("addFriend.commonFriend", { count: item.commonFriends })}
        </Text>
        <Text style={styles.suggViewProfile}>{t("addFriend.viewProfile")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addSuggBtn}
        onPress={() => handleSend(item.email, undefined, item.name)}
        disabled={sending}
        activeOpacity={0.8}
      >
        <Text style={styles.addSuggBtnText}>{t("addFriend.addSuggestion")}</Text>
      </TouchableOpacity>
    </View>
  );

  const dismissSearch = () => {
    Keyboard.dismiss();
    setFocused(false);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissSearch}>
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.bgMid }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={colors.textMid} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("addFriend.title")}</Text>
      </View>

      {/* Search bar + dropdown dans un seul conteneur bordé */}
      <View style={[
        styles.searchWrapper,
        { backgroundColor: colors.surface, borderColor: colors.border },
        (input.trim() || focused) && styles.searchWrapperActive,
      ]}>
        {/* Ligne de recherche */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={input.trim() ? colors.terra : colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("addFriend.searchPlaceholder")}
            placeholderTextColor={colors.textLight}
            value={input}
            onChangeText={handleInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {input.length > 0 ? (
            <TouchableOpacity onPress={() => { setInput(""); setSearchResult(null); setSearchError(null); }}>
              <View style={[styles.clearBtn, { backgroundColor: colors.bgMid }]}>
                <Ionicons name="close" size={16} color={colors.textLight} />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Historique — dans le même conteneur, séparé par une ligne */}
        {focused && !input.trim() && history.length > 0 && (
          <>
            <View style={[styles.historySeparator, { backgroundColor: colors.bgMid }]} />
            {history.map((item, index) => (
              <TouchableOpacity
                key={item}
                style={[styles.historyRow, { borderBottomColor: colors.bgMid }, index === history.length - 1 && styles.historyRowLast]}
                onPress={() => { setFocused(false); handleInputChange(item); }}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={15} color={colors.textLight} />
                <Text style={[styles.historyItem, { color: colors.text }]} numberOfLines={1}>{item}</Text>
                <TouchableOpacity
                  onPress={() => removeFromHistory(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={13} color={colors.textLight} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.historyClearRow, { borderTopColor: colors.bgMid }]} onPress={clearHistory}>
              <Text style={styles.historyClear}>{t("addFriend.clearHistory")}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Loader */}
        {searching && (
          <View style={styles.centerRow}>
            <ActivityIndicator color={colors.terra} size="small" />
            <Text style={[styles.searchingText, { color: colors.textLight }]}>{t("addFriend.searching")}</Text>
          </View>
        )}

        {/* Erreur / not found */}
        {searchError && !searching && (
          <View style={styles.notFoundBox}>
            <Ionicons name="person-outline" size={30} color={colors.textLight} />
            <Text style={[styles.notFoundText, { color: colors.textLight }]}>{searchError}</Text>
          </View>
        )}

        {/* Carte résultat */}
        {searchResult && !searching && renderResult()}

        {/* Suggestions */}
        {!input.trim() && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textLight }]}>{t("addFriend.sectionSuggestions")}</Text>
            {suggestions.length === 0 ? (
              <View style={styles.notFoundBox}>
                <Ionicons name="people-outline" size={30} color={colors.textLight} />
                <Text style={[styles.notFoundText, { color: colors.textLight }]}>{t("addFriend.noSuggestions")}</Text>
              </View>
            ) : (
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60, paddingTop: 8 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 32, fontFamily: F.sans700 },

  // Search wrapper — porte toute la bordure
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 10,
    borderWidth: 1.5,
    borderRadius: 32,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  searchWrapperActive: {
    borderColor: "#C4714A",
    shadowColor: "#C4714A",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },

  // Search bar — juste le layout interne, sans bordure
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: F.sans400,
    padding: 0,
    margin: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  historySeparator: {
    height: 1,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  historyRowLast: { borderBottomWidth: 0 },
  historyItem: { flex: 1, fontSize: 15, fontFamily: F.sans400 },
  historyClearRow: { paddingHorizontal: 20, paddingVertical: 11, alignItems: "center", borderTopWidth: 1 },
  historyClear: { fontSize: 12, fontFamily: F.sans500, color: "#C4714A" },

  // States
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  searchingText: { fontSize: 14, fontFamily: F.sans400 },
  notFoundBox: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 24,
    marginHorizontal: 20,
  },
  notFoundText: {
    fontSize: 14,
    fontFamily: F.sans400,
    textAlign: "center",
  },

  // Section label
  sectionLabel: {
    fontSize: 12,
    fontFamily: F.sans600,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginHorizontal: 20,
    marginBottom: 10,
  },

  // Result card
  resultCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#C4714A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 17, fontFamily: F.sans700, color: "#FFFFFF" },
  resultName: { fontSize: 17, fontFamily: F.sans600 },
  resultEmail: { fontSize: 13, fontFamily: F.sans400, marginTop: 2 },
  seeProfileLink: { fontSize: 14, fontFamily: F.sans600, color: "#C4714A" },

  // Stats
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontFamily: F.sans700, color: "#C4714A" },
  statLabel: { fontSize: 11, fontFamily: F.sans400, marginTop: 2 },

  // Action button
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C4714A",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#C4714A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnText: { fontSize: 16, fontFamily: F.sans600, color: "#FFFFFF" },
  alreadyPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
  },
  alreadyText: { fontSize: 15, fontFamily: F.sans600 },

  // Suggestion cards
  suggCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  suggAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  suggAvatarText: { fontSize: 14, fontFamily: F.sans600, color: "#FFFFFF" },
  suggAvatarWrap: { flexShrink: 0 },
  suggName: { fontSize: 15, fontFamily: F.sans600 },
  suggSub: { fontSize: 12, fontFamily: F.sans400, marginTop: 2 },
  suggViewProfile: { fontSize: 12, fontFamily: F.sans500, color: "#C4714A", marginTop: 4 },
  addSuggBtn: {
    backgroundColor: "#C4714A",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addSuggBtnText: { fontSize: 13, fontFamily: F.sans600, color: "#FFFFFF" },
});

export default AddFriendScreen;
