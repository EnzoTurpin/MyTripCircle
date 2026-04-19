import { Address } from "../../types";

const MOSS = "#6B8C5A";
const MOSS_LIGHT = "#E2EDD9";
const SKY = "#5A8FAA";
const SKY_LIGHT = "#DCF0F5";

export { MOSS, MOSS_LIGHT, SKY, SKY_LIGHT };

export const getTypeIcon = (type: Address["type"]) => {
  switch (type) {
    case "hotel":      return "bed-outline";
    case "restaurant": return "restaurant-outline";
    case "activity":   return "ticket-outline";
    case "transport":  return "car-outline";
    case "other":      return "location-outline";
    default:           return "location-outline";
  }
};

export const getIconColors = (type: Address["type"], isDark = false) => {
  if (isDark) {
    switch (type) {
      case "hotel":      return { bg: 'rgba(90,143,170,0.22)',  icon: SKY };
      case "restaurant": return { bg: 'rgba(196,113,74,0.22)',  icon: '#D08070' };
      case "activity":   return { bg: 'rgba(107,140,90,0.22)',  icon: MOSS };
      default:           return { bg: null, icon: null };
    }
  }
  switch (type) {
    case "hotel":      return { bg: SKY_LIGHT,   icon: SKY };
    case "restaurant": return { bg: "#F5E5DC", icon: "#C4714A" };
    case "activity":   return { bg: MOSS_LIGHT,  icon: MOSS };
    default:           return { bg: null,    icon: null };
  }
};

export const getTagColors = (type: Address["type"], isDark = false) => {
  if (isDark) {
    switch (type) {
      case "hotel":      return { bg: 'rgba(90,143,170,0.22)',  text: SKY };
      case "restaurant": return { bg: 'rgba(196,113,74,0.22)',  text: '#D08070' };
      case "activity":   return { bg: 'rgba(107,140,90,0.22)',  text: MOSS };
      default:           return { bg: null, text: null };
    }
  }
  switch (type) {
    case "hotel":      return { bg: SKY_LIGHT,   text: SKY };
    case "restaurant": return { bg: "#F5E5DC", text: "#A35830" };
    case "activity":   return { bg: MOSS_LIGHT,  text: MOSS };
    default:           return { bg: null,    text: null };
  }
};

export const getTagLabel = (type: Address["type"], t: (k: string) => string) =>
  t(`addresses.filters.${type}`);

export const getMarkerColor = (type: Address["type"]): string => {
  switch (type) {
    case "hotel":      return SKY;
    case "restaurant": return "#C4714A";
    case "activity":   return MOSS;
    case "transport":  return "#8B7355";
    case "other":      return "#8B7355";
    default:           return "#8B7355";
  }
};

export const getChipDotColor = (filter: string): string | null => {
  switch (filter) {
    case "hotel":      return SKY;
    case "restaurant": return "#C4714A";
    case "activity":   return MOSS;
    default:           return null;
  }
};
