import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
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
import SkeletonBox from "../components/SkeletonBox";

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
      <SwipeToNavigate currentIndex={3} totalTabs={5}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={["top", "left", "right"]}>
          <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
          <ScrollView scrollEnabled={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={[styles.header]}>
              <View style={styles.headerLeft}>
                <SkeletonBox width={80} height={11} borderRadius={5} style={{ marginBottom: 6 }} />
                <SkeletonBox width={180} height={26} borderRadius={8} />
              </View>
              <SkeletonBox width={44} height={44} borderRadius={22} />
            </View>

            {/* Filter chips */}
            <View style={{ flexDirection: "row", paddingHorizontal: 24, gap: 8, marginBottom: 12 }}>
              {[{ id: "f1", w: 60 }, { id: "f2", w: 80 }, { id: "f3", w: 70 }, { id: "f4", w: 65 }].map(({ id, w }) => (
                <SkeletonBox key={id} width={w} height={32} borderRadius={999} />
              ))}
            </View>

            {/* Map widget */}
            <SkeletonBox
              width="100%"
              height={130}
              borderRadius={16}
              style={{ marginHorizontal: 16, alignSelf: "center", width: undefined, marginBottom: 12 }}
            />

            {/* Address cards */}
            <View style={{ paddingHorizontal: 16, gap: 14 }}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{ flexDirection: "row", alignItems: "center", borderRadius: 16, backgroundColor: colors.bgMid, paddingHorizontal: 18, paddingVertical: 20 }}
                >
                  <SkeletonBox width={58} height={58} borderRadius={14} style={{ marginRight: 16 }} />
                  <View style={{ flex: 1, gap: 10, marginRight: 10 }}>
                    <SkeletonBox width="60%" height={16} borderRadius={6} />
                    <SkeletonBox width="80%" height={13} borderRadius={5} />
                  </View>
                  <SkeletonBox width={56} height={30} borderRadius={999} />
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </SwipeToNavigate>
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
