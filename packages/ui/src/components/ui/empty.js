// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/empty
import React from 'react';
import { View, Text } from 'react-native';
const createStubComponent = (label) => {
    const Stub = (props) => {
        console.warn('[Stub] @betterat/ui/components/ui/empty -> ' + label, props);
        return (<View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>);
    };
    return Stub;
};
export const EmptyState = createStubComponent('EmptyState');
export const empty = createStubComponent('empty');
