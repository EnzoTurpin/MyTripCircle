import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

let MapView: any = null;
let Marker: any = null;
try {
  const RNMaps = require("react-native-maps");
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
} catch {
  // Module natif non encore compilé
}

import { RootStackParamList, Address } from "../types";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "react-i18next";
import { F } from "../theme/fonts";
import { useTheme } from "../contexts/ThemeContext";
import { useAddressGeocoding } from "../hooks/useAddressGeocoding";
import MapMarkerPopup from "../components/fullMap/MapMarkerPopup";

type FilterType = "all" | "hotel" | "restaurant" | "activity" | "transport" | "other";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const getTypeIcon = (type: Address["type"]) => {
  switch (type) {
    case "hotel":      return "bed-outline";
    case "restaurant": return "restaurant-outline";
    case "activity":   return "ticket-outline";
    case "transport":  return "car-outline";
    default:           return "location-outline";
  }
};

const getMarkerColor = (type: Address["type"]): string => {
  switch (type) {
    case "hotel":      return "#5A8FAA";
    case "restaurant": return "#C4714A";
    case "activity":   return "#6B8C5A";
    default:           return "#8B7355";
  }
};

const FullMapScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { addresses }                          = useTrips();
  const { t }                                  = useTranslation();
  const { colors, satelliteMap, toggleSatelliteMap } = useTheme();
  const insets                                 = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter]     = useState<FilterType>("all");
  const [selectedAddress, setSelectedAddress]   = useState<Address | null>(null);
  const mapRef                                  = useRef<any>(null);
  const currentRegionRef                        = useRef<Region>(DEFAULT_REGION);

  const { mapCoords, isGeocoding } = useAddressGeocoding(addresses);

  const filteredAddresses  = addresses.filter((a) => selectedFilter === "all" || a.type === selectedFilter);
  const filteredWithCoords = filteredAddresses.filter((a) => mapCoords[a.id] != null);

  const handleMapReady = () => {
    const coords = filteredWithCoords.map((a) => mapCoords[a.id]);
    if (coords.length === 0) return;
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
        animated: true,
      });
    }, 300);
  };

  const handleMarkerPress = (address: Address) => {
    const coords = mapCoords[address.id];
    if (!coords) return;
    setSelectedAddress(address);
    // Centre le marker dans le tiers bas de l'écran pour que la popup soit visible
    const offsetLat = coords.latitude - currentRegionRef.current.latitudeDelta * 0.2;
    mapRef.current?.animateCamera(
      { center: { latitude: offsetLat, longitude: coords.longitude } },
      { duration: 350 },
    );
  };

  const renderFilterButton = useCallback((filter: FilterType, label: string) => {
    const active = selectedFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.chip, { backgroundColor: colors.bgMid }, active && { backgroundColor: colors.terra }]}
        onPress={() => setSelectedFilter(filter)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, { color: colors.textMid }, active && { color: "#FFFFFF" }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedFilter, colors]);

  const renderMarkerPin = (type: Address["type"]) => (
    <View style={[styles.markerPin, { backgroundColor: getMarkerColor(type) }]}>
      <Ionicons name={getTypeIcon(type) as any} size={13} color="white" />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.bgMid }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t("addresses.header")}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filtres */}
      <View style={[styles.filters, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {renderFilterButton("all",        t("addresses.filters.all"))}
          {renderFilterButton("hotel",      t("addresses.filters.hotel"))}
          {renderFilterButton("restaurant", t("addresses.filters.restaurant"))}
          {renderFilterButton("activity",   t("addresses.filters.activity"))}
          {renderFilterButton("transport",  t("addresses.filters.transport"))}
          {renderFilterButton("other",      t("addresses.filters.other"))}
        </ScrollView>
      </View>

      {/* Carte */}
      <View style={{ flex: 1 }}>
        {MapView ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={DEFAULT_REGION}
            mapType={satelliteMap ? "hybrid" : "standard"}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass
            onMapReady={handleMapReady}
            onRegionChangeComplete={(region: Region) => { currentRegionRef.current = region; }}
            scrollEnabled={selectedAddress === null}
            zoomEnabled={selectedAddress === null}
            rotateEnabled={selectedAddress === null}
            pitchEnabled={selectedAddress === null}
          >
            {filteredWithCoords.map((address) => (
              <Marker
                key={address.id}
                coordinate={mapCoords[address.id]}
                anchor={{ x: 0.5, y: 1 }}
                tracksViewChanges={false}
                onPress={() => handleMarkerPress(address)}
              >
                {renderMarkerPin(address.type)}
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="map-outline" size={52} color={colors.textLight} />
            <Text style={[styles.placeholderTitle, { color: colors.text }]}>Carte non disponible</Text>
          </View>
        )}

        {/* Bouton satellite */}
        {MapView && (
          <TouchableOpacity
            style={[styles.satelliteBtn, { backgroundColor: colors.surface }]}
            onPress={toggleSatelliteMap}
            activeOpacity={0.8}
          >
            <Ionicons name={satelliteMap ? "map-outline" : "globe-outline"} size={20} color={colors.terra} />
          </TouchableOpacity>
        )}

        {/* Popup custom */}
        {selectedAddress && (
          <MapMarkerPopup
            address={selectedAddress}
            onClose={() => setSelectedAddress(null)}
            onNavigate={(addressId) => {
              setSelectedAddress(null);
              navigation.navigate("AddressDetails", { addressId });
            }}
          />
        )}

        {/* Aucun marqueur */}
        {filteredWithCoords.length === 0 && (
          <View style={styles.noMarkersOverlay} pointerEvents="none">
            <View style={[styles.noMarkersBadge, { backgroundColor: colors.surface }]}>
              {isGeocoding ? (
                <>
                  <ActivityIndicator size="small" color={colors.terra} style={{ marginBottom: 6 }} />
                  <Text style={[styles.noMarkersText, { color: colors.textMid }]}>Géocodage en cours…</Text>
                </>
              ) : (
                <Text style={[styles.noMarkersText, { color: colors.textMid }]}>Aucune adresse à afficher</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  title:    { fontSize: 18, fontFamily: F.sans700 },
  filters:  { paddingVertical: 10, borderBottomWidth: 1 },
  filtersScroll: { paddingHorizontal: 16, gap: 8 },
  chip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9999 },
  chipText: { fontSize: 13, fontFamily: F.sans600 },
  markerPin: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "white",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3, elevation: 3,
  },
  satelliteBtn: {
    position: "absolute", top: 16, right: 16,
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 4,
  },
  noMarkersOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  noMarkersBadge: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  noMarkersText:    { fontSize: 14, fontFamily: F.sans500 },
  placeholder:      { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  placeholderTitle: { fontSize: 18, fontFamily: F.sans700 },
});

export default FullMapScreen;
