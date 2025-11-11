// Auto-generated stub for @betterat/ui/components/ui/network
import React from 'react';
import { View, Text } from 'react-native';

const createStubComponent = (label: string) => {
  const Stub = (props: any) => {
    console.warn('[Stub] @betterat/ui/components/ui/network -> ' + label, props);
    // Render children if they exist, otherwise render nothing for NetworkStatusBanner
    if (label === 'NetworkStatusBanner') {
      return props.children || null;
    }
    return props.children || (
      <View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>
    );
  };
  return Stub;
};

export type NetworkStatusBanner = any;
export type NetworkStatusBannerProps = any;
export const NetworkStatusBanner: any = createStubComponent('NetworkStatusBanner');

export type network = any;
export type networkProps = any;
export const network: any = createStubComponent('network');

