export type StripeConnectStatus = {
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
};

export const StripeConnectService = {
  async startOnboarding(
    coachProfileId: string,
    successUrl: string,
    refreshUrl: string
  ) {
    console.warn('[Stub] StripeConnectService.startOnboarding', {
      coachProfileId,
      successUrl,
      refreshUrl
    });

    return {
      success: true,
      url: successUrl,
      accountId: coachProfileId,
      error: null as string | null
    };
  },

  async refreshAccountStatus(coachProfileId: string) {
    console.warn('[Stub] StripeConnectService.refreshAccountStatus', coachProfileId);
  },

  async getConnectStatus(_coachProfileId: string): Promise<StripeConnectStatus> {
    console.warn('[Stub] StripeConnectService.getConnectStatus');
    return {
      chargesEnabled: false,
      detailsSubmitted: false
    };
  }
};
