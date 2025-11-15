// @ts-nocheck
import React from 'react';
import { View, Text } from 'react-native';

export interface OnboardingProgressProps {
  [key: string]: any;
}

export function OnboardingProgress(props: OnboardingProgressProps) {
  console.warn('[Stub] OnboardingProgress rendered', props);
  return (
    <View>
      <Text>OnboardingProgress - Stub</Text>
    </View>
  );
}

export default OnboardingProgress;
