// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/input
import React from 'react';
import { View, Text } from 'react-native';
const createStubComponent = (label) => {
    const Stub = (props) => {
        console.warn('[Stub] @betterat/ui/components/ui/input -> ' + label, props);
        return (<View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>);
    };
    return Stub;
};
export const Input = createStubComponent('Input');
export const InputField = createStubComponent('InputField');
export const input = createStubComponent('input');
