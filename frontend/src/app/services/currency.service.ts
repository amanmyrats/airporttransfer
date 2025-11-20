import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '../../environments/environment';

import {
  CurrencyCode,
  EURO_RATES,
  SUPPORTED_CURRENCIES,
  SUPPORTED_CURRENCY_CODES,
  SupportedCurrency,
} from '../constants/currency.constants';
import { Currency } from '../models/currency.model';

const DEFAULT_SUPPORTED_CURRENCY =
  SUPPORTED_CURRENCIES.find((currency) => currency.code === 'EUR') ?? SUPPORTED_CURRENCIES[0];
const DEFAULT_CURRENCY: Currency = { ...DEFAULT_SUPPORTED_CURRENCY };

const buildSupportedCurrencyMap = (): Map<CurrencyCode, SupportedCurrency> =>
  new Map(SUPPORTED_CURRENCIES.map((currency) => [currency.code, currency] as const));

type EuroRate = { code: CurrencyCode; rate: number };
const FALLBACK_EURO_RATES_MAP = new Map(
  EURO_RATES.map((rate) => [rate.code, rate.rate] as const),
);

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly storageKey = 'selectedCurrency';
  private readonly cacheStorageKey = 'cachedCurrencies';
  private readonly euroRatesCacheKey = 'cachedEuroRates';
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000; // 24 hours
  // cacheTtlMs set to 10 seconds for testing purposes
  // private readonly cacheTtlMs = 10 * 1000; // 10 seconds

  private cacheTimestamp = 0;
  private euroRatesCacheTimestamp = 0;
  private readonly supportedCurrencyMap = buildSupportedCurrencyMap();
  private readonly currenciesState = signal<Currency[]>(
    SUPPORTED_CURRENCIES.map((currency) => ({ ...currency })),
  );
  private readonly euroRatesState = signal<EuroRate[]>(EURO_RATES.map((rate) => ({ ...rate })));

  readonly currencies = this.currenciesState.asReadonly();
  readonly currentCurrency = signal<Currency>(
    { ...DEFAULT_CURRENCY },
  );

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const initialCurrencies = this.loadInitialCurrencies();
    this.currenciesState.set(initialCurrencies);
    this.currentCurrency.set(this.resolveInitialCurrency(initialCurrencies));
    const initialEuroRates = this.loadInitialEuroRates();
    this.euroRatesState.set(initialEuroRates);
    this.syncCurrencyRatesWithEuroRates();
    if (isPlatformBrowser(this.platformId)) {
      this.refreshCurrencies();
      this.refreshEuroRates();
    }
  }

  setCurrency(currencyCode: string): void {
    const normalized = this.normalizeCurrencyCode(currencyCode);
    if (!normalized) {
      console.warn(`Unsupported currency code: ${currencyCode}`);
      return;
    }
    const selectedCurrency =
      this.getCurrencyByCode(normalized) || this.getSupportedCurrencyClone(normalized);

    if (!selectedCurrency) {
      console.warn(`Unsupported currency code: ${currencyCode}`);
      return;
    }

    this.currentCurrency.set({ ...selectedCurrency });
    this.storeCurrency(normalized); // Persist the selected currency
  }

  getCurrencies(): Currency[] {
    return this.currenciesState();
  }

  getCurrencyByCode(code: string | null | undefined): Currency | undefined {
    const normalized = this.normalizeCurrencyCode(code);
    if (!normalized) {
      return undefined;
    }
    return this.currenciesState().find((currency) => currency.code === normalized);
  }

  getCurrencySign(code: string): string | undefined {
    const currency = this.getCurrencyByCode(code);
    return currency ? currency.sign : undefined;
  }

  getCurrencyName(code: string): string | undefined {
    const currency = this.getCurrencyByCode(code);
    return currency ? currency.name : undefined;
  }

  private refreshCurrencies(force = false): void {
    if (!force && this.isCacheFresh()) {
      return;
    }
    this.http
      .get<PaginatedCurrencyResponse>(`${env.baseUrl}${env.apiV1}common/currencies/?page_size=100`)
      .subscribe({
        next: (response) => {
          const mapped = this.mapApiResponseToCurrencies(response);
          if (mapped.length) {
            this.setCurrencies(mapped, true);
          }
        },
        error: (error) => {
          console.error('Failed to fetch currencies from server', error);
        },
      });
  }

  private refreshEuroRates(force = false): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!force && this.isEuroRatesCacheFresh()) {
      return;
    }
    this.http
      .get<EuroRateDto[]>(`${env.baseUrl}${env.apiV1}common/euro-rates-lite/`)
      .subscribe({
        next: (response) => {
          const normalized = this.normalizeEuroRates(response);
          if (normalized.length) {
            this.euroRatesState.set(normalized);
            this.writeEuroRatesCache(normalized);
            this.syncCurrencyRatesWithEuroRates();
          }
        },
        error: (error) => {
          console.error('Failed to fetch euro rates from server', error);
        },
      });
  }

  private mapApiResponseToCurrencies(response: PaginatedCurrencyResponse): Currency[] {
    return (response.results || [])
      .map((item) => {
        const normalizedCode = this.normalizeCurrencyCode(item.code);
        if (!normalizedCode) {
          return null;
        }
        const fallback = this.supportedCurrencyMap.get(normalizedCode);
        if (!fallback) {
          return null;
        }
        const rateValue =
          item.euro_rate !== undefined && item.euro_rate !== null
            ? Number(item.euro_rate)
            : undefined;
        return {
          code: normalizedCode,
          name: item.name || fallback.name,
          sign: item.symbol || fallback.sign,
          rate: rateValue ?? this.getEuroRateFor(normalizedCode) ?? 1,
        } as Currency;
      })
      .filter((currency): currency is Currency => Boolean(currency));
  }

  private setCurrencies(currencies: Currency[], persist = false): void {
    this.currenciesState.set(currencies);
    if (persist) {
      this.writeCache(currencies);
    }
    this.syncCurrentCurrency();
  }

  private syncCurrentCurrency(): void {
    const storedCode = this.getStoredCurrencyCode();
    const preferredCurrency =
      (storedCode && this.getCurrencyByCode(storedCode)) ||
      this.currentCurrency() ||
      this.currenciesState().find((currency) => currency.code === 'EUR') ||
      this.getSupportedCurrencyClone(SUPPORTED_CURRENCIES[0].code);

    if (preferredCurrency) {
      this.currentCurrency.set({ ...preferredCurrency });
    }
  }

  private storeCurrency(currencyCode: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, currencyCode);
    }
  }

  private getStoredCurrency(): Currency | undefined {
    const code = this.getStoredCurrencyCode();
    return code ? this.getCurrencyByCode(code) : undefined;
  }

  private getStoredCurrencyCode(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.storageKey);
    }
    return null;
  }

  convert(amount: number, currency: Currency, toCurrency: Currency): number {
    const fromRate = this.getEuroRateFor(currency.code);
    const toRate = this.getEuroRateFor(toCurrency.code);
    if (!fromRate || !toRate) {
      throw new Error('Currency rate is undefined');
    }
    const euroEquivalent = amount / fromRate;
    const converted = euroEquivalent * toRate;
    return Math.ceil(converted);
  }

  private loadInitialCurrencies(): Currency[] {
    const cached = this.readCache();
    if (cached) {
      this.cacheTimestamp = cached.timestamp;
      const sanitized = this.ensureSupportedCurrencies(cached.currencies);
      if (sanitized.length) {
        return sanitized;
      }
    }
    return SUPPORTED_CURRENCIES.map((currency) => ({ ...currency }));
  }

  private loadInitialEuroRates(): EuroRate[] {
    const cached = this.readEuroRatesCache();
    if (cached) {
      this.euroRatesCacheTimestamp = cached.timestamp;
      const normalized = this.normalizeEuroRates(cached.rates);
      if (normalized.length) {
        return normalized;
      }
    }
    return EURO_RATES.map((rate) => ({ ...rate }));
  }

  private resolveInitialCurrency(currencies: Currency[]): Currency {
    return (
      this.getStoredCurrency() ||
      currencies.find((currency) => currency.code === 'EUR') ||
      currencies[0] ||
      this.getSupportedCurrencyClone(SUPPORTED_CURRENCIES[0].code)!
    );
  }

  private readCache(): CachedCurrenciesPayload | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = localStorage.getItem(this.cacheStorageKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as CachedCurrenciesPayload;
      if (!parsed?.timestamp || !Array.isArray(parsed.currencies)) {
        return null;
      }
      if (Date.now() - parsed.timestamp > this.cacheTtlMs) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private writeCache(currencies: Currency[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const payload: CachedCurrenciesPayload = {
      timestamp: Date.now(),
      currencies,
    };
    localStorage.setItem(this.cacheStorageKey, JSON.stringify(payload));
    this.cacheTimestamp = payload.timestamp;
  }

  private readEuroRatesCache(): CachedEuroRatesPayload | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = localStorage.getItem(this.euroRatesCacheKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as CachedEuroRatesPayload;
      if (!parsed?.timestamp || !Array.isArray(parsed.rates)) {
        return null;
      }
      if (Date.now() - parsed.timestamp > this.cacheTtlMs) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private writeEuroRatesCache(rates: EuroRate[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const payload: CachedEuroRatesPayload = {
      timestamp: Date.now(),
      rates,
    };
    localStorage.setItem(this.euroRatesCacheKey, JSON.stringify(payload));
    this.euroRatesCacheTimestamp = payload.timestamp;
  }

  private ensureSupportedCurrencies(payload: Currency[]): Currency[] {
    const result: Currency[] = [];
    payload.forEach((currency) => {
      const normalized = this.normalizeCurrencyCode(currency.code);
      if (!normalized) {
        return;
      }
      const fallback = this.supportedCurrencyMap.get(normalized);
      if (!fallback) {
        return;
      }
      result.push({
        code: normalized,
        name: currency.name || fallback.name,
        sign: currency.sign || fallback.sign,
        rate:
          typeof currency.rate === 'number' && !Number.isNaN(currency.rate)
            ? currency.rate
            : this.getEuroRateFor(normalized) ?? 1,
      });
    });
    return result;
  }

  private normalizeEuroRates(rates: Array<{ code: string; rate: number }>): EuroRate[] {
    if (!Array.isArray(rates)) {
      return [];
    }
    const normalized: EuroRate[] = [];
    rates.forEach((rate) => {
      const normalizedCode = this.normalizeCurrencyCode(rate.code);
      if (!normalizedCode) {
        return;
      }
      const numericRate = Number(rate.rate);
      if (!Number.isFinite(numericRate) || numericRate <= 0) {
        return;
      }
      normalized.push({ code: normalizedCode, rate: numericRate });
    });
    return normalized;
  }

  private getSupportedCurrencyClone(code: CurrencyCode): Currency | undefined {
    const fallback = this.supportedCurrencyMap.get(code);
    if (!fallback) {
      return undefined;
    }
    const rate = this.getEuroRateFor(code) ?? fallback.rate;
    return { ...fallback, rate };
  }

  private normalizeCurrencyCode(code?: string | null): CurrencyCode | null {
    if (!code) {
      return null;
    }
    const normalized = code.toUpperCase();
    return SUPPORTED_CURRENCY_CODES.includes(normalized as CurrencyCode)
      ? (normalized as CurrencyCode)
      : null;
  }

  private isCacheFresh(): boolean {
    if (!this.cacheTimestamp) {
      return false;
    }
    return Date.now() - this.cacheTimestamp < this.cacheTtlMs;
  }

  private isEuroRatesCacheFresh(): boolean {
    if (!this.euroRatesCacheTimestamp) {
      return false;
    }
    return Date.now() - this.euroRatesCacheTimestamp < this.cacheTtlMs;
  }

  private getEuroRateFor(code: CurrencyCode): number | undefined {
    const rateEntry = this.euroRatesState().find((rate) => rate.code === code);
    if (rateEntry) {
      return rateEntry.rate;
    }
    return FALLBACK_EURO_RATES_MAP.get(code);
  }

  private syncCurrencyRatesWithEuroRates(): void {
    const updatedCurrencies = this.currenciesState().map((currency) => {
      const rate = this.getEuroRateFor(currency.code);
      if (!rate) {
        return currency;
      }
      return {
        ...currency,
        rate,
      };
    });
    this.currenciesState.set(updatedCurrencies);
    this.syncCurrentCurrency();
  }
}

interface PaginatedCurrencyResponse {
  results?: CurrencyApiDto[];
}

interface CurrencyApiDto {
  id: number;
  code: string;
  name?: string;
  symbol?: string;
  euro_rate?: number | string | null;
}

interface CachedCurrenciesPayload {
  timestamp: number;
  currencies: Currency[];
}

interface EuroRateDto {
  code: string;
  rate: number;
}

interface CachedEuroRatesPayload {
  timestamp: number;
  rates: EuroRate[];
}
