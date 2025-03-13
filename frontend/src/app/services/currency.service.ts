import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SUPPORTED_CURRENCIES } from '../constants/currency.constants';
import { Currency } from '../models/currency.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private currencies: Currency[] = SUPPORTED_CURRENCIES;
  private storageKey = 'selectedCurrency'; // Key for local storage

  // Use a signal for the current currency
  currentCurrency = signal<Currency>(
    this.getStoredCurrency() || SUPPORTED_CURRENCIES.find((currency) => currency.code === 'EUR')!
  );

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  setCurrency(currencyCode: string): void {
    const selectedCurrency = SUPPORTED_CURRENCIES.find((currency) => currency.code === currencyCode);

    if (selectedCurrency) {
      this.currentCurrency.set(selectedCurrency); // Update the signal value
      this.storeCurrency(currencyCode); // Persist the selected currency
    } else {
      console.warn(`Unsupported currency code: ${currencyCode}`);
    }
  }

  getCurrencies(): Currency[] {
    return this.currencies;
  }

  getCurrencyByCode(code: string): Currency | undefined {
    return this.currencies.find((currency) => currency.code === code);
  }

  getCurrencySign(code: string): string | undefined {
    const currency = this.getCurrencyByCode(code);
    return currency ? currency.sign : undefined;
  }

  getCurrencyName(code: string): string | undefined {
    const currency = this.getCurrencyByCode(code);
    return currency ? currency.name : undefined;
  }

  private storeCurrency(currencyCode: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, currencyCode);
    }
  }

  private getStoredCurrency(): Currency | undefined {
    if (isPlatformBrowser(this.platformId)) {
      const currencyCode = localStorage.getItem(this.storageKey);
      return SUPPORTED_CURRENCIES.find((currency) => currency.code === currencyCode);
    }
    return undefined;
  }

//   export const SUPPORTED_CURRENCIES = [
//     { 
//         code: 'EUR', 
//         sign: '€', 
//         name: 'Euro',
//         rate: 1,
//     },
//     { 
//         code: 'USD', 
//         sign: '$', 
//         name: 'US Dollar',
//         rate: 1.18,
//     },
//     { 
//         code: 'GBP', 
//         sign: '£', 
//         name: 'British Pound',
//         rate: 0.9,
//     },
// ];

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

}
