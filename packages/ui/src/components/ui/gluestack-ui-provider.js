// @ts-nocheck
import React, { createContext, useContext } from 'react';
const defaultTheme = {
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
const ThemeContext = createContext(defaultTheme);
export const GluestackUIProvider = ({ children, theme, }) => {
    const mergedTheme = {
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
export const useGluestackTheme = () => useContext(ThemeContext);
