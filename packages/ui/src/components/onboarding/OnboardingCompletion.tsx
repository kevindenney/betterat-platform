import React from 'react';
import { View, Text } from 'react-native';

export interface OnboardingCompletionProps {
  [key: string]: any;
}

export function OnboardingCompletion(props: OnboardingCompletionProps) {
  console.warn('[Stub] OnboardingCompletion rendered', props);
  return (
    <View>
      <Text>OnboardingCompletion - Stub</Text>
    </View>
  );
}

export default OnboardingCompletion;
