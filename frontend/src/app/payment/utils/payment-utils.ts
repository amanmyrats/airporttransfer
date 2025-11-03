import { PaymentIntent, PaymentMethod } from '../models/payment.models';

const zeroDecimalCurrencies = new Set(['JPY', 'KRW']);

export const toMinorUnits = (amount: number, currency: string): number => {
  const factor = zeroDecimalCurrencies.has(currency) ? 1 : 100;
  return Math.round(amount * factor);
};

export const isCardMethod = (method: PaymentMethod | null | undefined): boolean =>
  method === 'CARD';

export const isOfflineMethod = (method: PaymentMethod | null | undefined): boolean =>
  method === 'CASH' || method === 'BANK_TRANSFER' || method === 'RUB_PHONE_TRANSFER';

export const formatMinorUnits = (amountMinor: number, currency: string): string => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  });
  const divisor = zeroDecimalCurrencies.has(currency) ? 1 : 100;
  return formatter.format(amountMinor / divisor);
};

export const intentIsFinal = (intent: PaymentIntent | null): boolean =>
  !!intent && ['succeeded', 'canceled', 'failed'].includes(intent.status);

export const intentRequiresAction = (intent: PaymentIntent | null): boolean =>
  intent?.status === 'requires_action';
