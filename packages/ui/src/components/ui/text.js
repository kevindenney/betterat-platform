// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/text
import React from 'react';
import { View, Text as RNText } from 'react-native';
const createStubComponent = (label) => {
    const Stub = (props) => {
        console.warn('[Stub] @betterat/ui/components/ui/text -> ' + label, props);
        return (<View accessibilityLabel={label}>
        <RNText>{label} - Stub</RNText>
      </View>);
    };
    return Stub;
};
export const Text = createStubComponent('Text');
export const text = createStubComponent('text');
