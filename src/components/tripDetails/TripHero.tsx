import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, Trip } from "../../types";
import { formatDate } from "../../utils/i18n";
import { F } from "../../theme/fonts";

type NavigationProp = StackNavigationProp<RootStackParamList, "TripDetails">;

const SAFE_TOP = Platform.OS === "ios" ? 64 : 40;

const heroColors = (status: string): [string, string, string] => {
  if (status === "active" || status === "validated") {
    return ["#2C4A3E", "#1A3028", "#3D5A4A"];
  }
  return ["#3A3020", "#1E1A10", "#2A2216"];
};

interface Props {
  trip: Trip;
  tripId: string;
  isOwner: boolean;
  canEdit?: boolean;
  totalBudget: number;
  bookingsCount: number;
  addressesCount: number;
}

const TripHero: React.FC<Props> = ({
  trip,
  tripId,
  isOwner,
  canEdit,
  totalBudget,
  bookingsCount,
  addressesCount,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const gradientColors = heroColors(trip.status);

  return (
    <View style={s.hero}>
      {trip.coverImage ? (
        <Image
          source={{ uri: trip.coverImage }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[StyleSheet.absoluteFill, s.heroOverlay]} />

      <TouchableOpacity
        style={s.heroBackBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {(isOwner || canEdit) && (
        <TouchableOpacity
          style={s.heroHeartBtn}
          onPress={() =>
            navigation.navigate("TripActions", {
              tripId,
              tripTitle: trip.title,
              destination: trip.destination,
              startDate: trip.startDate instanceof Date ? trip.startDate.toISOString() : String(trip.startDate),
              endDate: trip.endDate instanceof Date ? trip.endDate.toISOString() : String(trip.endDate),
              coverImage: trip.coverImage,
              totalBookings: trip.stats?.totalBookings ?? bookingsCount,
              totalAddresses: trip.stats?.totalAddresses ?? addressesCount,
              budget: totalBudget,
              isOwner,
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <View style={s.heroBottom}>
        <Text style={s.heroTitle} numberOfLines={1}>{trip.title}</Text>
        <View style={s.heroDestRow}>
          <Text style={s.heroDestText}>
            📍 {trip.destination}
            {" · "}
            {formatDate(trip.startDate, { day: "numeric", month: "short" })}
            {" — "}
            {formatDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  hero: {
    height: 305,
    position: "relative",
    overflow: "hidden",
  },
  heroOverlay: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroBackBtn: {
    position: "absolute",
    top: SAFE_TOP,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heroHeartBtn: {
    position: "absolute",
    top: SAFE_TOP,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heroBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: F.sans700,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroDestRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroDestText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontFamily: F.sans400,
  },
});

export default TripHero;
