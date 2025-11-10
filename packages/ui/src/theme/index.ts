export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { fontSizes, fontWeights } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  fontSizes,
  fontWeights,
  spacing,
} as const;

export type Theme = typeof theme;
