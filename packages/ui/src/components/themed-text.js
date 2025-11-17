import React from 'react';
import { Platform, Text } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
const textStyles = {
    default: { fontSize: 16, fontWeight: '400' },
    title: { fontSize: 24, fontWeight: '600' },
    subtitle: { fontSize: 18, fontWeight: '500' },
    caption: { fontSize: 12, fontWeight: '400' },
    mono: { fontSize: 13, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
};
export function ThemedText({ style, lightColor, darkColor, type = 'default', ...otherProps }) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const variantStyle = textStyles[type] ?? textStyles.default;
    return (<Text style={[
            { color },
            variantStyle,
            style,
        ]} {...otherProps}/>);
}
