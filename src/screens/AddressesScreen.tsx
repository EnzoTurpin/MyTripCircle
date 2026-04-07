import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SwipeToNavigate } from "../hooks/useSwipeToNavigate";
import { useAddresses } from "../hooks/useAddresses";
import AddressCard from "../components/addresses/AddressCard";
import AddressFilterBar from "../components/addresses/AddressFilterBar";
import AddressMapWidget from "../components/addresses/AddressMapWidget";
import { styles } from "../components/addresses/addressStyles";
import { Address } from "../types";

const AddressesScreen: React.FC = () => {
  const {
    t,
    colors,
    addresses,
    loading,
    selectedFilter,
    setSelectedFilter,
    mapCoords,
    isGeocoding,
    widgetRegion,
    filteredAddresses,
    eyebrow,
    handleAddressPress,
    handleAddAddress,
    handleOpenFullMap,
  } = useAddresses();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <Text style={[styles.loadingText, { color: colors.textMid }]}>
          {t("addresses.loading")}
        </Text>
      </View>
    );
  }

  return (
    <SwipeToNavigate currentIndex={3} totalTabs={5}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
        <View style={[styles.container, { backgroundColor: colors.bg }]}>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {eyebrow ? (
                <Text style={[styles.headerEyebrow, { color: colors.terra }]} numberOfLines={1}>
                  {eyebrow}
                </Text>
              ) : null}
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t("addresses.header")}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.terra }]}
              onPress={handleAddAddress}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <AddressFilterBar
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            colors={colors}
            t={t}
          />

          <AddressMapWidget
            addresses={addresses}
            mapCoords={mapCoords}
            isGeocoding={isGeocoding}
            widgetRegion={widgetRegion}
            onOpenFullMap={handleOpenFullMap}
          />

          {filteredAddresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.terraLight }]}>
                <Ionicons name="map-outline" size={52} color={colors.terra} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("addresses.emptyTitle")}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMid }]}>
                {selectedFilter === "all"
                  ? t("addresses.emptyAll")
                  : t("addresses.emptyFiltered", {
                      type: t(`addresses.filters.${selectedFilter}`),
                    })}
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.terra }]}
                onPress={handleAddAddress}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.createButtonText}>
                  {t("addresses.addAddress")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredAddresses}
              renderItem={({ item }: { item: Address }) => (
                <AddressCard
                  item={item}
                  colors={colors}
                  t={t}
                  onPress={handleAddressPress}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </SwipeToNavigate>
  );
};

export default AddressesScreen;
