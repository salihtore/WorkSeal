import { Platform } from 'react-native';

// ===== COLOR TOKENS — Sui × Walrus Design System =====
// Mirrors globals.css CSS variables exactly

export const COLORS = {
  background: '#050810',
  foreground: '#F0F6FF',
  card: '#0d1117',
  cardForeground: '#F0F6FF',
  primary: '#4FC3F7',
  primaryForeground: '#050810',
  secondary: '#111827',
  secondaryForeground: 'rgba(240, 246, 255, 0.6)',
  muted: '#111827',
  mutedForeground: 'rgba(240, 246, 255, 0.4)',
  accent: 'rgba(79, 195, 247, 0.08)',
  accentForeground: '#4FC3F7',
  destructive: '#F87171',
  destructiveForeground: '#050810',
  border: 'rgba(255, 255, 255, 0.07)',
  input: '#111827',
  ring: '#4FC3F7',
  // Semantic colors
  emerald: '#34D399',
  emeraldBg: 'rgba(52, 211, 153, 0.1)',
  emeraldBorder: 'rgba(52, 211, 153, 0.2)',
  yellow: '#EAB308',
  yellowBg: 'rgba(234, 179, 8, 0.1)',
  yellowBorder: 'rgba(234, 179, 8, 0.2)',
  red: '#F87171',
  redBg: 'rgba(248, 113, 113, 0.1)',
  redBorder: 'rgba(248, 113, 113, 0.2)',
  blue: '#4FC3F7',
  blueBg: 'rgba(79, 195, 247, 0.1)',
  blueBorder: 'rgba(79, 195, 247, 0.2)',
};

// ===== SPACING =====
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// ===== TYPOGRAPHY =====
export const FONTS = {
  sans: Platform.select({ ios: 'System', android: 'sans-serif' }) ?? 'System',
  mono: Platform.select({ ios: 'Courier New', android: 'monospace' }) ?? 'monospace',
};

export const FONT_SIZES = {
  '2xs': 9,
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

// ===== BORDER RADIUS =====
// Keskin köşeler — Sui × Walrus identity (radius = 0)
export const RADIUS = 0;

// ===== SHADOWS =====
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  primary: {
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
};
