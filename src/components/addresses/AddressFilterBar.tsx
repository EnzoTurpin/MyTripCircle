import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { FilterType } from "../../hooks/useAddresses";
import { getChipDotColor } from "./addressHelpers";
import { styles } from "./addressStyles";

interface AddressFilterBarProps {
  selectedFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  colors: any;
  t: (k: string) => string;
}

const FILTERS: FilterType[] = ["all", "hotel", "restaurant", "activity", "transport", "other"];

const AddressFilterBar: React.FC<AddressFilterBarProps> = ({ selectedFilter, onSelectFilter, colors, t }) => (
  <View style={styles.filtersContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersScroll}
    >
      {FILTERS.map((filter) => {
        const active = selectedFilter === filter;
        const dotColor = getChipDotColor(filter);
        return (
          <TouchableOpacity
            key={filter}
            style={[
              styles.chip,
              { backgroundColor: colors.bgMid },
              active && { backgroundColor: colors.terra },
            ]}
            onPress={() => onSelectFilter(filter)}
            activeOpacity={0.7}
          >
            {!active && dotColor && (
              <View style={[styles.chipDot, { backgroundColor: dotColor }]} />
            )}
            <Text
              style={[
                styles.chipText,
                { color: colors.textMid },
                active && { color: "#FFFFFF" },
              ]}
            >
              {t(`addresses.filters.${filter}`)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

export default AddressFilterBar;
