// @ts-nocheck
// Auto-generated stub for @betterat/ui/components/ui/empty
import React from 'react';
import { View, Text } from 'react-native';

const createStubComponent = (label: string) => {
  const Stub = (props: any) => {
    console.warn('[Stub] @betterat/ui/components/ui/empty -> ' + label, props);
    return (
      <View accessibilityLabel={label}>
        <Text>{label} - Stub</Text>
      </View>
    );
  };
  return Stub;
};

export type EmptyState = any;
export type EmptyStateProps = any;
export const EmptyState: any = createStubComponent('EmptyState');

export type empty = any;
export type emptyProps = any;
export const empty: any = createStubComponent('empty');

