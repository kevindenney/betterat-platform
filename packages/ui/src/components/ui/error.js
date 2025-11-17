// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/error
import React from 'react';
import { View, Text } from 'react-native';
const createStubComponent = (label) => {
    const Stub = (props) => {
        console.warn('[Stub] @betterat/ui/components/ui/error -> ' + label, props);
        return (<View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>);
    };
    return Stub;
};
export const ErrorMessage = createStubComponent('ErrorMessage');
export const ErrorBoundary = createStubComponent('ErrorBoundary');
export const error = createStubComponent('error');
