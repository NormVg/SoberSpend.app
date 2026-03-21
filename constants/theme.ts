/**
 * Sober.Spend — Dark Neo-Brutalist Design System
 */

export const Colors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',

  text: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#666666',

  accent: '#C54770',
  accentLight: '#D65A83',

  // Category card colors
  mint: '#A8E6CF',
  yellow: '#FFD93D',
  purple: '#C3AED6',
  orange: '#FFB347',
  pink: '#FFB3BA',
  blue: '#87CEEB',

  // Status colors
  safe: '#A8E6CF',
  nearLimit: '#FFD93D',
  exceeded: '#FF6B6B',

  border: '#333333',
  borderLight: '#444444',

  white: '#FFFFFF',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const Borders = {
  thin: 2,
  medium: 3,
  thick: 4,
} as const;

export const Fonts = {
  display: 'JockeyOne-Regular',
  body: 'JockeyOne-Regular',
  accent: 'SignPainterHouseScript',
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
  hero: 56,
} as const;
