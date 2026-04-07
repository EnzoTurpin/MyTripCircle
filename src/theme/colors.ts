// Palette MyTripCircle — Sable & Terracotta
export const COLORS = {
  // Sable
  sand:      '#F5F0E8',
  sandLight: '#FDFAF5',
  sandMid:   '#EDE5D8',
  sandDark:  '#D8CCBA',

  // Terracotta (accent principal)
  terra:      '#C4714A',
  terraLight: '#F5E5DC',
  terraDark:  '#A35830',

  // Mousse (vert)
  moss:      '#6B8C5A',
  mossLight: '#E2EDD9',

  // Ciel (bleu)
  sky:      '#5A8FAA',
  skyLight: '#DCF0F5',

  // Encre (texte)
  ink:      '#2A2318',
  inkMid:   '#7A6A58',
  inkLight: '#B0A090',

  // États
  danger:      '#C04040',
  dangerLight: '#FDEAEA',

  // Utilitaires
  white: '#FFFFFF',
  black: '#000000',
};

export const FONTS = {
  regular: 'System',
  medium:  'System',
  semibold: 'System',
  bold:    'System',
};

// ── Border radius tokens ────────────────────────────────────────────────────
// Noms sémantiques : input=10, button=12, card=16
export const RADIUS = {
  input:  10,   // champs de formulaire
  button: 12,   // boutons CTA
  card:   16,   // cartes / conteneurs
  // Utilitaires
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
};

// ── Shadow tokens ───────────────────────────────────────────────────────────
// light → cartes à plat  |  medium → dropdowns/FAB  |  strong → modals
export const SHADOW = {
  light: {
    shadowColor:   '#2A2318',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  4,
    elevation:     2,
  },
  medium: {
    shadowColor:   '#2A2318',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius:  8,
    elevation:     4,
  },
  strong: {
    shadowColor:   '#2A2318',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius:  12,
    elevation:     8,
  },
};

// ── Misc tokens ─────────────────────────────────────────────────────────────
export const DISABLED_OPACITY = 0.45;
