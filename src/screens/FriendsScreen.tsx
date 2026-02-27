import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  LayoutAnimation,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useFriends } from "../contexts/FriendsContext";
import { useAuth } from "../contexts/AuthContext";
import { ModernCard } from "../components/ModernCard";
import { Friend, FriendRequest } from "../types";

const FriendsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    refreshFriendRequests,
    refreshFriends,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [contactInput, setContactInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tabWidth, setTabWidth] = useState(0);

  // Animation pour l'indicateur de slide
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: "friends" | "requests") => {
    // Animer l'indicateur avec une animation plus douce
    LayoutAnimation.configureNext({
      duration: 350,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8, initialVelocity: 0.5 },
    });
    setActiveTab(tab);

    // Animer le slide de l'indicateur avec easing doux
    Animated.timing(slideAnimation, {
      toValue: tab === "friends" ? 0 : 1,
      duration: 350,
      easing: (t) => {
        // Easing bezier cubique pour plus de douceur
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
      useNativeDriver: true,
    }).start();
  };

  // Rafraîchir les demandes d'amis et les amis quand l'écran reçoit le focus
  useFocusEffect(
    React.useCallback(() => {
      refreshFriendRequests();
      refreshFriends();
    }, [])
  );

  const detectContactType = (input: string): "email" | "phone" | null => {
    const trimmed = input.trim();

    // Check if email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return "email";
    }

    // Check if phone (au moins 6 chiffres, peut contenir +, espaces, parenthèses, tirets)
    if (/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{6,15}$/.test(trimmed.replace(/[\s\-\(\)]/g, ''))) {
      return "phone";
    }

    return null;
  };

  const handleSendRequest = async () => {
    const input = contactInput.trim();

    if (!input) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email ou un numéro de téléphone");
      return;
    }

    const contactType = detectContactType(input);

    if (!contactType) {
      Alert.alert("Erreur", "Format invalide. Entrez une adresse email ou un numéro de téléphone valide.");
      return;
    }

    try {
      setSending(true);
      await sendFriendRequest(
        contactType === "email" ? { recipientEmail: input } : { recipientPhone: input }
      );
      Alert.alert("Succès", "Demande d'ami envoyée avec succès !");
      setContactInput("");
    } catch (error: any) {
      // Gestion spécifique des erreurs
      let errorMessage = "Impossible d'envoyer la demande d'ami";

      if (error?.message) {
        try {
          // L'erreur peut être un JSON stringifié
          const errorObj = JSON.parse(error.message);
          if (errorObj.error) {
            errorMessage = errorObj.error;
          }
        } catch {
          // Si ce n'est pas du JSON, utiliser le message directement
          if (error.message.includes("Already friends")) {
            errorMessage = "Cette personne fait déjà partie de vos amis !";
          } else if (error.message.includes("already pending")) {
            errorMessage = "Une demande d'ami est déjà en attente pour cette personne.";
          } else {
            errorMessage = error.message;
          }
        }
      }

      Alert.alert("Erreur", errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleRespondRequest = async (requestId: string, action: "accept" | "decline") => {
    try {
      await respondToFriendRequest(requestId, action);
      if (action === "accept") {
        Alert.alert("Succès", "Demande d'ami acceptée !");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de répondre à la demande");
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    Alert.alert(
      "Retirer ami",
      `Voulez-vous vraiment retirer ${friend.name} de vos amis ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriend(friend.friendId);
              Alert.alert("Succès", "Ami retiré avec succès");
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Impossible de retirer cet ami");
            }
          },
        },
      ]
    );
  };

  const pendingRequests = friendRequests.filter((r) => r.status === "pending");

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <ModernCard variant="elevated" style={styles.friendCard}>
      <View style={styles.friendRow}>
        <View style={styles.friendAvatar}>
          <Ionicons name="person" size={24} color="white" />
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          {item.email && <Text style={styles.friendDetail}>{item.email}</Text>}
          {item.phone && <Text style={styles.friendDetail}>{item.phone}</Text>}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFriend(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="person-remove" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </ModernCard>
  );

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <ModernCard variant="elevated" style={styles.requestCard}>
      <View style={styles.requestRow}>
        <View style={styles.requestAvatar}>
          <Ionicons name="person-add" size={24} color="#2891FF" />
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.senderName}</Text>
          <Text style={styles.requestText}>
            {item.recipientEmail
              ? `Envoyé à ${item.recipientEmail}`
              : item.recipientPhone
              ? `Envoyé au ${item.recipientPhone}`
              : "Veut vous ajouter en ami"}
          </Text>
          <Text style={styles.requestDate}>
            {new Date(item.createdAt).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleRespondRequest(item.id, "decline")}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRespondRequest(item.id, "accept")}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ModernCard>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#2891FF", "#8869FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="people" size={40} color="white" />
          </View>
          <Text style={styles.headerTitle}>Amis</Text>
          <Text style={styles.headerSubtitle}>
            {friends.length} ami{friends.length > 1 ? "s" : ""}
            {pendingRequests.length > 0 && ` • ${pendingRequests.length} demande${pendingRequests.length > 1 ? "s" : ""}`}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs avec indicateur animé */}
        <View style={styles.tabsWrapper}>
          <View
            style={styles.tabsContainer}
            onLayout={(event) => {
              const width = event.nativeEvent.layout.width;
              setTabWidth(width / 2 - 8); // Largeur d'un onglet moins le padding
            }}
          >
            <Animated.View
              style={[
                styles.tabBackground,
                {
                  width: tabWidth,
                  transform: [{
                    translateX: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, tabWidth + 8]
                    })
                  }]
                }
              ]}
            />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange("friends")}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === "friends" && styles.tabTextActive]}>
                Mes amis ({friends.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange("requests")}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === "requests" && styles.tabTextActive]}>
                Demandes ({pendingRequests.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ajouter un ami - uniquement sur l'onglet Mes amis */}
        {activeTab === "friends" && (
          <ModernCard variant="elevated" style={styles.addCard}>
            <Text style={styles.sectionTitle}>Ajouter un ami</Text>

            {/* Input unique qui détecte automatiquement email ou téléphone */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-add-outline" size={20} color="#616161" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email ou numéro de téléphone"
                placeholderTextColor="#9E9E9E"
                value={contactInput}
                onChangeText={setContactInput}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Bouton d'envoi en dessous */}
            <TouchableOpacity
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={handleSendRequest}
              disabled={sending || !contactInput.trim()}
              activeOpacity={0.8}
            >
              {sending ? (
                <>
                  <Ionicons name="hourglass" size={18} color="white" />
                  <Text style={styles.sendButtonText}>Envoi en cours...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="person-add" size={16} color="white" />
                <Text style={styles.sendButtonText}>Envoyer la demande</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.hintText}>
            Entrez une adresse email ou un numéro de téléphone pour envoyer une demande d'ami.
          </Text>
        </ModernCard>
        )}

        {/* Liste */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : activeTab === "friends" ? (
          <>
            {friends.length === 0 ? (
              <ModernCard variant="elevated" style={styles.emptyCard}>
                <Ionicons name="people-outline" size={64} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>Aucun ami</Text>
                <Text style={styles.emptyMessage}>
                  Ajoutez des amis pour partager vos voyages avec eux !
                </Text>
              </ModernCard>
            ) : (
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.list}
              />
            )}
          </>
        ) : (
          <>
            {pendingRequests.length === 0 ? (
              <ModernCard variant="elevated" style={styles.emptyCard}>
                <Ionicons name="mail-unread-outline" size={64} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>Aucune demande</Text>
                <Text style={styles.emptyMessage}>
                  Vous n'avez aucune demande d'ami en attente.
                </Text>
              </ModernCard>
            ) : (
              <FlatList
                data={pendingRequests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.list}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  tabsWrapper: {
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9E9E9E",
  },
  tabTextActive: {
    color: "#2891FF",
  },
  tabBackground: {
    position: "absolute",
    top: 4,
    height: 36,
    backgroundColor: "#EBF3FF",
    borderRadius: 10,
  },
  addCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#212121",
  },
  sendButtonInline: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#2891FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2891FF",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  hintText: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 8,
    textAlign: "center",
  },
  friendCard: {
    padding: 16,
    marginBottom: 12,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2891FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  friendDetail: {
    fontSize: 13,
    color: "#616161",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },
  requestCard: {
    padding: 16,
    marginBottom: 12,
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  requestText: {
    fontSize: 13,
    color: "#616161",
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#34C759",
  },
  declineButton: {
    backgroundColor: "#FF3B30",
  },
  list: {
    paddingBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#616161",
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#616161",
    textAlign: "center",
  },
});

export default FriendsScreen;
