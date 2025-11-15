// @ts-nocheck
import React from 'react';

// Fallback Stripe provider
// Platform-specific implementations are in StripeProvider.web.tsx and StripeProvider.native.tsx
export function StripeProvider({ children }: { children: React.ReactNode }) {
  console.warn('StripeProvider: Using fallback passthrough provider');
  return <>{children}</>;
}
