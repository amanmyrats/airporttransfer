export const SUPPORTED_CURRENCIES = [
  {
    code: 'EUR',
    sign: '€',
    name: 'Euro',
    rate: 1,
  },
  {
    code: 'USD',
    sign: '$',
    name: 'US Dollar',
    rate: 1.18,
  },
  {
    code: 'GBP',
    sign: '£',
    name: 'British Pound',
    rate: 0.9,
  },
  {
    code: 'RUB',
    sign: '₽',
    name: 'Russian Ruble',
    rate: 100,
  },
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type CurrencyCode = SupportedCurrency['code'];
export const SUPPORTED_CURRENCY_CODES: readonly CurrencyCode[] = SUPPORTED_CURRENCIES.map(
  (currency) => currency.code,
);

export const EURO_RATES: ReadonlyArray<Pick<SupportedCurrency, 'code' | 'rate'>> =
  SUPPORTED_CURRENCIES.map(({ code, rate }) => ({
    code,
    rate,
  }));
