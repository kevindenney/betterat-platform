/**
 * Theme type definitions for Yachtracing domain
 * Based on RegattaFlow design system
 */

export interface Colors {
  // Primary blues (from RegattaFlow)
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // AI/Special
  aiPurple: string;
  aiPurpleLight: string;

  // Neutrals
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray500: string;
  gray700: string;
  gray900: string;

  // Backgrounds
  background: string;
  backgroundSecondary: string;
  surface: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
}

export interface TypographyStyle {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
}

export interface Typography {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  body: TypographyStyle;
  bodySmall: TypographyStyle;
  caption: TypographyStyle;
  tiny: TypographyStyle;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface BorderRadius {
  small: number;
  medium: number;
  large: number;
  card: number;
  cardLarge: number;
}

export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  small: Shadow;
  medium: Shadow;
  large: Shadow;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}
