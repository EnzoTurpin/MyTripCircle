import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { API_URLS } from "../config/api";
import { useTranslation } from "react-i18next";

type TripsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const TripsScreen: React.FC = () => {
  const navigation = useNavigation<TripsScreenNavigationProp>();
  const { trips, loading } = useTrips();
  const { t } = useTranslation();

  const handleCreateTrip = () => {
    Alert.alert(t("trips.createNewTripTitle"), t("trips.featureSoon"), [
      { text: t("common.ok") },
    ]);
  };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate("TripDetails", { tripId: trip.id });
  };

  const handleInviteFriends = (trip: Trip) => {
    navigation.navigate("InviteFriends", { tripId: trip.id });
  };

  const testAPI = async () => {
    const urls = API_URLS.map((url) => `${url}/test`);

    for (const url of urls) {
      try {
        console.log(`[Test] Trying ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        Alert.alert(
          t("trips.apiTestSuccess"),
          `URL: ${url}\nResponse: ${JSON.stringify(data, null, 2)}`
        );
        return;
      } catch (error) {
        console.log(`[Test] Failed ${url}: ${error.message}`);
      }
    }

    Alert.alert(t("trips.apiTestFailed"), t("trips.apiTestError"));
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }

      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => handleTripPress(item)}
    >
      <LinearGradient
        colors={["#007AFF", "#5856D6"]}
        style={styles.tripGradient}
      >
        <View style={styles.tripHeader}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripTitle}>{item.title}</Text>
            <Text style={styles.tripDestination}>{item.destination}</Text>
            <Text style={styles.tripDates}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => handleInviteFriends(item)}
          >
            <Ionicons name="person-add" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {item.description && (
          <Text style={styles.tripDescription}>{item.description}</Text>
        )}
        <View style={styles.tripFooter}>
          <View style={styles.collaboratorsInfo}>
            <Ionicons
              name="people"
              size={16}
              color="rgba(255, 255, 255, 0.8)"
            />
            <Text style={styles.collaboratorsText}>
              {(item.collaborators?.length || 0) + 1}{" "}
              {t("trips.membersSingular", {
                count: (item.collaborators?.length || 0) + 1,
              })}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255, 255, 255, 0.8)"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("trips.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("trips.header")}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.testButton} onPress={testAPI}>
            <Ionicons name="bug" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateTrip}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="airplane-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>{t("trips.emptyTitle")}</Text>
          <Text style={styles.emptySubtitle}>{t("trips.emptySubtitle")}</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTrip}
          >
            <Text style={styles.createButtonText}>{t("trips.createTrip")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item, index) => item.id || `trip-${index}`}
          contentContainerStyle={styles.tripsList}
          showsVerticalScrollIndicator={false}
        />
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
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  testButton: {
    backgroundColor: "#FF9500",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center" as const,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  tripsList: {
    padding: 20,
  },
  tripCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripGradient: {
    padding: 20,
  },
  tripHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  tripDestination: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 5,
  },
  tripDates: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  inviteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  tripDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 15,
    lineHeight: 20,
  },
  tripFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
  },
  collaboratorsInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  collaboratorsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 5,
  },
});

export default TripsScreen;
