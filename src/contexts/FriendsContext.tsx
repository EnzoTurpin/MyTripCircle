import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FriendRequest, Friend } from "../types";
import { ApiService } from "../services/ApiService";
import { useAuth } from "./AuthContext";

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  loading: boolean;
  sendFriendRequest: (data: { recipientEmail?: string; recipientPhone?: string }) => Promise<void>;
  respondToFriendRequest: (requestId: string, action: "accept" | "decline") => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshFriendRequests: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFriends = async () => {
    if (!user) return;
    try {
      const data = await ApiService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  const refreshFriendRequests = async () => {
    if (!user) return;
    try {
      const data = await ApiService.getFriendRequests();
      setFriendRequests(data);
    } catch (error) {
      console.error("Error loading friend requests:", error);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([refreshFriends(), refreshFriendRequests()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const sendFriendRequest = async (data: { recipientEmail?: string; recipientPhone?: string }) => {
    try {
      await ApiService.sendFriendRequest(data);
      // Rafraîchir les demandes d'amis
      await refreshFriendRequests();
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  };

  const respondToFriendRequest = async (requestId: string, action: "accept" | "decline") => {
    try {
      await ApiService.respondToFriendRequest(requestId, action);
      // Rafraîchir les données
      await Promise.all([refreshFriends(), refreshFriendRequests()]);
    } catch (error) {
      console.error("Error responding to friend request:", error);
      throw error;
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await ApiService.removeFriend(friendId);
      await refreshFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  };

  return (
    <FriendsContext.Provider
      value={{
        friends,
        friendRequests,
        loading,
        sendFriendRequest,
        respondToFriendRequest,
        removeFriend,
        refreshFriends,
        refreshFriendRequests,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};
