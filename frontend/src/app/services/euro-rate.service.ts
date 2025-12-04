import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '../../environments/environment';

import { EURO_RATES } from '../constants/currency.constants';
import { EuroRate } from '../models/euro-rate.model';

interface PaginatedEuroRateResponse {
  results?: EuroRate[];
}

interface CachedEuroRatesPayload {
  timestamp: number;
  rates: EuroRate[];
}

@Injectable({
  providedIn: 'root',
})
export class EuroRateService {
  private readonly cacheKey = 'cachedEuroRates';
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000; // 24 hours

  private cacheTimestamp = 0;
  private readonly euroRatesState = signal<EuroRate[]>(this.loadInitialRates());

  readonly euroRates = this.euroRatesState.asReadonly();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.refreshRates();
    }
  }

  getRates(): EuroRate[] {
    return this.euroRatesState();
  }

  getRateByCode(code: string): EuroRate | undefined {
    return this.euroRatesState().find((rate) => rate.currency_code === code);
  }

  private refreshRates(force = false): void {
    if (!force && this.isCacheFresh()) {
      return;
    }
    this.http
      .get<PaginatedEuroRateResponse>(`${env.baseUrl}${env.apiV1}common/eurorates/?page_size=100`)
      .subscribe({
        next: (response) => {
          const payload = response.results ?? [];
          if (payload.length) {
            this.setRates(payload, true);
          }
        },
        error: (error) => {
          console.error('Failed to fetch euro rates', error);
        },
      });
  }

  private setRates(rates: EuroRate[], persist = false): void {
    this.euroRatesState.set(rates);
    if (persist) {
      this.writeCache(rates);
    }
  }

  private loadInitialRates(): EuroRate[] {
    const cached = this.readCache();
    if (cached) {
      this.cacheTimestamp = cached.timestamp;
      return cached.rates;
    }
    return EURO_RATES.map((item) => ({
      currency_code: item.code,
      euro_rate: item.rate,
    }));
  }

  private readCache(): CachedEuroRatesPayload | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const raw = localStorage.getItem(this.cacheKey);
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

  private writeCache(rates: EuroRate[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const payload: CachedEuroRatesPayload = {
      timestamp: Date.now(),
      rates,
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(payload));
    this.cacheTimestamp = payload.timestamp;
  }

  private isCacheFresh(): boolean {
    if (!this.cacheTimestamp) {
      return false;
    }
    return Date.now() - this.cacheTimestamp < this.cacheTtlMs;
  }
}
