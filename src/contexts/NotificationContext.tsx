import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TripInvitation } from "../types";
import { useTrips } from "./TripsContext";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  invitations: TripInvitation[];
  unreadCount: number;
  readIds: Set<string>;
  loadInvitations: () => Promise<void>;
  markAsRead: (invitationId: string) => void;
  markAllAsRead: () => void;
  refreshInvitations: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

const readStorageKey = (userId: string) => `notifications_read_${userId}`;

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { getUserInvitations } = useTrips();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPersistedReadIds().then(() => loadInvitations());
    } else {
      // Reset all state on logout so the next user starts fresh
      setInvitations([]);
      setUnreadCount(0);
      setReadIds(new Set());
    }
  }, [user]);

  const loadPersistedReadIds = async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(readStorageKey(user.id));
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore storage errors
    }
  };

  const persistReadIds = async (ids: Set<string>) => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(
        readStorageKey(user.id),
        JSON.stringify(Array.from(ids))
      );
    } catch {
      // ignore storage errors
    }
  };

  const invId = (inv: any): string =>
    inv._id ?? inv.id ?? inv.token ?? "";

  const loadInvitations = async () => {
    if (!user) return;

    try {
      const pendingInvitations = await getUserInvitations(user.email, "pending");
      // Snapshot readIds from current state to avoid stale-closure issues
      setReadIds((currentReadIds) => {
        const markedInvitations = pendingInvitations.map((inv: TripInvitation) => ({
          ...inv,
          read: currentReadIds.has(invId(inv)),
        }));
        setInvitations(markedInvitations);
        const unread = markedInvitations.filter((inv: TripInvitation) => !inv.read).length;
        setUnreadCount(unread);
        return currentReadIds;
      });
    } catch (error) {
      console.error("Error loading invitations:", error);
    }
  };

  const markAsRead = (invitationId: string) => {
    const updated = new Set(readIds);
    updated.add(invitationId);
    setReadIds(updated);
    persistReadIds(updated);

    setInvitations((prev) =>
      prev.map((invitation) =>
        invId(invitation) === invitationId
          ? { ...invitation, read: true }
          : invitation
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const updated = new Set(readIds);
    invitations.forEach((inv) => updated.add(invId(inv)));
    setReadIds(updated);
    persistReadIds(updated);

    setInvitations((prev) =>
      prev.map((invitation) => ({ ...invitation, read: true }))
    );
    setUnreadCount(0);
  };

  const refreshInvitations = async () => {
    await loadInvitations();
  };

  const value: NotificationContextType = useMemo(
    () => ({ invitations, unreadCount, readIds, loadInvitations, markAsRead, markAllAsRead, refreshInvitations }),
    [invitations, unreadCount, readIds], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
