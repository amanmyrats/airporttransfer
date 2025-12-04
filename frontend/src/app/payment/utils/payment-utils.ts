import { PaymentIntentDto, PaymentMethod } from '../models/payment.models';

export const isCardMethod = (method: PaymentMethod | null | undefined): boolean =>
  method === 'CARD';

export const isOfflineMethod = (method: PaymentMethod | null | undefined): boolean =>
  method === 'CASH' || method === 'BANK_TRANSFER' || method === 'RUB_PHONE_TRANSFER';

export const intentIsFinal = (intent: PaymentIntentDto | null): boolean =>
  !!intent && ['succeeded', 'canceled', 'failed'].includes(intent.status);

export const intentRequiresAction = (intent: PaymentIntentDto | null): boolean =>
  intent?.status === 'requires_action';
