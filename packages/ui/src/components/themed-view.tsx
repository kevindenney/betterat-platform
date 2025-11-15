import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  border?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  border = false,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View
      style={[
        { backgroundColor },
        border && { borderWidth: 1, borderColor },
        style,
      ]}
      {...otherProps}
    />
  );
}
