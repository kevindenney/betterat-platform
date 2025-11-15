// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/AccessibleTouchTarget
import React from 'react';
import { View, Text } from 'react-native';

const createStubComponent = (label: string) => {
  const Stub = (props: any) => {
    console.warn('[Stub] @betterat/ui/components/ui/AccessibleTouchTarget -> ' + label, props);
    return (
      <View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>
    );
  };
  return Stub;
};

export type AccessibleTouchTarget = any;
export type AccessibleTouchTargetProps = any;
export const AccessibleTouchTarget: any = createStubComponent('AccessibleTouchTarget');

