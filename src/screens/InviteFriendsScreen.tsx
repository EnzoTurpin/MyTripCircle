import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip, User } from "../types";
import { useTranslation } from "react-i18next";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";

type InviteFriendsScreenRouteProp = RouteProp<
  RootStackParamList,
  "InviteFriends"
>;
type InviteFriendsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "InviteFriends"
>;

const InviteFriendsScreen: React.FC = () => {
  const route = useRoute<InviteFriendsScreenRouteProp>();
  const navigation = useNavigation<InviteFriendsScreenNavigationProp>();
  const { tripId } = route.params;
  const { t } = useTranslation();
  const { getTripById, createInvitation } = useTrips();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingInvitations, setSendingInvitations] = useState(false);

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les données du trip depuis le contexte
      const tripData = getTripById(tripId);
      if (tripData) {
        setTrip(tripData);
      }

      // Pour l'instant, utiliser des données mock pour les amis
      // Dans une vraie app, vous feriez un appel API pour récupérer les amis de l'utilisateur
      const mockFriends: User[] = [
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          avatar: "https://example.com/avatar1.jpg",
          createdAt: new Date(),
        },
        {
          id: "3",
          name: "Mike Chen",
          email: "mike@example.com",
          avatar: "https://example.com/avatar2.jpg",
          createdAt: new Date(),
        },
        {
          id: "4",
          name: "Emma Wilson",
          email: "emma@example.com",
          avatar: "https://example.com/avatar3.jpg",
          createdAt: new Date(),
        },
        {
          id: "5",
          name: "David Brown",
          email: "david@example.com",
          avatar: "https://example.com/avatar4.jpg",
          createdAt: new Date(),
        },
      ];

      setFriends(mockFriends);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert(t("common.error"), t("inviteFriends.loadingError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriend = (friendId: string) => {
    if (invitedFriends.includes(friendId)) {
      setInvitedFriends(invitedFriends.filter((id) => id !== friendId));
    } else {
      setInvitedFriends([...invitedFriends, friendId]);
    }
  };

  const handleInviteByEmail = async () => {
    if (!emailInput.trim()) {
      Alert.alert(t("inviteFriends.error"), t("inviteFriends.enterEmailError"));
      return;
    }

    if (!user || !trip) {
      Alert.alert(t("common.error"), t("inviteFriends.userNotFound"));
      return;
    }

    try {
      setSendingInvitations(true);

      await createInvitation({
        tripId: trip.id,
        inviteeEmail: emailInput.trim(),
        message: `${t("inviteFriends.invitationMessage")} "${trip.title}"`,
        permissions: {
          role: "editor",
          canEdit: true,
          canInvite: false,
          canDelete: false,
        },
      });

      Alert.alert(
        t("inviteFriends.invitationSent"),
        `${t("inviteFriends.invitationSentTo")} ${emailInput}`,
        [{ text: t("common.ok") }],
      );
      setEmailInput("");
    } catch (error) {
      console.error("Error sending invitation:", error);
      Alert.alert(
        t("common.error"),
        (error as Error)?.message || t("inviteFriends.invitationError"),
      );
    } finally {
      setSendingInvitations(false);
    }
  };

  const handleSendInvitations = async () => {
    if (invitedFriends.length === 0) {
      Alert.alert(
        t("inviteFriends.noFriendsSelected"),
        t("inviteFriends.selectFriendsToInvite"),
      );
      return;
    }

    if (!user || !trip) {
      Alert.alert(t("common.error"), t("inviteFriends.userNotFound"));
      return;
    }

    try {
      setSendingInvitations(true);

      // Envoyer les invitations en parallèle
      const invitationPromises = invitedFriends.map((friendId) => {
        const friend = friends.find((f) => f.id === friendId);
        if (!friend) return Promise.resolve();

        return createInvitation({
          tripId: trip.id,
          inviterId: user.id,
          inviteeEmail: friend.email,
          message: `${t("inviteFriends.invitationMessage")} "${trip.title}"`,
          permissions: {
            role: "editor",
            canEdit: true,
            canInvite: false,
            canDelete: false,
          },
        });
      });

      await Promise.all(invitationPromises);

      Alert.alert(
        t("inviteFriends.invitationsSent"),
        `${t("inviteFriends.invitationsSentTo")} ${invitedFriends.length}`,
        [{ text: t("common.ok"), onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error("Error sending invitations:", error);
      Alert.alert(
        t("common.error"),
        (error as Error)?.message || t("inviteFriends.invitationError"),
      );
    } finally {
      setSendingInvitations(false);
    }
  };

  const renderFriendItem = ({ item }: { item: User }) => {
    const isInvited = invitedFriends.includes(item.id);
    const isAlreadyCollaborator = !!trip?.collaborators?.some(
      (c) => c.userId === item.id,
    );

    return (
      <ModernCard
        variant="outlined"
        style={[
          styles.friendCard,
          isInvited ? styles.friendCardSelected : {},
          isAlreadyCollaborator ? styles.friendCardDisabled : {},
        ]}
        onPress={() => !isAlreadyCollaborator && handleInviteFriend(item.id)}
        disabled={isAlreadyCollaborator}
      >
        <View style={styles.friendRow}>
          <View style={styles.friendAvatar}>
            <Ionicons name="person" size={20} color="white" />
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.name}</Text>
            <Text style={styles.friendEmail}>{item.email}</Text>
          </View>
          <View style={styles.friendStatus}>
            {isAlreadyCollaborator ? (
              <View style={styles.collaboratorBadge}>
                <Text style={styles.collaboratorText}>
                  {t("inviteFriends.member")}
                </Text>
              </View>
            ) : isInvited ? (
              <Ionicons name="checkmark-circle" size={22} color="#34C759" />
            ) : (
              <Ionicons name="add-circle-outline" size={22} color="#2891FF" />
            )}
          </View>
        </View>
      </ModernCard>
    );
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("inviteFriends.loading")}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.containerContent}
        >
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
                <Ionicons name="person-add" size={40} color="white" />
              </View>
              <Text style={styles.headerTitle}>
                {t("inviteFriends.header")}
              </Text>
              <Text style={styles.headerSubtitle}>
                {t("inviteFriends.subtitle")} "{trip?.title}"
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <ModernCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {t("inviteFriends.inviteByEmail")}
              </Text>
              <View style={styles.emailInputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#616161"
                  style={styles.emailInputIcon}
                />
                <TextInput
                  style={styles.emailInput}
                  placeholder={t("inviteFriends.enterEmail")}
                  placeholderTextColor="#9E9E9E"
                  value={emailInput}
                  onChangeText={setEmailInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[
                    styles.inviteButton,
                    sendingInvitations && styles.inviteButtonDisabled,
                  ]}
                  onPress={handleInviteByEmail}
                  disabled={sendingInvitations}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={sendingInvitations ? "hourglass" : "send"}
                    size={18}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </ModernCard>

            <ModernCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {t("inviteFriends.friends")}
              </Text>
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.friendsList}
              />
            </ModernCard>

            {invitedFriends.length > 0 && (
              <ModernCard variant="elevated" style={styles.selectedFriendsCard}>
                <Text style={styles.selectedFriendsTitle}>
                  {t("inviteFriends.selectedFriends")} ({invitedFriends.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {invitedFriends.map((friendId) => {
                    const friend = friends.find((f) => f.id === friendId);
                    return (
                      <View key={friendId} style={styles.selectedFriendChip}>
                        <Text style={styles.selectedFriendText}>
                          {friend?.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleInviteFriend(friendId)}
                        >
                          <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </ModernCard>
            )}
            {invitedFriends.length > 0 && (
              <View style={styles.bottomActions}>
                <ModernButton
                  title={
                    sendingInvitations
                      ? t("inviteFriends.sendingInvitations")
                      : `${t("inviteFriends.sendInvitations")} (${invitedFriends.length})`
                  }
                  onPress={handleSendInvitations}
                  variant="primary"
                  gradient
                  size="large"
                  icon={sendingInvitations ? "hourglass" : "send"}
                  disabled={sendingInvitations}
                  fullWidth
                />
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  containerContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#FAFAFA",
  },
  loadingText: {
    fontSize: 16,
    color: "#616161",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: 120,
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
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    marginTop: -100,
    paddingBottom: 24,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#212121",
    marginBottom: 12,
  },
  emailInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
  },
  emailInputIcon: {
    marginRight: 12,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#212121",
  },
  inviteButton: {
    backgroundColor: "#2891FF",
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  inviteButtonDisabled: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    padding: 16,
  },
  friendCardSelected: {
    backgroundColor: "#E8F4FF",
    borderColor: "#CFE7FF",
  },
  friendCardDisabled: {
    opacity: 0.5,
  },
  friendRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2891FF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 15,
    shadowColor: "#2891FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
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
  friendEmail: {
    fontSize: 14,
    color: "#616161",
  },
  friendStatus: {
    marginLeft: 10,
  },
  collaboratorBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  collaboratorText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "700",
  },
  selectedFriendsTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 15,
  },
  selectedFriendsCard: {
    marginBottom: 20,
  },
  selectedFriendChip: {
    backgroundColor: "#007AFF",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  selectedFriendText: {
    color: "white",
    fontSize: 14,
    marginRight: 8,
  },
  bottomActions: {
    backgroundColor: "white",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
});

export default InviteFriendsScreen;
