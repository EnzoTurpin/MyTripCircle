import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ApiService } from "../services/ApiService";
import { useFriends } from "../contexts/FriendsContext";
import { FriendSuggestion } from "../types";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { parseApiError } from "../utils/i18n";
import { useTheme } from "../contexts/ThemeContext";
import SearchResultCard from "../components/addFriend/SearchResultCard";
import SuggestionCard from "../components/addFriend/SuggestionCard";
import SearchBarWithHistory from "../components/addFriend/SearchBarWithHistory";
import useSearchHistory from "../hooks/useSearchHistory";

const detectContactType = (input: string): "email" | "phone" | null => {
  const t = input.trim();
  if (/^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,253}\.[a-zA-Z]{2,}$/.test(t)) return "email";
  if (/^\+?\(?\d{1,4}\)?[-\s.]?\(?\d{1,4}\)?[-\s.]?\d{6,15}$/.test(t.replaceAll(/[\s-()]/g, ""))) return "phone";
  return null;
};

const AddFriendScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { sendFriendRequest, suggestions, refreshSuggestions } = useFriends();
  const { colors } = useTheme();
  const { history, saveToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { refreshSuggestions(); }, []);

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
        if (msg?.includes("not found") || msg?.includes("404")) setSearchError(t("addFriend.errorNotFound"));
        else if (msg?.includes("yourself")) setSearchError(t("addFriend.errorYourself"));
        setSearchResult(null);
      } finally {
        setSearching(false);
      }
    }, 600);
  };

  const handleSend = async (recipientEmail?: string, recipientPhone?: string, overrideName?: string) => {
    const trimmed = input.trim();
    const type = detectContactType(trimmed);
    try {
      setSending(true);
      let requestPayload: { recipientEmail?: string; recipientPhone?: string };
      if (recipientEmail) {
        requestPayload = { recipientEmail };
      } else if (type === "email") {
        requestPayload = { recipientEmail: trimmed };
      } else {
        requestPayload = { recipientPhone: trimmed };
      }
      const res = await sendFriendRequest(requestPayload);
      const name = overrideName ?? searchResult?.name ?? trimmed;
      const email = recipientEmail ?? searchResult?.email ?? (type === "email" ? trimmed : undefined);
      navigation.replace("FriendRequestConfirmation", {
        recipientName: name,
        recipientEmail: email,
        autoAccepted: !!res?.autoAccepted,
      });
    } catch (err: unknown) {
      Alert.alert(t("common.error"), parseApiError(err) || t("addFriend.errorDefault"));
    } finally {
      setSending(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setFocused(false); }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.bgMid }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textMid} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("addFriend.title")}</Text>
        </View>

        <SearchBarWithHistory
          input={input}
          onInputChange={handleInputChange}
          focused={focused}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          history={history}
          onHistorySelect={(item) => { setFocused(false); handleInputChange(item); }}
          onHistoryRemove={removeFromHistory}
          onHistoryClear={clearHistory}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {searching && (
            <View style={styles.centerRow}>
              <ActivityIndicator color={colors.terra} size="small" />
              <Text style={[styles.searchingText, { color: colors.textLight }]}>{t("addFriend.searching")}</Text>
            </View>
          )}

          {searchError && !searching && (
            <View style={styles.notFoundBox}>
              <Ionicons name="person-outline" size={30} color={colors.textLight} />
              <Text style={[styles.notFoundText, { color: colors.textLight }]}>{searchError}</Text>
            </View>
          )}

          {searchResult && !searching && (
            <SearchResultCard
              result={searchResult}
              sending={sending}
              onSend={() => handleSend()}
              onViewProfile={() =>
                navigation.navigate("FriendProfile", { friendId: searchResult.id, friendName: searchResult.name })
              }
            />
          )}

          {!input.trim() && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textLight }]}>
                {t("addFriend.sectionSuggestions")}
              </Text>
              {suggestions.length === 0 ? (
                <View style={styles.notFoundBox}>
                  <Ionicons name="people-outline" size={30} color={colors.textLight} />
                  <Text style={[styles.notFoundText, { color: colors.textLight }]}>
                    {t("addFriend.noSuggestions")}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={suggestions}
                  renderItem={({ item }) => (
                    <SuggestionCard
                      item={item}
                      sending={sending}
                      onSend={handleSend}
                      onViewProfile={(id, name) =>
                        navigation.navigate("FriendProfile", { friendId: id, friendName: name })
                      }
                    />
                  )}
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

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60, paddingTop: 8 },
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
  notFoundText: { fontSize: 14, fontFamily: F.sans400, textAlign: "center" },
  sectionLabel: {
    fontSize: 12,
    fontFamily: F.sans600,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginHorizontal: 20,
    marginBottom: 10,
  },
});

export default AddFriendScreen;
