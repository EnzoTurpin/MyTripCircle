// Point d'entrée unique du design system MyTripCircle
export * from './colors';
export * from './fonts';

// ── Spacing tokens (multiples de 4) ────────────────────────────────────────
export const SPACING = {
  xxs: 4,
  xs:  8,
  sm:  12,
  md:  16,
  lg:  20,
  xl:  24,
  xxl: 32,
} as const;

// ── Border radius tokens ────────────────────────────────────────────────────
export const RADIUS = {
  xs:     6,
  sm:     8,
  input:  10,
  md:     12,
  button: 14,
  card:   14,
  lg:     16,
  xl:     20,
  pill:   999,
} as const;

// ── Font size tokens ────────────────────────────────────────────────────────
export const FONT_SIZE = {
  xxs:  11,
  xs:   12,
  sm:   13,
  md:   14,
  base: 15,
  lg:   16,
  xl:   17,
  xxl:  18,
  h3:   20,
  h2:   24,
  h1:   28,
  hero: 32,
} as const;
