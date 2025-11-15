import { useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';

type ThemeOverrides = { light?: string; dark?: string };
type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

export function useThemeColor(overrides: ThemeOverrides, colorName: ColorName) {
  const scheme = useColorScheme() ?? 'light';
  const override = overrides[scheme];

  if (override) {
    return override;
  }

  return Colors[scheme][colorName];
}
