import { useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';
export function useThemeColor(overrides, colorName) {
    const scheme = useColorScheme() ?? 'light';
    const override = overrides[scheme];
    if (override) {
        return override;
    }
    return Colors[scheme][colorName];
}
