import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { API_URLS } from "../config/api";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/i18n";
import { ModernButton } from "../components/ModernButton";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";

type TripsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Main"
>;

const TripsScreen: React.FC = () => {
  const navigation = useNavigation<TripsScreenNavigationProp>();
  const { trips, loading, refreshData } = useTrips();

  // Rafraîchir les données quand l'écran reçoit le focus (avec useCallback pour éviter les boucles)
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Filtrer les voyages : tous les voyages maintenant
  const validatedTrips = trips;
  const draftTrips = trips.filter((trip) => trip.status === "draft");
  const { t } = useTranslation();

  const handleCreateTrip = () => {
    navigation.navigate("CreateTrip");
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

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => handleTripPress(item)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={item.status === "draft" ? ["#9E9E9E", "#757575"] : ["#2891FF", "#8869FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tripGradient}
      >
        {item.status === "draft" && (
          <View style={styles.draftBadge}>
            <Text style={styles.draftBadgeText}>Brouillon</Text>
          </View>
        )}
        <View style={styles.tripHeader}>
          <View style={styles.tripInfo}>
            <Text style={styles.tripTitle}>{item.title}</Text>
            <View style={styles.destinationRow}>
              <Ionicons
                name="location"
                size={16}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.tripDestination}>{item.destination}</Text>
            </View>
            <View style={styles.datesRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="rgba(255, 255, 255, 0.8)"
              />
              <Text style={styles.tripDates}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>
          {item.status !== "draft" && (
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => handleInviteFriends(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
        {item.description && (
          <Text style={styles.tripDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.tripFooter}>
          <View style={styles.collaboratorsInfo}>
            <View style={styles.avatarGroup}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={12} color="#2891FF" />
              </View>
              {(item.collaborators?.length || 0) > 0 && (
                <View style={[styles.avatar, styles.avatarOverlap]}>
                  <Ionicons name="person" size={12} color="#8869FF" />
                </View>
              )}
              {(item.collaborators?.length || 0) > 1 && (
                <View style={[styles.avatar, styles.avatarOverlap]}>
                  <Text style={styles.avatarText}>+{item.collaborators!.length - 1}</Text>
                </View>
              )}
            </View>
            <Text style={styles.collaboratorsText}>
              {t("trips.members", {
                count: (item.collaborators?.length || 0) + 1,
              })}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="rgba(255, 255, 255, 0.9)"
            />
          </View>
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
    <SwipeToNavigate currentIndex={0} totalTabs={4}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{t("trips.header")}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.testButton} onPress={testAPI} activeOpacity={0.7}>
                <Ionicons name="bug-outline" size={22} color="#212121" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleCreateTrip} activeOpacity={0.7}>
                <LinearGradient
                  colors={['#2891FF', '#8869FF']}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={26} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {validatedTrips.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="airplane-outline" size={64} color="#7EBDFF" />
              </View>
              <Text style={styles.emptyTitle}>{t("trips.emptyTitle")}</Text>
              <Text style={styles.emptySubtitle}>{t("trips.emptySubtitle")}</Text>
              <ModernButton
                title={t("trips.createTrip")}
                onPress={handleCreateTrip}
                variant="primary"
                gradient
                size="large"
                icon="add-circle-outline"
                style={styles.createButton}
              />
            </View>
          ) : (
            <FlatList
              data={validatedTrips}
              renderItem={renderTripCard}
              keyExtractor={(item, index) => item.id || `trip-${index}`}
              contentContainerStyle={styles.tripsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </SwipeToNavigate>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
  },
  headerButtons: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
  },
  testButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 9999,
    width: 44,
    height: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  addButton: {
    borderRadius: 9999,
    width: 44,
    height: 44,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 48,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F4FF',
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
    textAlign: "center" as const,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#616161',
    textAlign: "center" as const,
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    marginTop: 16,
  },
  tripsList: {
    padding: 24,
    paddingBottom: 100, // Espace pour la navbar floating
  },
  tripCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  tripGradient: {
    padding: 24,
  },
  draftBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  draftBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tripHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  tripInfo: {
    flex: 1,
    marginRight: 16,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  destinationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  tripDestination: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.95)",
    marginLeft: 4,
  },
  datesRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  tripDates: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    marginLeft: 4,
  },
  inviteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 9999,
    width: 44,
    height: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tripDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    lineHeight: 20,
  },
  tripFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    marginTop: 8,
  },
  collaboratorsInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  avatarGroup: {
    flexDirection: "row" as const,
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: '#2891FF',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2891FF',
  },
  collaboratorsText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: '500',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
});

export default TripsScreen;
