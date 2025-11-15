// @ts-nocheck
import React, { createContext, useContext } from 'react';

export interface GluestackTheme {
  colors: Record<string, string>;
  radii: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

const defaultTheme: GluestackTheme = {
  colors: {
    primary: '#2563EB',
    secondary: '#1E293B',
    surface: '#FFFFFF',
    muted: '#94A3B8',
    border: '#CBD5F5',
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    heading: 'System',
    body: 'System',
  },
};

const ThemeContext = createContext<GluestackTheme>(defaultTheme);

export interface GluestackUIProviderProps {
  children: React.ReactNode;
  theme?: Partial<GluestackTheme>;
}

export const GluestackUIProvider: React.FC<GluestackUIProviderProps> = ({
  children,
  theme,
}) => {
  const mergedTheme: GluestackTheme = {
    ...defaultTheme,
    ...theme,
    colors: {
      ...defaultTheme.colors,
      ...(theme?.colors ?? {}),
    },
    radii: {
      ...defaultTheme.radii,
      ...(theme?.radii ?? {}),
    },
    spacing: {
      ...defaultTheme.spacing,
      ...(theme?.spacing ?? {}),
    },
    fonts: {
      ...defaultTheme.fonts,
      ...(theme?.fonts ?? {}),
    },
  };

  return <ThemeContext.Provider value={mergedTheme}>{children}</ThemeContext.Provider>;
};

export const gluestack_ui_provider = GluestackUIProvider;
export type gluestack_ui_providerProps = GluestackUIProviderProps;

export const useGluestackTheme = () => useContext(ThemeContext);
