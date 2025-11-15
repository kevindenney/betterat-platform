/**
 * Yachtracing Domain Theme
 * Based on RegattaFlow design system
 */

import type {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Theme,
} from './types';

// ============================================================================
// COLORS
// ============================================================================

export const colors: Colors = {
  // Primary blues (from RegattaFlow)
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // AI/Special
  aiPurple: '#9333EA',
  aiPurpleLight: '#A855F7',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#E5E7EB',

  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography: Typography = {
  h1: { fontSize: 22, fontWeight: '700' },
  h2: { fontSize: 18, fontWeight: '600' },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  tiny: { fontSize: 9, fontWeight: '400' },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing: Spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
};

// ============================================================================
// BORDERS
// ============================================================================

export const borderRadius: BorderRadius = {
  small: 4,
  medium: 8,
  large: 14,
  card: 18,
  cardLarge: 20,
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows: Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xlarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
};

// ============================================================================
// THEME OBJECT
// ============================================================================

export const theme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

// Default export
export default theme;
