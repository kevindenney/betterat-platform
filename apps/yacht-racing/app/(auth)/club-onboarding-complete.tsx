import React from 'react';
import { View } from 'react-native';
import { OnboardingCompletion } from '@betterat/ui/components/onboarding';
import { useAuth } from '@betterat/core/providers/AuthProvider';

export default function ClubOnboardingComplete() {
  const { user } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <OnboardingCompletion
        userType="club"
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
      />
    </View>
  );
}
