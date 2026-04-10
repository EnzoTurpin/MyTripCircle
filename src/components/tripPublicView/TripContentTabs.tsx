import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDate } from "../../utils/i18n";
import { getBookingTypeIcon, getBookingTypeColors } from "../../utils/bookingHelpers";
import { F } from "../../theme/fonts";

const fmtDateShort = (d: string | Date) =>
  formatDate(d, { day: "numeric", month: "short" });

const addressIcon = (type: string) =>
  ({ hotel: "🏨", restaurant: "🍽️", activity: "🎯" }[type] ?? "📍");

interface Props {
  activeTab: "bookings" | "addresses";
  onTabChange: (tab: "bookings" | "addresses") => void;
  bookings: any[];
  addresses: any[];
  onBookingPress: (bookingId: string) => void;
}

const TripContentTabs: React.FC<Props> = ({
  activeTab,
  onTabChange,
  bookings,
  addresses,
  onBookingPress,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <>
      <View style={[styles.tabs, { backgroundColor: colors.bgMid }]}>
        {(["bookings", "addresses"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && [styles.tabActive, { backgroundColor: colors.surface }],
            ]}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab === "bookings" ? "receipt-outline" : "location-outline"}
              size={15}
              color={activeTab === tab ? "#C4714A" : "#B0A090"}
            />
            <Text
              style={[
                styles.tabText,
                { color: colors.textLight },
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "bookings"
                ? t("tripPublicView.tabBookings", { count: bookings.length })
                : t("tripPublicView.tabAddresses", { count: addresses.length })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "bookings" && (
        <View style={styles.list}>
          {bookings.length ? (
            bookings.map((b: any) => (
              <TouchableOpacity
                key={b._id ?? b.id}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.75}
                onPress={() => onBookingPress(b._id ?? b.id)}
              >
                <View style={[styles.itemIcon, { backgroundColor: getBookingTypeColors(b.type)?.bg ?? "#F5E5DC" }]}>
                  <Ionicons
                    name={getBookingTypeIcon(b.type) as any}
                    size={18}
                    color={getBookingTypeColors(b.type)?.stripe ?? "#C4714A"}
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {b.title}
                  </Text>
                  {b.startDate ? (
                    <Text style={[styles.itemSub, { color: colors.textLight }]}>
                      {fmtDateShort(b.startDate)}{b.endDate ? ` – ${fmtDateShort(b.endDate)}` : ""}
                    </Text>
                  ) : null}
                </View>
                {b.price == null ? null : (
                  <Text style={styles.itemPrice}>
                    {b.price}{b.currency ? ` ${b.currency}` : t("tripPublicView.currencyFallback")}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={14} color="#D8CCBA" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={28} color="#B0A090" />
              <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("tripPublicView.noBookings")}</Text>
            </View>
          )}
        </View>
      )}

      {activeTab === "addresses" && (
        <View style={styles.list}>
          {addresses.length ? (
            addresses.map((a: any) => (
              <View
                key={a._id ?? a.id}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.itemIcon, { backgroundColor: colors.bgMid }]}>
                  <Text style={{ fontSize: 18 }}>{addressIcon(a.type)}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {a.name}
                  </Text>
                  {a.city || a.country ? (
                    <Text style={[styles.itemSub, { color: colors.textLight }]}>
                      {[a.city, a.country].filter(Boolean).join(", ")}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="location-outline" size={28} color="#B0A090" />
              <Text style={[styles.emptyText, { color: colors.textLight }]}>{t("tripPublicView.noAddresses")}</Text>
            </View>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    shadowColor: "#2A2318",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 12, fontFamily: F.sans500 },
  tabTextActive: { color: "#C4714A", fontFamily: F.sans600 },
  list: { paddingHorizontal: 16 },
  emptyBox: { alignItems: "center", gap: 10, paddingVertical: 32 },
  emptyText: { fontSize: 13, fontFamily: F.sans400 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  itemIcon: { width: 42, height: 42, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontFamily: F.sans600 },
  itemSub: { fontSize: 11, fontFamily: F.sans400, marginTop: 2 },
  itemPrice: { fontSize: 14, fontFamily: F.sans700, color: "#C4714A" },
});

export default TripContentTabs;
