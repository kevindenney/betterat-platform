// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/navigation/NavigationHeader
import React from 'react';
import { View, Text } from 'react-native';

const warnedLabels = new Set<string>();

const createStubComponent = (label: string) => {
  const Stub = (props: any) => {
    if (!warnedLabels.has(label)) {
      console.warn('[Stub] @betterat/ui/components/navigation/NavigationHeader -> ' + label, props);
      warnedLabels.add(label);
    }
    return (
      <View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>
    );
  };
  return Stub;
};

export type NavigationHeader = any;
export type NavigationHeaderProps = any;
export const NavigationHeader: any = createStubComponent('NavigationHeader');
