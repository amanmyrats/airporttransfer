import { Injectable, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SUPPORTED_CURRENCIES } from '../constants/currency.constants';
import { Currency } from '../models/currency.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  // Use a signal for the current currency
  private currencies: Currency[] = SUPPORTED_CURRENCIES;
  currentCurrency = signal<{ name: string; code: string; sign: string }>(
    SUPPORTED_CURRENCIES.find(currency => currency.code === 'EUR')!
  );

  constructor(private route: ActivatedRoute, private router: Router) {}

  /**
   * Set and navigate to a new currency
   * @param currencyCode - The new currency code to set (e.g., 'USD', 'EUR')
   */
  setCurrency(currencyCode: string): void {
    const selectedCurrency = SUPPORTED_CURRENCIES.find(currency => currency.code === currencyCode);

    if (selectedCurrency) {
      this.currentCurrency.set(selectedCurrency); // Update the signal value
      // const currentRoute = this.router.url.split('?')[0]; // Remove query params from the URL
      // const queryParams = { ...this.route.snapshot.queryParams, currency: currencyCode };
      // this.router.navigate([currentRoute], { queryParams });
    } else {
      console.warn(`Unsupported currency code: ${currencyCode}`);
    }
  }

  /**
   * Detect the currency from the URL and update the signal
   */
  detectCurrency(): void {
    const currencyCode = this.route.snapshot.queryParamMap.get('currency');

    if (currencyCode) {
      const detectedCurrency = SUPPORTED_CURRENCIES.find(currency => currency.code === currencyCode.toUpperCase());

      if (detectedCurrency) {
        this.currentCurrency.set(detectedCurrency); // Update the signal value
      } else {
        console.warn(`Unsupported currency code detected in URL: ${currencyCode}`);
      }
    }
  }


  /**
   * Get the list of all supported currencies.
   * @returns Currency[]
   */
  getCurrencies(): Currency[] {
    return this.currencies;
  }

  /**
   * Find a currency by its code.
   * @param code The code of the currency (e.g., 'EUR', 'USD').
   * @returns Currency | undefined
   */
  getCurrencyByCode(code: string): Currency | undefined {
    return this.currencies.find((currency) => currency.code === code);
  }

  /**
   * Get the currency symbol by its code.
   * @param code The currency code (e.g., 'EUR', 'USD').
   * @returns string | undefined
   */
  getCurrencySign(code: string): string | undefined {
    const currency = this.getCurrencyByCode(code);
    return currency ? currency.sign : undefined;
  }

  /**
   * Get the currency name by its code.
   * @param code The currency code (e.g., 'EUR', 'USD').
   * @returns string | undefined
   */
  getCurrencyName(code: string): string | undefined {
    const currency = this.getCurrencyByCode(code);
    return currency ? currency.name : undefined;
  }


}
