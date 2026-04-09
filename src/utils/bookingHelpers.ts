import { Booking } from "../types";

// ─── Couleurs non-thémifiables ─────────────────────────────────────────────────
const MOSS       = '#6B8C5A';
const MOSS_LIGHT = '#E2EDD9';
const SKY        = '#5A8FAA';
const SKY_LIGHT  = '#DCF0F5';

// ─── Icône par type de réservation ────────────────────────────────────────────
export const getBookingTypeIcon = (type: Booking["type"]): string => {
  switch (type) {
    case "flight":     return "airplane";
    case "train":      return "train";
    case "hotel":      return "bed";
    case "restaurant": return "restaurant";
    case "activity":   return "ticket";
    default:           return "receipt";
  }
};

// ─── Couleurs carte/liste (fond clair) ────────────────────────────────────────
export const getBookingTypeColors = (
  type: Booking["type"]
): { stripe: string; bg: string } | null => {
  switch (type) {
    case "flight":     return { stripe: SKY,       bg: SKY_LIGHT };
    case "hotel":      return { stripe: MOSS,      bg: MOSS_LIGHT };
    case "train":      return { stripe: '#C4714A', bg: '#F5E5DC' };
    case "restaurant": return { stripe: '#C4714A', bg: '#F5E5DC' };
    case "activity":   return { stripe: '#8B70C0', bg: '#EDE8F5' };
    default:           return null;
  }
};

export const getBookingStatusColors = (
  status: Booking["status"]
): { color: string; bg: string } | null => {
  switch (status) {
    case "confirmed": return { color: MOSS,      bg: MOSS_LIGHT };
    case "pending":   return { color: '#C4714A', bg: '#F5E5DC' };
    case "cancelled": return { color: '#C04040', bg: '#FDEAEA' };
    default:          return null;
  }
};

// ─── Couleurs détail (fond sombre / rgba) ─────────────────────────────────────
export const getBookingTypeColorsDetail = (
  type: Booking["type"]
): { stripe: string; bg: string } => {
  switch (type) {
    case "flight":     return { stripe: SKY,       bg: 'rgba(90,143,170,0.22)' };
    case "hotel":      return { stripe: MOSS,      bg: 'rgba(107,140,90,0.22)' };
    case "train":      return { stripe: '#C8A870', bg: 'rgba(200,168,112,0.22)' };
    case "restaurant": return { stripe: '#D08070', bg: 'rgba(208,128,112,0.22)' };
    case "activity":   return { stripe: '#A080D0', bg: 'rgba(160,128,208,0.22)' };
    default:           return { stripe: '#B0A090', bg: 'rgba(176,160,144,0.22)' };
  }
};

export const getBookingStatusColorsDetail = (
  status: Booking["status"]
): { color: string; bg: string } => {
  switch (status) {
    case "confirmed": return { color: '#7BC88A', bg: 'rgba(107,200,138,0.22)' };
    case "pending":   return { color: '#E8B870', bg: 'rgba(232,184,112,0.22)' };
    case "cancelled": return { color: '#E08080', bg: 'rgba(224,128,128,0.22)' };
    default:          return { color: '#B0A090', bg: 'rgba(176,160,144,0.22)' };
  }
};

export const getBookingHeroGradient = (
  type: Booking["type"]
): [string, string, string] => {
  switch (type) {
    case "flight":     return ['#1A3A5C', '#0D2540', '#1E4A70'];
    case "hotel":      return ['#1E3A2A', '#0D2418', '#2A4A35'];
    case "train":      return ['#3A2818', '#1E1408', '#4A3020'];
    case "restaurant": return ['#3A1A18', '#1E0E0C', '#4A2820'];
    case "activity":   return ['#2A1A3C', '#150E24', '#382A4E'];
    default:           return ['#2A2318', '#1A1610', '#3A3028'];
  }
};
