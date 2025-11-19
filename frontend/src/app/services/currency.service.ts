import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '../../environments/environment';

import { SUPPORTED_CURRENCIES } from '../constants/currency.constants';
import { Currency } from '../models/currency.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly storageKey = 'selectedCurrency';
  private readonly cacheStorageKey = 'cachedCurrencies';
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000; // 24 hours

  private cacheTimestamp = 0;
  private readonly currenciesState = signal<Currency[]>(SUPPORTED_CURRENCIES);

  readonly currencies = this.currenciesState.asReadonly();
  readonly currentCurrency = signal<Currency>(
    SUPPORTED_CURRENCIES.find((currency) => currency.code === 'EUR') || SUPPORTED_CURRENCIES[0]
  );

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const initialCurrencies = this.loadInitialCurrencies();
    this.currenciesState.set(initialCurrencies);
    this.currentCurrency.set(this.resolveInitialCurrency(initialCurrencies));
    if (isPlatformBrowser(this.platformId)) {
      this.refreshCurrencies();
    }
  }

  setCurrency(currencyCode: string): void {
    const selectedCurrency =
      this.getCurrencyByCode(currencyCode) ||
      SUPPORTED_CURRENCIES.find((currency) => currency.code === currencyCode);

    if (selectedCurrency) {
      this.currentCurrency.set(selectedCurrency); // Update the signal value
      this.storeCurrency(currencyCode); // Persist the selected currency
    } else {
      console.warn(`Unsupported currency code: ${currencyCode}`);
    }
  }

  getCurrencies(): Currency[] {
    return this.currenciesState();
  }

  getCurrencyByCode(code: string): Currency | undefined {
    return this.currenciesState().find((currency) => currency.code === code);
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

  private mapApiResponseToCurrencies(response: PaginatedCurrencyResponse): Currency[] {
    const fallbackMap = new Map(
      SUPPORTED_CURRENCIES.map((currency) => [currency.code, currency] as const)
    );

    return (response.results || [])
      .map((item) => {
        const fallback = item.code ? fallbackMap.get(item.code) : undefined;
        const rateValue =
          item.euro_rate !== undefined && item.euro_rate !== null
            ? Number(item.euro_rate)
            : undefined;
        return {
          code: item.code,
          name: item.name || fallback?.name || item.code,
          sign: item.symbol || fallback?.sign || item.code,
          rate: rateValue ?? fallback?.rate ?? 1,
        } as Currency;
      })
      .filter((currency) => Boolean(currency.code));
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
      SUPPORTED_CURRENCIES[0];

    if (preferredCurrency) {
      this.currentCurrency.set(preferredCurrency);
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
    if (toCurrency.rate === undefined) {
      throw new Error('toCurrency rate is undefined');
    }
    if (currency.rate === undefined) {
      throw new Error('currency rate is undefined');
    }
    const euroEquivalent = amount / currency.rate;
    return Math.round(euroEquivalent * toCurrency.rate);
  }

  private loadInitialCurrencies(): Currency[] {
    const cached = this.readCache();
    if (cached) {
      this.cacheTimestamp = cached.timestamp;
      return cached.currencies;
    }
    return SUPPORTED_CURRENCIES;
  }

  private resolveInitialCurrency(currencies: Currency[]): Currency {
    return (
      this.getStoredCurrency() ||
      currencies.find((currency) => currency.code === 'EUR') ||
      currencies[0] ||
      SUPPORTED_CURRENCIES[0]
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

  private isCacheFresh(): boolean {
    if (!this.cacheTimestamp) {
      return false;
    }
    return Date.now() - this.cacheTimestamp < this.cacheTtlMs;
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
