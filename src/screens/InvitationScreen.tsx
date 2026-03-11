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
  const initialToken = route.params?.token;
  const { t } = useTranslation();
  const { respondToInvitation, getInvitationByToken, getUserInvitations } = useTrips();
  const { user } = useAuth();

  const [currentToken, setCurrentToken] = useState<string | undefined>(initialToken);
  const [invitation, setInvitation] = useState<any>(null);
  const [enrichedInvitations, setEnrichedInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    if (currentToken) {
      loadInvitation();
    } else {
      loadAllInvitations();
    }
  }, [currentToken]);

  // Mettre à jour le token quand les paramètres de route changent (deep link)
  useEffect(() => {
    if (route.params?.token && route.params.token !== currentToken) {
      setCurrentToken(route.params.token);
    }
  }, [route.params?.token]);

  const loadAllInvitations = async () => {
    try {
      setLoading(true);
      // Récupérer les invitations enrichies depuis l'API
      if (user?.email) {
        const invitations = await getUserInvitations(user.email);
        // Trier: pending > accepted > declined
        const sortedInvitations = invitations.sort((a: any, b: any) => {
          const statusOrder = { pending: 0, accepted: 1, declined: 2 };
          const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
          const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
          if (statusA !== statusB) {
            return statusA - statusB;
          }
          // Si même statut, trier par date (plus récent en premier)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setEnrichedInvitations(sortedInvitations);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading invitations:", error);
      setLoading(false);
    }
  };

  const loadInvitation = async () => {
    try {
      setLoading(true);

      // Appel API pour récupérer l'invitation par token
      const invitationData = await getInvitationByToken(currentToken);

      setInvitation(invitationData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading invitation:", error);
      Alert.alert(t("common.error"), t("invitation.loadingError"));
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    // Si l'utilisateur n'est pas connecté, rediriger vers l'authentification
    if (!user) {
      Alert.alert(
        t("common.loginRequired"),
        t("invitation.loginToAccept"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.login"),
            onPress: () => navigation.navigate("Auth" as never),
          },
        ]
      );
      return;
    }

    try {
      setResponding(true);

      const success = await respondToInvitation(currentToken, "accept", user.id);

      if (success) {
        Alert.alert(t("invitation.accepted"), t("invitation.acceptedMessage"), [
          {
            text: t("common.ok"),
            onPress: () => navigation.navigate("Main" as never),
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
              currentToken,
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
                    onPress: () => navigation.navigate("Main" as never),
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
  if (!currentToken) {
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
              {enrichedInvitations.length} {enrichedInvitations.length > 1 ? 'invitations' : 'invitation'}
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
          ) : enrichedInvitations.length === 0 ? (
            <ModernCard variant="elevated" style={styles.emptyCard}>
              <Ionicons name="mail-outline" size={64} color="#BDBDBD" />
              <Text style={styles.emptyTitle}>{t("profile.noInvitations")}</Text>
              <Text style={styles.emptyMessage}>
                Vous n'avez aucune invitation en attente pour le moment.
              </Text>
            </ModernCard>
          ) : (
            <>
              {/* Filtres */}
              <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[styles.filterButton, statusFilter === 'all' && styles.filterButtonActive]}
                    onPress={() => setStatusFilter('all')}
                  >
                    <Text style={[styles.filterButtonText, statusFilter === 'all' && styles.filterButtonTextActive]}>
                      Toutes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterButton, statusFilter === 'pending' && styles.filterButtonActive]}
                    onPress={() => setStatusFilter('pending')}
                  >
                    <Text style={[styles.filterButtonText, statusFilter === 'pending' && styles.filterButtonTextActive]}>
                      En attente
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterButton, statusFilter === 'accepted' && styles.filterButtonActive]}
                    onPress={() => setStatusFilter('accepted')}
                  >
                    <Text style={[styles.filterButtonText, statusFilter === 'accepted' && styles.filterButtonTextActive]}>
                      Acceptées
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterButton, statusFilter === 'declined' && styles.filterButtonActive]}
                    onPress={() => setStatusFilter('declined')}
                  >
                    <Text style={[styles.filterButtonText, statusFilter === 'declined' && styles.filterButtonTextActive]}>
                      Refusées
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Liste des invitations filtrées */}
              {enrichedInvitations
                .filter(inv => statusFilter === 'all' || inv.status === statusFilter)
                .map((inv) => (
              <ModernCard key={inv.id || inv._id} variant="elevated" style={styles.invitationListItem}>
                {/* En-tête avec inviteur et statut */}
                <View style={styles.listItemHeader}>
                  <View style={styles.inviterAvatarSmall}>
                    <Ionicons name="person" size={20} color="white" />
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemInviter}>
                      {inv.inviter?.name || "Quelqu'un"}
                    </Text>
                    <Text style={styles.listItemDate}>vous a invité • {formatDate(inv.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge,
                    inv.status === 'accepted' && styles.statusBadgeAccepted,
                    inv.status === 'declined' && styles.statusBadgeDeclined,
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      inv.status === 'accepted' && styles.statusBadgeTextAccepted,
                      inv.status === 'declined' && styles.statusBadgeTextDeclined,
                    ]}>
                      {inv.status === 'pending' ? 'En attente' :
                       inv.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                    </Text>
                  </View>
                </View>

                {/* Infos du voyage */}
                {inv.trip && (
                  <View style={styles.tripPreview}>
                    <View style={styles.tripPreviewHeader}>
                      <Ionicons name="airplane" size={18} color="#2891FF" />
                      <Text style={styles.tripPreviewTitle}>{inv.trip.title}</Text>
                    </View>
                    <View style={styles.tripPreviewDetails}>
                      <View style={styles.tripPreviewDetailRow}>
                        <Ionicons name="location" size={14} color="#666" />
                        <Text style={styles.tripPreviewDetailText}>{inv.trip.destination}</Text>
                      </View>
                      {inv.trip.startDate && inv.trip.endDate && (
                        <View style={styles.tripPreviewDetailRow}>
                          <Ionicons name="calendar" size={14} color="#666" />
                          <Text style={styles.tripPreviewDetailText}>
                            {formatDate(new Date(inv.trip.startDate))} - {formatDate(new Date(inv.trip.endDate))}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Actions rapides si en attente */}
                {inv.status === 'pending' && (
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.quickActionDecline}
                      onPress={() => {
                        setCurrentToken(inv.token);
                      }}
                    >
                      <Ionicons name="close-circle" size={18} color="#FF3B30" />
                      <Text style={styles.quickActionDeclineText}>Refuser</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickActionAccept}
                      onPress={() => {
                        setCurrentToken(inv.token);
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="white" />
                      <Text style={styles.quickActionAcceptText}>Voir & Accepter</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ModernCard>
              ))}
              {enrichedInvitations.filter(inv => statusFilter === 'all' || inv.status === statusFilter).length === 0 && (
                <ModernCard variant="elevated" style={styles.emptyCard}>
                  <Ionicons name="mail-outline" size={64} color="#BDBDBD" />
                  <Text style={styles.emptyTitle}>Aucune invitation</Text>
                  <Text style={styles.emptyMessage}>
                    {statusFilter === 'pending' ? 'Aucune invitation en attente.' :
                     statusFilter === 'accepted' ? 'Aucune invitation acceptée.' :
                     statusFilter === 'declined' ? 'Aucune invitation refusée.' :
                     'Vous n\'avez aucune invitation.'}
                  </Text>
                </ModernCard>
              )}
            </>
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
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.cardContainer}>
          <ModernCard variant="elevated" style={styles.invitationCard}>
          <View style={styles.invitationHeader}>
            <View style={styles.inviterAvatar}>
              <Ionicons name="person" size={32} color="white" />
            </View>
            <View style={styles.inviterInfo}>
              <Text style={styles.inviterName}>
                {invitation.inviter?.name || t("invitation.someone")}
              </Text>
              <Text style={styles.inviterEmail}>
                {invitation.inviter?.email || ""}
              </Text>
            </View>
          </View>

          <View style={styles.invitationContent}>
            <Text style={styles.invitationTitle}>
              {t("invitation.invitationTitle")}
            </Text>
            <Text style={styles.tripTitle}>
              {invitation.trip?.title || t("invitation.trip")}
            </Text>
            <Text style={styles.tripDestination}>
              {invitation.trip?.destination || ""}
            </Text>
            {invitation.trip?.startDate && invitation.trip?.endDate && (
              <Text style={styles.tripDates}>
                {formatDate(new Date(invitation.trip.startDate))} -{" "}
                {formatDate(new Date(invitation.trip.endDate))}
              </Text>
            )}
          </View>

          <View style={styles.invitationDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color="#2891FF" />
              <Text style={styles.detailText}>
                {t("invitation.sentTo")} {user?.name || invitation.inviteeEmail}
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
        </View>
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
  },
  cardContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
  statusBadgeTextAccepted: {
    color: "#34C759",
  },
  statusBadgeTextDeclined: {
    color: "#FF3B30",
  },
  listItemInviter: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  tripPreview: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  tripPreviewHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  tripPreviewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2891FF",
    marginLeft: 6,
  },
  tripPreviewDetails: {
    gap: 4,
  },
  tripPreviewDetailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  tripPreviewDetailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  quickActions: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 12,
  },
  quickActionDecline: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#FFF5F5",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFEBEE",
  },
  quickActionDeclineText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
    marginLeft: 6,
  },
  quickActionAccept: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#2891FF",
    paddingVertical: 10,
    borderRadius: 10,
  },
  quickActionAcceptText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 6,
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
  // Styles pour les filtres
  filtersContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2891FF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#616161',
  },
  filterButtonTextActive: {
    color: 'white',
  },
});

export default InvitationScreen;
