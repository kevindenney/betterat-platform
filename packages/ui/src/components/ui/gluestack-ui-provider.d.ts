import React from 'react';
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
export interface GluestackUIProviderProps {
    children: React.ReactNode;
    theme?: Partial<GluestackTheme>;
}
export declare const GluestackUIProvider: React.FC<GluestackUIProviderProps>;
export declare const gluestack_ui_provider: React.FC<GluestackUIProviderProps>;
export type gluestack_ui_providerProps = GluestackUIProviderProps;
export declare const useGluestackTheme: () => GluestackTheme;
//# sourceMappingURL=gluestack-ui-provider.d.ts.map