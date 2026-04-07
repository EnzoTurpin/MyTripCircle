import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { geocodeAddress, getCached, GeoCoords } from "../utils/geocoding";

const MOSS = "#6B8C5A";
const MOSS_LIGHT = "#E2EDD9";
const SKY = "#5A8FAA";
const SKY_LIGHT = "#DCF0F5";

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

const getIconColors = (type: Address["type"]) => {
  switch (type) {
    case "hotel":      return { bg: SKY_LIGHT,  icon: SKY };
    case "restaurant": return { bg: "#F5E5DC",  icon: "#C4714A" };
    case "activity":   return { bg: MOSS_LIGHT, icon: MOSS };
    default:           return { bg: null, icon: null };
  }
};

const getTagColors = (type: Address["type"]) => {
  switch (type) {
    case "hotel":      return { bg: SKY_LIGHT,  text: SKY };
    case "restaurant": return { bg: "#F5E5DC",  text: "#A35830" };
    case "activity":   return { bg: MOSS_LIGHT, text: MOSS };
    default:           return { bg: null, text: null };
  }
};

const getMarkerColor = (type: Address["type"]): string => {
  switch (type) {
    case "hotel":      return SKY;
    case "restaurant": return "#C4714A";
    case "activity":   return MOSS;
    default:           return "#8B7355";
  }
};

const FullMapScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { addresses } = useTrips();
  const { t } = useTranslation();
  const { colors, satelliteMap, toggleSatelliteMap } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [mapCoords, setMapCoords] = useState<Record<string, GeoCoords>>({});
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const mapRef = useRef<any>(null);
  const geocodedQueueRef = useRef(new Set<string>());
  const currentRegionRef = useRef<Region>(DEFAULT_REGION);

  // Géocodage — utilise le cache de la session (résultats instantanés si déjà géocodé)
  const addressIdsKey = addresses.map((a) => a.id).join(",");
  useEffect(() => {
    const toGeocode = addresses.filter((a) => !geocodedQueueRef.current.has(a.id));
    if (toGeocode.length === 0) return;
    toGeocode.forEach((a) => geocodedQueueRef.current.add(a.id));

    let cancelled = false;
    setIsGeocoding(true);

    const run = async () => {
      let lastNetworkRequest = 0;
      for (const address of toGeocode) {
        if (cancelled) break;
        const cached = getCached(address.address, address.city, address.country);
        if (cached !== undefined) {
          if (cached) setMapCoords((prev) => ({ ...prev, [address.id]: cached }));
          continue;
        }
        const now = Date.now();
        const delay = Math.max(0, 1100 - (now - lastNetworkRequest));
        if (lastNetworkRequest > 0 && delay > 0) {
          await new Promise<void>((r) => setTimeout(r, delay));
        }
        if (cancelled) break;
        lastNetworkRequest = Date.now();
        const coords = await geocodeAddress(address.address, address.city, address.country);
        lastNetworkRequest = Date.now();
        if (coords && !cancelled) {
          setMapCoords((prev) => ({ ...prev, [address.id]: coords }));
        }
      }
      if (!cancelled) setIsGeocoding(false);
    };

    run().catch(() => { if (!cancelled) setIsGeocoding(false); });
    return () => { cancelled = true; };
  }, [addressIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredAddresses = addresses.filter(
    (a) => selectedFilter === "all" || a.type === selectedFilter
  );
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
    // Centre le marker dans le tiers bas de l'écran pour que la popup
    // au-dessus soit toujours visible (offset de 20 % du delta courant)
    const offsetLat = coords.latitude - currentRegionRef.current.latitudeDelta * 0.20;
    mapRef.current?.animateCamera(
      { center: { latitude: offsetLat, longitude: coords.longitude } },
      { duration: 350 },
    );
  };

  const renderMarkerPin = (type: Address["type"]) => (
    <View style={[styles.markerPin, { backgroundColor: getMarkerColor(type) }]}>
      <Ionicons name={getTypeIcon(type) as any} size={13} color="white" />
    </View>
  );

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

  const renderPopup = () => {
    if (!selectedAddress) return null;
    const ic = getIconColors(selectedAddress.type);
    const tag = getTagColors(selectedAddress.type);
    return (
      // Zone transparente qui capte les taps pour fermer la popup
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => setSelectedAddress(null)}
      >
        {/* Carte popup centrée horizontalement, dans le tiers supérieur */}
        <TouchableOpacity
          style={styles.popup}
          activeOpacity={1}
          onPress={() => {/* stoppe la propagation vers le fond */}}
        >
          <View style={styles.popupRow}>
            <View style={[styles.popupIcon, { backgroundColor: ic.bg ?? "#F0EBE3" }]}>
              <Ionicons name={getTypeIcon(selectedAddress.type) as any} size={16} color={ic.icon ?? "#5A4A3A"} />
            </View>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={styles.popupName} numberOfLines={1}>{selectedAddress.name}</Text>
              <Text style={styles.popupCity} numberOfLines={1}>{selectedAddress.city}, {selectedAddress.country}</Text>
            </View>
            <View style={[styles.popupTag, { backgroundColor: tag.bg ?? "#F0EBE3" }]}>
              <Text style={[styles.popupTagText, { color: tag.text ?? "#5A4A3A" }]}>
                {t(`addresses.filters.${selectedAddress.type}`)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.popupClose}
              onPress={() => setSelectedAddress(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color="#7A6A5A" />
            </TouchableOpacity>
          </View>
          {selectedAddress.address ? (
            <Text style={styles.popupAddress} numberOfLines={1}>{selectedAddress.address}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.popupCta}
            activeOpacity={0.85}
            onPress={() => {
              setSelectedAddress(null);
              navigation.navigate("AddressDetails", { addressId: selectedAddress.id });
            }}
          >
            <Text style={styles.popupCtaText}>Voir les détails</Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["left", "right"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.bgMid }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("addresses.header")}
        </Text>
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
            {filteredWithCoords.map((address) => {
              const coords = mapCoords[address.id];
              return (
                <Marker
                  key={address.id}
                  coordinate={coords}
                  anchor={{ x: 0.5, y: 1 }}
                  tracksViewChanges={false}
                  onPress={() => handleMarkerPress(address)}
                >
                  {renderMarkerPin(address.type)}
                </Marker>
              );
            })}
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

        {/* Popup custom — toujours bien placée car hors du système de coordonnées carte */}
        {renderPopup()}

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontFamily: F.sans700 },
  filters: { paddingVertical: 10, borderBottomWidth: 1 },
  filtersScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  chipText: { fontSize: 13, fontFamily: F.sans600 },
  markerPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  // Popup overlay — indépendant du système de coordonnées de la carte
  popup: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  popupRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  popupIcon: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    marginRight: 10, flexShrink: 0,
  },
  popupName: { fontSize: 14, fontFamily: F.sans700, color: "#2A2318", marginBottom: 2 },
  popupCity: { fontSize: 12, fontFamily: F.sans400, color: "#7A6A5A" },
  popupTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, flexShrink: 0, marginRight: 6 },
  popupTagText: { fontSize: 11, fontFamily: F.sans600 },
  popupClose: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#F5F0EB",
  },
  popupAddress: { fontSize: 12, fontFamily: F.sans400, color: "#7A6A5A", marginBottom: 10 },
  popupCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#A35830", borderRadius: 9, paddingVertical: 8,
  },
  popupCtaText: { color: "#FFFFFF", fontSize: 13, fontFamily: F.sans600 },
  satelliteBtn: {
    position: "absolute", top: 16, right: 16,
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 4,
  },
  noMarkersOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center",
  },
  noMarkersBadge: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  noMarkersText: { fontSize: 14, fontFamily: F.sans500 },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  placeholderTitle: { fontSize: 18, fontFamily: F.sans700 },
});

export default FullMapScreen;
