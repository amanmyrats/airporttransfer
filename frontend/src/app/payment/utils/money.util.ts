const CURRENCY_EXPONENTS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  VND: 0,
  CLP: 0,
  HUF: 0,
  TWD: 0,
  KWD: 3,
  BHD: 3,
  OMR: 3,
  JOD: 3,
};

const DEFAULT_EXPONENT = 2;

const currencyFactor = (currency: string): number => {
  const exponent = CURRENCY_EXPONENTS[currency.toUpperCase()] ?? DEFAULT_EXPONENT;
  return 10 ** exponent;
};

export const minorToMajor = (amountMinor: number, currency: string): number =>
  amountMinor / currencyFactor(currency);

export const majorToMinor = (amountMajor: number, currency: string): number =>
  Math.round(amountMajor * currencyFactor(currency));

export const formatMinor = (
  amountMinor: number,
  currency: string,
  locale?: string,
): string =>
  new Intl.NumberFormat(locale ?? undefined, {
    style: 'currency',
    currency,
  }).format(minorToMajor(amountMinor, currency));

export const getCurrencyFactor = currencyFactor;
