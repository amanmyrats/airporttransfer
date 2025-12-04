import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';

import { ThreeDSHandler, ThreeDsContext, ThreeDsResultStatus } from '../three-ds.handlers';

@Injectable()
export class StripeThreeDsHandler implements ThreeDSHandler {
  private stripePromise: Promise<Stripe | null> | null = null;
  private currentKey: string | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  canHandle(provider: string): boolean {
    return provider.toLowerCase() === 'stripe';
  }

  async confirm(clientSecret: string, context?: ThreeDsContext): Promise<ThreeDsResultStatus> {
    if (!isPlatformBrowser(this.platformId)) {
      return 'requires_payment_method';
    }
    const publishableKey = this.resolvePublishableKey(context);
    if (!publishableKey) {
      console.warn('Stripe handler missing publishable key metadata.');
      return 'requires_payment_method';
    }
    const stripe = await this.getStripe(publishableKey);
    if (!stripe) {
      return 'failed';
    }
    const result = await stripe.handleCardAction(clientSecret);
    if (result.error) {
      return 'failed';
    }
    const status = result.paymentIntent?.status;
    switch (status) {
      case 'succeeded':
        return 'succeeded';
      case 'requires_payment_method':
        return 'requires_payment_method';
      default:
        return 'processing';
    }
  }

  private resolvePublishableKey(context?: ThreeDsContext): string | null {
    const metadata = context?.metadata ?? context?.intent?.metadata ?? {};
    return (metadata?.['publishable_key'] as string) ?? null;
  }

  private async getStripe(key: string): Promise<Stripe | null> {
    if (!this.stripePromise || this.currentKey !== key) {
      this.currentKey = key;
      this.stripePromise = loadStripe(key);
    }
    return this.stripePromise;
  }
}
