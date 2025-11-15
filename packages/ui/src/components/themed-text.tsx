import React from 'react';
import { Platform, Text, type TextProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'mono';
};

const textStyles = {
  default: { fontSize: 16, fontWeight: '400' as const },
  title: { fontSize: 24, fontWeight: '600' as const },
  subtitle: { fontSize: 18, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  mono: { fontSize: 13, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...otherProps
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const variantStyle = textStyles[type] ?? textStyles.default;

  return (
    <Text
      style={[
        { color },
        variantStyle,
        style,
      ]}
      {...otherProps}
    />
  );
}
