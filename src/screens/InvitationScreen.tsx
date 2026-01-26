import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, TripInvitation } from "../types";
import { useTranslation } from "react-i18next";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { formatDate } from "../utils/i18n";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";

type InvitationScreenRouteProp = RouteProp<RootStackParamList, "Invitation">;

type InvitationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Invitation"
>;

const InvitationScreen: React.FC = () => {
  const route = useRoute<InvitationScreenRouteProp>();
  const navigation = useNavigation<InvitationScreenNavigationProp>();
  const token = route.params?.token;
  const { t } = useTranslation();
  const { respondToInvitation } = useTrips();
  const { user } = useAuth();
  const { invitations: allInvitations, loadInvitations: refreshInvitations } = useNotifications();

  const [invitation, setInvitation] = useState<TripInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      loadAllInvitations();
    }
  }, [token]);

  const loadAllInvitations = async () => {
    try {
      setLoading(true);
      await refreshInvitations();
      setLoading(false);
    } catch (error) {
      console.error("Error loading invitations:", error);
      setLoading(false);
    }
  };

  const loadInvitation = async () => {
    try {
      setLoading(true);

      // Pour l'instant, simuler le chargement d'une invitation
      // Dans une vraie app, vous feriez un appel API pour récupérer l'invitation par token
      setTimeout(() => {
        const mockInvitation: TripInvitation = {
          id: "1",
          tripId: "trip1",
          inviterId: "user1",
          inviteeEmail: user?.email || "test@example.com",
          status: "pending",
          token: token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
          createdAt: new Date(),
        };

        setInvitation(mockInvitation);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading invitation:", error);
      Alert.alert(t("common.error"), t("invitation.loadingError"));
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !user) return;

    try {
      setResponding(true);

      const success = await respondToInvitation(token, "accept", user.id);

      if (success) {
        Alert.alert(t("invitation.accepted"), t("invitation.acceptedMessage"), [
          {
            text: t("common.ok"),
            onPress: () => navigation.navigate("Main"),
          },
        ]);
      } else {
        Alert.alert(t("common.error"), t("invitation.acceptError"));
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("invitation.acceptError")
      );
    } finally {
      setResponding(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    Alert.alert(t("invitation.declineTitle"), t("invitation.declineMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("invitation.decline"),
        style: "destructive",
        onPress: async () => {
          try {
            setResponding(true);

            const success = await respondToInvitation(
              token,
              "decline",
              user?.id
            );

            if (success) {
              Alert.alert(
                t("invitation.declined"),
                t("invitation.declinedMessage"),
                [
                  {
                    text: t("common.ok"),
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } else {
              Alert.alert(t("common.error"), t("invitation.declineError"));
            }
          } catch (error) {
            console.error("Error declining invitation:", error);
            Alert.alert(
              t("common.error"),
              error.message || t("invitation.declineError")
            );
          } finally {
            setResponding(false);
          }
        },
      },
    ]);
  };

  // Si pas de token, afficher la liste des invitations
  if (!token) {
    return (
      <View style={styles.wrapper}>
        <StatusBar barStyle="light-content" />
        <LinearGradient 
          colors={['#2891FF', '#8869FF']}
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
              <Ionicons name="mail" size={40} color="white" />
            </View>
            <Text style={styles.headerTitle}>{t("profile.invitations")}</Text>
            <Text style={styles.headerSubtitle}>
              {allInvitations.length} {allInvitations.length > 1 ? 'invitations' : 'invitation'}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={{ paddingTop: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          ) : allInvitations.length === 0 ? (
            <ModernCard variant="elevated" style={styles.emptyCard}>
              <Ionicons name="mail-outline" size={64} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>{t("profile.noInvitations")}</Text>
              <Text style={styles.emptyMessage}>
                Vous n'avez aucune invitation en attente pour le moment.
              </Text>
            </ModernCard>
          ) : (
            allInvitations.map((inv) => (
              <ModernCard key={inv.id} variant="elevated" style={styles.invitationListItem}>
                <View style={styles.listItemHeader}>
                  <View style={styles.inviterAvatarSmall}>
                    <Ionicons name="person" size={20} color="white" />
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>Invitation au voyage</Text>
                    <Text style={styles.listItemDate}>{formatDate(inv.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, 
                    inv.status === 'accepted' && styles.statusBadgeAccepted,
                    inv.status === 'declined' && styles.statusBadgeDeclined,
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {inv.status === 'pending' ? 'En attente' : 
                       inv.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => navigation.navigate('Invitation', { token: inv.token })}
                >
                  <Text style={styles.viewDetailsText}>Voir les détails</Text>
                  <Ionicons name="arrow-forward" size={16} color="#2891FF" />
                </TouchableOpacity>
              </ModernCard>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // Sinon, afficher les détails d'une invitation spécifique
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("invitation.loading")}</Text>
      </View>
    );
  }

  if (!invitation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>{t("invitation.notFound")}</Text>
        <Text style={styles.errorMessage}>
          {t("invitation.notFoundMessage")}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isExpired = new Date() > invitation.expiresAt;
  const canRespond = invitation.status === "pending" && !isExpired;

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={['#2891FF', '#8869FF']}
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
            <Ionicons name="mail-open" size={40} color="white" />
          </View>
          <Text style={styles.headerTitle}>{t("invitation.title")}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ModernCard variant="elevated" style={styles.invitationCard}>
          <View style={styles.invitationHeader}>
            <View style={styles.inviterAvatar}>
              <Ionicons name="person" size={32} color="white" />
            </View>
            <View style={styles.inviterInfo}>
              <Text style={styles.inviterName}>John Doe</Text>
              <Text style={styles.inviterEmail}>john@example.com</Text>
            </View>
          </View>

          <View style={styles.invitationContent}>
            <Text style={styles.invitationTitle}>
              {t("invitation.invitationTitle")}
            </Text>
            <Text style={styles.tripTitle}>"Paris Adventure"</Text>
            <Text style={styles.tripDestination}>Paris, France</Text>
            <Text style={styles.tripDates}>
              {formatDate(new Date("2024-03-15"))} -{" "}
              {formatDate(new Date("2024-03-22"))}
            </Text>
          </View>

          <View style={styles.invitationDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color="#2891FF" />
              <Text style={styles.detailText}>
                {t("invitation.sentTo")} {invitation.inviteeEmail}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#8869FF" />
              <Text style={styles.detailText}>
                {t("invitation.sentOn")} {formatDate(invitation.createdAt)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="hourglass" size={20} color="#FF9500" />
              <Text style={styles.detailText}>
                {t("invitation.expiresOn")} {formatDate(invitation.expiresAt)}
              </Text>
            </View>
          </View>

          {isExpired && (
            <View style={styles.expiredBanner}>
              <Ionicons name="time" size={20} color="#FF3B30" />
              <Text style={styles.expiredText}>{t("invitation.expired")}</Text>
            </View>
          )}

          {invitation.status !== "pending" && (
            <View style={styles.statusBanner}>
              <Ionicons
                name={
                  invitation.status === "accepted"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={20}
                color={invitation.status === "accepted" ? "#34C759" : "#FF3B30"}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      invitation.status === "accepted" ? "#34C759" : "#FF3B30",
                  },
                ]}
              >
                {invitation.status === "accepted"
                  ? t("invitation.statusAccepted")
                  : t("invitation.statusDeclined")}
              </Text>
            </View>
          )}
        </ModernCard>

        {canRespond && (
          <View style={styles.actionsContainer}>
            <ModernButton
              title={responding ? t("invitation.processing") : t("invitation.decline")}
              onPress={handleDeclineInvitation}
              variant="outline"
              size="large"
              icon="close-circle-outline"
              disabled={responding}
              style={styles.actionButton}
            />
            <ModernButton
              title={responding ? t("invitation.processing") : t("invitation.accept")}
              onPress={handleAcceptInvitation}
              variant="primary"
              gradient
              size="large"
              icon="checkmark-circle-outline"
              disabled={responding}
              style={styles.actionButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginTop: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: "#616161",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: "#2891FF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#2891FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
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
    marginTop: -20,
  },
  invitationCard: {
    marginBottom: 20,
  },
  invitationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  inviterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2891FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#2891FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  inviterInfo: {
    flex: 1,
  },
  inviterName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  inviterEmail: {
    fontSize: 14,
    color: "#616161",
  },
  invitationContent: {
    marginBottom: 20,
  },
  invitationTitle: {
    fontSize: 16,
    color: "#616161",
    marginBottom: 12,
    fontWeight: "500",
  },
  tripTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 8,
  },
  tripDestination: {
    fontSize: 16,
    color: "#616161",
    marginBottom: 8,
  },
  tripDates: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  invitationDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 20,
    marginTop: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#212121",
    marginLeft: 12,
    flex: 1,
  },
  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  expiredText: {
    fontSize: 14,
    color: "#FF3B30",
    marginLeft: 12,
    fontWeight: "600",
    flex: 1,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 12,
    fontWeight: "600",
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
  },
  // Styles pour la liste des invitations
  emptyCard: {
    alignItems: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: "#616161",
    textAlign: "center",
    lineHeight: 22,
  },
  invitationListItem: {
    marginBottom: 16,
    padding: 16,
  },
  listItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  inviterAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2891FF",
    justifyContent: "center",
    alignItems: "center",
  },
  listItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  listItemDate: {
    fontSize: 13,
    color: "#616161",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#FFF3E0",
  },
  statusBadgeAccepted: {
    backgroundColor: "#E8F5E9",
  },
  statusBadgeDeclined: {
    backgroundColor: "#FFEBEE",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF9500",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2891FF",
    marginRight: 4,
  },
});

export default InvitationScreen;
