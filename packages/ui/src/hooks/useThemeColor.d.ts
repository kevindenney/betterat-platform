import { Colors } from '../theme/colors';
type ThemeOverrides = {
    light?: string;
    dark?: string;
};
type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;
export declare function useThemeColor(overrides: ThemeOverrides, colorName: ColorName): string;
export {};
//# sourceMappingURL=useThemeColor.d.ts.map