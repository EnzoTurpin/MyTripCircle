import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FriendRequest, Friend, FriendSuggestion } from "../types";
import { ApiService } from "../services/ApiService";
import { useAuth } from "./AuthContext";

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  suggestions: FriendSuggestion[];
  loading: boolean;
  sendFriendRequest: (data: { recipientEmail?: string; recipientPhone?: string }) => Promise<{ autoAccepted?: boolean }>;
  respondToFriendRequest: (requestId: string, action: "accept" | "decline") => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshFriendRequests: () => Promise<void>;
  refreshSuggestions: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
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
      const seen = new Set<string>();
      const deduped = data.filter((r: FriendRequest) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
      setFriendRequests(deduped);
    } catch (error) {
      console.error("Error loading friend requests:", error);
    }
  };

  const refreshSuggestions = async () => {
    if (!user) return;
    try {
      const data = await ApiService.getFriendSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([refreshFriends(), refreshFriendRequests(), refreshSuggestions()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const sendFriendRequest = async (data: { recipientEmail?: string; recipientPhone?: string }): Promise<{ autoAccepted?: boolean }> => {
    try {
      const result = await ApiService.sendFriendRequest(data);
      // Optimistically remove from suggestions immediately
      if (data.recipientEmail) {
        setSuggestions((prev) => prev.filter((s) => s.email !== data.recipientEmail));
      }
      // Refresh en arrière-plan — ne pas bloquer la navigation
      if (result?.autoAccepted) {
        Promise.all([refreshFriends(), refreshFriendRequests(), refreshSuggestions()]).catch(() => {});
      } else {
        Promise.all([refreshFriendRequests(), refreshSuggestions()]).catch(() => {});
      }
      return result || {};
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  };

  const respondToFriendRequest = async (requestId: string, action: "accept" | "decline") => {
    try {
      await ApiService.respondToFriendRequest(requestId, action);
      await Promise.all([refreshFriends(), refreshFriendRequests(), refreshSuggestions()]);
    } catch (error) {
      console.error("Error responding to friend request:", error);
      throw error;
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    try {
      await ApiService.cancelFriendRequest(requestId);
      await refreshFriendRequests();
    } catch (error) {
      console.error("Error canceling friend request:", error);
      throw error;
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await ApiService.removeFriend(friendId);
      await Promise.all([refreshFriends(), refreshSuggestions()]);
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
        suggestions,
        loading,
        sendFriendRequest,
        respondToFriendRequest,
        cancelFriendRequest,
        removeFriend,
        refreshFriends,
        refreshFriendRequests,
        refreshSuggestions,
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
