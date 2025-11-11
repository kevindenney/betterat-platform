// Auto-generated stub for @betterat/ui/components/ui/gluestack-ui-provider
import React from 'react';
import { View, Text } from 'react-native';

const createStubComponent = (label: string) => {
  const Stub = (props: any) => {
    console.warn('[Stub] @betterat/ui/components/ui/gluestack-ui-provider -> ' + label, props);
    // Render children if they exist, otherwise render stub text
    return props.children || (
      <View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>
    );
  };
  return Stub;
};

export type GluestackUIProvider = any;
export type GluestackUIProviderProps = any;
export const GluestackUIProvider: any = createStubComponent('GluestackUIProvider');

export type gluestack_ui_provider = any;
export type gluestack_ui_providerProps = any;
export const gluestack_ui_provider: any = createStubComponent('gluestack_ui_provider');

