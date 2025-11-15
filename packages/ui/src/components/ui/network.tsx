// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/network
import React from 'react';
import { View, Text } from 'react-native';

const stubWarningsShown = new Set<string>();

const createStubComponent = (label: string) => {
  const Stub = (props: any) => {
    if (!stubWarningsShown.has(label)) {
      console.warn('[Stub] @betterat/ui/components/ui/network -> ' + label, props);
      stubWarningsShown.add(label);
    }
    // Render children if they exist, otherwise render nothing for NetworkStatusBanner
    if (label === 'NetworkStatusBanner') {
      return props?.children || null;
    }
    return props?.children || (
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
