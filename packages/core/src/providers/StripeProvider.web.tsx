// @ts-nocheck
import React from 'react';

// Web-specific Stripe provider - uses passthrough
// For web payments, integrate @stripe/stripe-js separately where needed
export function StripeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
