// @ts-nocheck
import React from 'react';

// Native-specific Stripe provider (iOS/Android)
// Use dynamic require to avoid bundler parsing issues
export function StripeProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { StripeProvider: StripeNative } = require('@stripe/stripe-react-native');
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_KEY || '';

  return (
    <StripeNative publishableKey={publishableKey}>
      {children}
    </StripeNative>
  );
}
