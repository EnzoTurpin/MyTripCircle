import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
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
import { formatDate } from "../utils/i18n";

type InvitationScreenRouteProp = RouteProp<RootStackParamList, "Invitation">;

type InvitationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Invitation"
>;

const InvitationScreen: React.FC = () => {
  const route = useRoute<InvitationScreenRouteProp>();
  const navigation = useNavigation<InvitationScreenNavigationProp>();
  const { token } = route.params;
  const { t } = useTranslation();
  const { respondToInvitation } = useTrips();
  const { user } = useAuth();

  const [invitation, setInvitation] = useState<TripInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

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
    <View style={styles.container}>
      <LinearGradient colors={["#007AFF", "#5856D6"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("invitation.title")}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.invitationCard}>
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
              <Ionicons name="mail" size={20} color="#666" />
              <Text style={styles.detailText}>
                {t("invitation.sentTo")} {invitation.inviteeEmail}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.detailText}>
                {t("invitation.sentOn")} {formatDate(invitation.createdAt)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="hourglass" size={20} color="#666" />
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
        </View>

        {canRespond && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={handleDeclineInvitation}
              disabled={responding}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text style={styles.actionButtonText}>
                {responding
                  ? t("invitation.processing")
                  : t("invitation.decline")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptInvitation}
              disabled={responding}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.actionButtonText}>
                {responding
                  ? t("invitation.processing")
                  : t("invitation.accept")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonHeader: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  invitationCard: {
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
  invitationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  inviterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  inviterInfo: {
    flex: 1,
  },
  inviterName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  inviterEmail: {
    fontSize: 14,
    color: "#666",
  },
  invitationContent: {
    marginBottom: 20,
  },
  invitationTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  tripDestination: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  tripDates: {
    fontSize: 14,
    color: "#999",
  },
  invitationDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  expiredText: {
    fontSize: 14,
    color: "#FF3B30",
    marginLeft: 10,
    fontWeight: "500",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
  },
  declineButton: {
    backgroundColor: "#FF3B30",
  },
  acceptButton: {
    backgroundColor: "#34C759",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default InvitationScreen;
