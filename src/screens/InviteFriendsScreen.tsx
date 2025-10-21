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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip, User } from "../types";

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

  const [trip, setTrip] = useState<Trip | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    // Simulate loading trip and friends data
    setTimeout(() => {
      const mockTrip: Trip = {
        id: tripId,
        title: "Paris Adventure",
        description: "A romantic getaway to the City of Light",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-22"),
        destination: "Paris, France",
        ownerId: "1",
        collaborators: ["2", "3"],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

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

      setTrip(mockTrip);
      setFriends(mockFriends);
      setLoading(false);
    }, 1000);
  };

  const handleInviteFriend = (friendId: string) => {
    if (invitedFriends.includes(friendId)) {
      setInvitedFriends(invitedFriends.filter((id) => id !== friendId));
    } else {
      setInvitedFriends([...invitedFriends, friendId]);
    }
  };

  const handleInviteByEmail = () => {
    if (!emailInput.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    Alert.alert("Invitation Sent", `Invitation sent to ${emailInput}`, [
      { text: "OK" },
    ]);
    setEmailInput("");
  };

  const handleSendInvitations = () => {
    if (invitedFriends.length === 0) {
      Alert.alert("No Friends Selected", "Please select friends to invite");
      return;
    }

    Alert.alert(
      "Invitations Sent",
      `Invitations sent to ${invitedFriends.length} friend(s)`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const renderFriendItem = ({ item }: { item: User }) => {
    const isInvited = invitedFriends.includes(item.id);
    const isAlreadyCollaborator = trip?.collaborators.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.friendItem,
          isInvited && styles.friendItemSelected,
          isAlreadyCollaborator && styles.friendItemDisabled,
        ]}
        onPress={() => !isAlreadyCollaborator && handleInviteFriend(item.id)}
        disabled={isAlreadyCollaborator}
      >
        <View style={styles.friendAvatar}>
          <Ionicons name="person" size={24} color="white" />
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendEmail}>{item.email}</Text>
        </View>
        <View style={styles.friendStatus}>
          {isAlreadyCollaborator ? (
            <View style={styles.collaboratorBadge}>
              <Text style={styles.collaboratorText}>Member</Text>
            </View>
          ) : isInvited ? (
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          ) : (
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <Text style={styles.headerSubtitle}>
          Invite friends to collaborate on "{trip?.title}"
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite by Email</Text>
          <View style={styles.emailContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter email address"
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleInviteByEmail}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {invitedFriends.length > 0 && (
          <View style={styles.selectedFriendsContainer}>
            <Text style={styles.selectedFriendsTitle}>
              Selected Friends ({invitedFriends.length})
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
          </View>
        )}
      </ScrollView>

      {invitedFriends.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendInvitations}
          >
            <Ionicons name="send" size={20} color="white" />
            <Text style={styles.sendButtonText}>
              Send Invitations ({invitedFriends.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "white",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 15,
  },
  emailContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },
  inviteButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  friendItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  friendItemSelected: {
    backgroundColor: "#E3F2FD",
  },
  friendItemDisabled: {
    opacity: 0.5,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: "#666",
  },
  friendStatus: {
    marginLeft: 10,
  },
  collaboratorBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  collaboratorText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  selectedFriendsContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedFriendsTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 15,
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
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold" as const,
    marginLeft: 8,
  },
});

export default InviteFriendsScreen;
