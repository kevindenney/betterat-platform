import React from 'react';
import { Text, View } from 'react-native';

type PlaceholderProps = {
  title?: string;
};

const OnboardingPlaceholder: React.FC<PlaceholderProps> = ({ title }) => (
  <View style={{ padding: 16 }}>
    <Text>{title ?? 'Onboarding component placeholder'}</Text>
  </View>
);

export const OnboardingProgress = () => <OnboardingPlaceholder title="OnboardingProgress" />;
export const OnboardingCompletion = () => <OnboardingPlaceholder title="OnboardingCompletion" />;
export const OnboardingDataTally = () => <OnboardingPlaceholder title="OnboardingDataTally" />;
export const OnboardingSummary = () => <OnboardingPlaceholder title="OnboardingSummary" />;
export const PersonaTabBar = () => <OnboardingPlaceholder title="PersonaTabBar" />;
export const OnboardingProgressBar = () => <OnboardingPlaceholder title="OnboardingProgressBar" />;
export const OnboardingSection = () => <OnboardingPlaceholder title="OnboardingSection" />;
export const FreeformInputField = () => <OnboardingPlaceholder title="FreeformInputField" />;
export const ExtractedDataPreview = () => <OnboardingPlaceholder title="ExtractedDataPreview" />;
export const QuickPasteOptions = () => <OnboardingPlaceholder title="QuickPasteOptions" />;
export const OnboardingFormFields = () => <OnboardingPlaceholder title="OnboardingFormFields" />;
export const EnhancedClubOnboarding = () => <OnboardingPlaceholder title="EnhancedClubOnboarding" />;
export const ClubOnboardingChat = () => <OnboardingPlaceholder title="ClubOnboardingChat" />;
