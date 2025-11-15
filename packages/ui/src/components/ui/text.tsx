// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/text
import React from 'react';
import { View, Text as RNText } from 'react-native';

const createStubComponent = (label: string) => {
  const Stub = (props: any) => {
    console.warn('[Stub] @betterat/ui/components/ui/text -> ' + label, props);
    return (
      <View accessibilityLabel={label}>
        <RNText>{label} - Stub</RNText>
      </View>
    );
  };
  return Stub;
};

export type TextComponent = any;
export type TextProps = any;
export const Text: any = createStubComponent('Text');

export type text = any;
export type textProps = any;
export const text: any = createStubComponent('text');
