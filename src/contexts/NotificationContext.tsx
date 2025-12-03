import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "react-native";
import { TripInvitation } from "../types";
import { useTrips } from "./TripsContext";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  invitations: TripInvitation[];
  unreadCount: number;
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

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { getUserInvitations } = useTrips();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    if (!user) return;

    try {
      const pendingInvitations = await getUserInvitations(
        user.email,
        "pending"
      );
      setInvitations(pendingInvitations);
      setUnreadCount(pendingInvitations.length);
    } catch (error) {
      console.error("Error loading invitations:", error);
    }
  };

  const markAsRead = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((invitation) =>
        invitation.id === invitationId
          ? { ...invitation, read: true }
          : invitation
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setInvitations((prev) =>
      prev.map((invitation) => ({ ...invitation, read: true }))
    );
    setUnreadCount(0);
  };

  const refreshInvitations = async () => {
    await loadInvitations();
  };

  // Fonction pour afficher une notification d'invitation
  const showInvitationNotification = (invitation: TripInvitation) => {
    Alert.alert(
      "Nouvelle invitation",
      `Vous avez été invité à collaborer sur un voyage`,
      [
        {
          text: "Voir plus tard",
          style: "cancel",
        },
        {
          text: "Voir l'invitation",
          onPress: () => {
            // Ici vous pourriez naviguer vers l'écran d'invitation
            // navigation.navigate("Invitation", { token: invitation.token });
          },
        },
      ]
    );
  };

  const value: NotificationContextType = {
    invitations,
    unreadCount,
    loadInvitations,
    markAsRead,
    markAllAsRead,
    refreshInvitations,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
