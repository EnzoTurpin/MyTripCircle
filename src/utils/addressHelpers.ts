import { Address } from "../types";

export const getAddressHeroGradient = (type: Address["type"]): [string, string, string] => {
  switch (type) {
    case "restaurant": return ["#3A1E14", "#1E0E08", "#4A2E1A"];
    case "hotel":      return ["#1A2C3A", "#0E1C28", "#2A3C4A"];
    case "activity":   return ["#1A3020", "#0E1E14", "#2A4030"];
    case "transport":  return ["#2A2A3A", "#14141E", "#3A3A4E"];
    case "other":      return ["#2A2010", "#14100A", "#3A2E18"];
    default:           return ["#2A2010", "#14100A", "#3A2E18"];
  }
};

export const getAddressTypeBadge = (
  type: Address["type"],
  t: (k: string) => string,
): { label: string; emoji: string } => {
  switch (type) {
    case "restaurant": return { emoji: "🍽", label: t("addresses.filters.restaurant") };
    case "hotel":      return { emoji: "🏨", label: t("addresses.filters.hotel") };
    case "activity":   return { emoji: "🏄", label: t("addresses.filters.activity") };
    case "transport":  return { emoji: "🚗", label: t("addresses.filters.transport") };
    case "other":      return { emoji: "📍", label: t("addresses.filters.other") };
    default:           return { emoji: "📍", label: t("addresses.filters.other") };
  }
};
