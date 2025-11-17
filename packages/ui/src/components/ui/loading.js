// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/loading
import React from 'react';
import { View, Text } from 'react-native';
const createStubComponent = (label) => {
    const Stub = (props) => {
        console.warn('[Stub] @betterat/ui/components/ui/loading -> ' + label, props);
        return (<View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>);
    };
    return Stub;
};
export const DashboardSkeleton = createStubComponent('DashboardSkeleton');
export const loading = createStubComponent('loading');
