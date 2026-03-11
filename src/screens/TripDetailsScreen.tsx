import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  RootStackParamList,
  Trip,
  Booking,
  Address,
  Collaborator,
} from "../types";
import { useTrips } from "../contexts/TripsContext";
import ApiService from "../services/ApiService";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/i18n";
import BookingForm from "../components/BookingForm";
import { AddressForm } from "../components/AddressForm";
import { ModernCard } from "../components/ModernCard";
import { ModernButton } from "../components/ModernButton";

type TripDetailsScreenRouteProp = RouteProp<RootStackParamList, "TripDetails">;
type TripDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TripDetails"
>;

const TripDetailsScreen: React.FC = () => {
  const route = useRoute<TripDetailsScreenRouteProp>();
  const navigation = useNavigation<TripDetailsScreenNavigationProp>();
  const { tripId, showValidateButton = false } = route.params;
  const { t } = useTranslation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [collaboratorUsers, setCollaboratorUsers] = useState<Map<string, any>>(new Map());
  const {
    validateTrip,
    createBooking,
    createAddress,
  } = useTrips();
  const { user } = useAuth();

  // Vérifier si l'utilisateur est le propriétaire du voyage
  const isOwner = trip && user ? trip.ownerId === user.id : false;
  const userCollaborator = trip?.collaborators?.find(c => c.userId === user?.id);
  const canInvite = isOwner || userCollaborator?.permissions?.canInvite;

  // Charger les infos des collaborateurs
  useEffect(() => {
    const loadCollaboratorInfo = async () => {
      if (!trip) {
        return;
      }

      // Récupérer tous les IDs uniques : collaborators, owner, et invitedBy
      const idsToFetch = new Set<string>();

      // Ajouter les collaborateurs (sauf l'utilisateur actuel)
      if (trip.collaborators) {
        trip.collaborators.forEach(c => {
          if (c.userId !== user?.id) {
            idsToFetch.add(c.userId);
          }
          // Ajouter l'inviteur si différent
          if (c.invitedBy && c.invitedBy !== user?.id) {
            idsToFetch.add(c.invitedBy);
          }
        });
      }

      // Ajouter le propriétaire si différent de l'utilisateur actuel
      if (trip.ownerId && trip.ownerId !== user?.id) {
        idsToFetch.add(trip.ownerId);
      }

      if (idsToFetch.size === 0) {
        return;
      }

      try {
        const users = await ApiService.getUsersByIds(Array.from(idsToFetch));
        const usersMap = new Map();
        users.forEach((u: any) => {
          usersMap.set(u._id?.toString() || u.id, u);
        });
        setCollaboratorUsers(usersMap);
      } catch (error) {
        console.error("Error loading collaborator info:", error);
      }
    };

    loadCollaboratorInfo();
  }, [trip, user]);

  useFocusEffect(
    useCallback(() => {
      loadTripData();
    }, [tripId]),
  );

  const loadTripData = async () => {
    try {
      setLoading(true);
      // Charger les données depuis l'API pour avoir les données à jour
      const [tripData, bookingsData, addressesData] = await Promise.all([
        ApiService.getTripById(tripId),
        ApiService.getBookingsByTripId(tripId),
        ApiService.getAddressesByTripId(tripId),
      ]);

      // Mapper les données
      const mappedTrip: Trip = {
        id: tripData._id,
        title: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        startDate: new Date(tripData.startDate),
        endDate: new Date(tripData.endDate),
        ownerId: tripData.ownerId,
        collaborators: tripData.collaborators?.map((collab: any) => {
          if (typeof collab === "string") {
            return {
              userId: collab,
              role: "editor" as const,
              joinedAt: new Date(),
              permissions: {
                canEdit: true,
                canInvite: false,
                canDelete: false,
              },
            };
          }
          return {
            userId: collab.userId || collab,
            role: collab.role || "editor",
            joinedAt: collab.joinedAt ? new Date(collab.joinedAt) : new Date(),
            permissions: collab.permissions || {
              canEdit: true,
              canInvite: false,
              canDelete: false,
            },
            invitedBy: collab.invitedBy,
          };
        }) || [],
        isPublic: tripData.isPublic,
        visibility: tripData.visibility || (tripData.isPublic ? "public" : "private"),
        status: tripData.status || "draft",
        stats: tripData.stats || {
          totalBookings: 0,
          totalAddresses: 0,
          totalCollaborators: 0,
        },
        location: tripData.location || {
          type: "Point",
          coordinates: [0, 0],
        },
        tags: tripData.tags || [],
        createdAt: new Date(tripData.createdAt),
        updatedAt: new Date(tripData.updatedAt),
      };

      const mappedBookings: Booking[] = bookingsData.map((booking: any) => ({
        id: booking._id,
        tripId: booking.tripId,
        type: booking.type,
        title: booking.title,
        description: booking.description,
        date: new Date(booking.date),
        endDate: booking.endDate ? new Date(booking.endDate) : undefined,
        time: booking.time,
        address: booking.address,
        confirmationNumber: booking.confirmationNumber,
        price: booking.price,
        currency: booking.currency,
        status: booking.status,
        attachments: booking.attachments,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt),
      }));

      const mappedAddresses: Address[] = addressesData.map((address: any) => ({
        id: address._id,
        type: address.type,
        name: address.name,
        address: address.address,
        city: address.city,
        country: address.country,
        phone: address.phone,
        website: address.website,
        notes: address.notes,
        tripId: address.tripId,
        userId: address.userId,
        createdAt: new Date(address.createdAt),
        updatedAt: new Date(address.updatedAt),
      }));

      setTrip(mappedTrip);
      setBookings(mappedBookings);
      setAddresses(mappedAddresses);
    } catch (error) {
      console.error("Error loading trip data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteFriends = () => {
    navigation.navigate("InviteFriends", { tripId });
  };

  const handleEditTrip = () => {
    navigation.navigate("EditTrip", { tripId });
  };

  const handleAddBooking = () => {
    if (!trip) return;
    setShowBookingForm(true);
  };

  const handleSaveBooking = async (
    booking: Omit<Booking, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const newBooking = await createBooking({
        ...booking,
        tripId,
      });
      // Ajouter la nouvelle réservation à l'état local sans recharger depuis l'API
      setBookings((prev) => [...prev, newBooking]);
      setShowBookingForm(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert(
        t("common.error"),
        (error as Error).message ||
          "Erreur lors de la création de la réservation",
      );
    }
  };

  const handleAddAddress = () => {
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (
    addressData: Omit<Address, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newAddress = await createAddress({
      ...addressData,
      tripId, // Lier l'adresse au voyage actuel
    });
    // Ajouter la nouvelle adresse à l'état local sans recharger depuis l'API
    setAddresses((prev) => [...prev, newAddress]);
  };

  const handleValidateTrip = async () => {
    Alert.alert(
      t("tripDetails.validateTrip"),
      t("tripDetails.validateTripMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.validate"),
          style: "default",
          onPress: async () => {
            try {
              // Valider le voyage
              const validatedTrip = await validateTrip(tripId);
              if (validatedTrip) {
                setTrip(validatedTrip);
                Alert.alert(
                  t("tripDetails.tripValidated"),
                  t("tripDetails.tripValidatedMessage"),
                  [
                    {
                      text: t("common.ok"),
                      onPress: () => {
                        // Réinitialiser la navigation pour aller à l'écran principal (Mes voyages)
                        (navigation as any).reset({
                          index: 0,
                          routes: [{ name: "Main" }],
                        });
                      },
                    },
                  ],
                );
              }
            } catch (error) {
              console.error("Error validating trip:", error);
              Alert.alert(
                t("common.error"),
                (error as Error).message || "Erreur lors de la validation",
              );
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("tripDetails.loading")}</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("tripDetails.notFound")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#2891FF", "#8869FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => (navigation as any).reset({
              index: 0,
              routes: [{ name: "Main" as any, params: { screen: "Trips" as any } }],
            })}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.tripTitle}>{trip.title}</Text>
            <View style={styles.destinationRow}>
              <Ionicons
                name="location"
                size={20}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.tripDestination}>{trip.destination}</Text>
            </View>
            <View style={styles.datesRow}>
              <Ionicons
                name="calendar"
                size={18}
                color="rgba(255, 255, 255, 0.8)"
              />
              <Text style={styles.tripDates}>
                {formatDate(trip.startDate, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                -{" "}
                {formatDate(trip.endDate, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            {trip.description && (
              <Text style={styles.tripDescription}>{trip.description}</Text>
            )}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {canInvite && (
            <View style={styles.actionsContainer}>
              <ModernButton
                title={t("tripDetails.inviteFriends")}
                onPress={handleInviteFriends}
                variant="primary"
                size="medium"
                icon="person-add-outline"
                style={styles.actionButton}
              />
              {isOwner && (
                <ModernButton
                  title={t("tripDetails.editTrip")}
                  onPress={handleEditTrip}
                  variant="outline"
                  size="medium"
                  icon="create-outline"
                  style={styles.actionButton}
                />
              )}
            </View>
          )}

          {(showValidateButton || trip.status === "draft") && (
            <ModernCard variant="elevated" style={styles.validateContainer}>
              <View style={styles.draftBanner}>
                <Ionicons
                  name="information-circle"
                  size={24}
                  color={"#FF9800"}
                />
                <Text style={styles.draftBannerText}>
                  {t("tripDetails.draftMessage")}
                </Text>
              </View>
              <ModernButton
                title={t("tripDetails.validateTrip")}
                onPress={handleValidateTrip}
                variant="primary"
                gradient
                size="large"
                fullWidth
                icon="checkmark-circle-outline"
                style={styles.validateButton}
              />
            </ModernCard>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {t("tripDetails.bookings")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {bookings.length}{" "}
                  {bookings.length > 1 ? "réservations" : "réservation"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddBooking}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color={"#2891FF"} />
              </TouchableOpacity>
            </View>
            {bookings.length === 0 ? (
              <View style={styles.emptySection}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={40}
                    color={"#7EBDFF"}
                  />
                </View>
                <Text style={styles.emptyText}>
                  {t("tripDetails.noBookings")}
                </Text>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {bookings.map((booking: Booking, index: number) => (
                  <ModernCard
                    key={booking.id}
                    variant="outlined"
                    style={{
                      ...styles.bookingItem,
                      ...(index > 0 ? { marginTop: 16 } : {}),
                    }}
                  >
                    <View style={styles.bookingHeader}>
                      <View style={styles.bookingIconContainer}>
                        <Ionicons
                          name={
                            booking.type === "flight"
                              ? "airplane"
                              : booking.type === "hotel"
                                ? "bed"
                                : "receipt"
                          }
                          size={20}
                          color={"#2891FF"}
                        />
                      </View>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.bookingTitle}>{booking.title}</Text>
                        <Text style={styles.bookingDate}>
                          {formatDate(booking.date)}
                          {booking.time && ` • ${booking.time}`}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={"#BDBDBD"}
                      />
                    </View>
                    {booking.confirmationNumber && (
                      <View style={styles.confirmationContainer}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={"#4CAF50"}
                        />
                        <Text style={styles.confirmationText}>
                          {booking.confirmationNumber}
                        </Text>
                      </View>
                    )}
                  </ModernCard>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {t("tripDetails.addresses")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {addresses.length} {addresses.length > 1 ? "lieux" : "lieu"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddAddress}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color={"#2891FF"} />
              </TouchableOpacity>
            </View>
            {addresses.length === 0 ? (
              <View style={styles.emptySection}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="map-outline" size={40} color={"#7EBDFF"} />
                </View>
                <Text style={styles.emptyText}>
                  {t("tripDetails.noAddresses")}
                </Text>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {addresses.map((address: Address, index: number) => (
                  <ModernCard
                    key={address.id}
                    variant="outlined"
                    style={{
                      ...styles.addressItem,
                      ...(index > 0 ? { marginTop: 16 } : {}),
                    }}
                  >
                    <View style={styles.addressHeader}>
                      <View style={styles.addressIconContainer}>
                        <Ionicons
                          name={
                            address.type === "hotel"
                              ? "bed"
                              : address.type === "restaurant"
                                ? "restaurant"
                                : "location"
                          }
                          size={20}
                          color={"#FF6B9D"}
                        />
                      </View>
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressName}>{address.name}</Text>
                        <Text style={styles.addressText}>
                          {address.address}
                        </Text>
                        <Text style={styles.addressLocation}>
                          {address.city}, {address.country}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={"#BDBDBD"}
                      />
                    </View>
                  </ModernCard>
                ))}
              </View>
            )}
          </View>

          <ModernCard variant="elevated" style={styles.collaboratorsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {t("tripDetails.collaborators")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {trip.collaborators.length + 1}{" "}
                  {trip.collaborators.length > 0 ? "membres" : "membre"}
                </Text>
              </View>
            </View>
            <View style={styles.collaboratorsList}>
              {/* Afficher l'utilisateur actuel (propriétaire ou collaborateur) */}
              <View key="current-user" style={styles.collaboratorItem}>
                <View style={styles.collaboratorAvatar}>
                  <LinearGradient
                    colors={isOwner ? ["#2891FF", "#8869FF"] : ["#9E9E9E", "#757575"]}
                    style={styles.avatarGradient}
                  >
                    <Ionicons name="person" size={20} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.collaboratorInfo}>
                  <Text style={styles.collaboratorName}>
                    {user?.name || "Vous"}
                  </Text>
                  <View style={styles.collaboratorMetaRow}>
                    <Text style={styles.collaboratorRole}>
                      {isOwner ? "Organisateur" : userCollaborator?.role === "editor" ? "Éditeur" : "Lecteur"}
                    </Text>
                    {!isOwner && userCollaborator?.invitedBy && (
                      <>
                        <Ionicons name="arrow-forward" size={12} color="#9E9E9E" style={styles.metaSeparator} />
                        <Text style={styles.invitedByText}>
                          Invité par {collaboratorUsers.get(userCollaborator.invitedBy)?.name || "l'organisateur"}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={isOwner ? styles.ownerBadge : styles.collaboratorBadge}>
                  <Text style={isOwner ? styles.ownerBadgeText : styles.collaboratorBadgeText}>
                    Vous
                  </Text>
                </View>
              </View>
              {/* Afficher les autres collaborateurs (pas l'utilisateur actuel) */}
              {trip.collaborators
                .filter((c: Collaborator) => c.userId !== user?.id)
                .map((collaborator: Collaborator, index: number) => {
                  const collaboratorUser = collaboratorUsers.get(collaborator.userId);
                  const displayName = collaboratorUser?.name || collaborator.userId;

                  return (
                    <View
                      key={`collaborator-${collaborator.userId}-${index}`}
                      style={styles.collaboratorItem}
                    >
                      <View style={styles.collaboratorAvatar}>
                        <View style={styles.avatarDefault}>
                          <Ionicons name="person" size={20} color={"#2891FF"} />
                        </View>
                      </View>
                      <View style={styles.collaboratorInfo}>
                        <Text style={styles.collaboratorName}>
                          {displayName}
                        </Text>
                        <View style={styles.collaboratorMetaRow}>
                          <Text style={styles.collaboratorRole}>
                            {collaborator.role === "editor" ? "Éditeur" : "Lecteur"}
                          </Text>
                          {collaborator.invitedBy && (
                            <>
                              <Ionicons name="arrow-forward" size={12} color="#9E9E9E" style={styles.metaSeparator} />
                              <Text style={styles.invitedByText}>
                                Invité par {collaboratorUsers.get(collaborator.invitedBy)?.name || collaborator.invitedBy === trip.ownerId ? "l'organisateur" : "un membre"}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
            </View>
          </ModernCard>
        </View>

        {/* Booking Form Modal */}
        {trip && (
          <BookingForm
            visible={showBookingForm}
            onClose={() => setShowBookingForm(false)}
            onSave={handleSaveBooking}
            tripStartDate={trip.startDate}
            tripEndDate={trip.endDate}
          />
        )}

        {/* Address Form Modal */}
        <AddressForm
          visible={showAddressForm}
          onClose={() => setShowAddressForm(false)}
          onSave={handleSaveAddress}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 64 + 10 : 24,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: -20,
    marginTop: 5,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 64 + 10 + 5 : 24 + 5,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 10,
  },
  headerContent: {
    marginTop: 50,
  },
  destinationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  content: {
    marginTop: -100,
    paddingHorizontal: 24,
    paddingBottom: 64,
  },
  tripTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "white",
    marginBottom: 10,
  },
  tripDestination: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    marginLeft: 8,
  },
  tripDates: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 8,
  },
  tripDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: "row" as const,
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  validateContainer: {
    marginBottom: 24,
  },
  validateButton: {
    marginTop: 16,
  },
  section: {
    marginTop: 40,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center" as const,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#616161",
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F4FF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptySection: {
    alignItems: "center" as const,
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F4FF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#616161",
  },
  itemsList: {
    marginTop: 8,
  },
  bookingItem: {},
  bookingHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  bookingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F4FF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: "#616161",
  },
  confirmationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  confirmationText: {
    fontSize: 12,
    color: "#616161",
    marginLeft: 4,
    fontWeight: "500",
  },
  addressItem: {},
  addressHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start",
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B9D" + "15",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 4,
    lineHeight: 20,
  },
  addressLocation: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  collaboratorsSection: {
    marginBottom: 24,
  },
  collaboratorsList: {
    marginTop: 16,
  },
  collaboratorItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  collaboratorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    overflow: "hidden",
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  avatarDefault: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  collaboratorRole: {
    fontSize: 14,
    color: "#616161",
  },
  collaboratorMetaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  metaSeparator: {
    marginHorizontal: 6,
  },
  invitedByText: {
    fontSize: 13,
    color: "#9E9E9E",
    fontStyle: "italic" as const,
  },
  ownerBadge: {
    backgroundColor: "#E8F4FF",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2891FF",
  },
  collaboratorBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  collaboratorBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#757575",
  },
  draftBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FF9500",
  },
  draftBannerText: {
    fontSize: 14,
    color: "#FF9500",
    marginLeft: 8,
    fontWeight: "500" as const,
  },
});

export default TripDetailsScreen;
