import { InjectionToken } from '@angular/core';

import { PaymentIntentDto } from '../models/payment.models';

export type ThreeDsResultStatus =
  | 'succeeded'
  | 'processing'
  | 'requires_payment_method'
  | 'failed';

export interface ThreeDsContext {
  intent?: PaymentIntentDto;
  metadata?: Record<string, unknown> | null;
}

export interface ThreeDSHandler {
  canHandle(provider: string): boolean;
  confirm(clientSecretOrToken: string, context?: ThreeDsContext): Promise<ThreeDsResultStatus>;
}

export const THREE_DS_HANDLERS = new InjectionToken<ThreeDSHandler[]>('THREE_DS_HANDLERS', {
  factory: () => [],
});
