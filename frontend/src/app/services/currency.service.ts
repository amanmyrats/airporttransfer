import { Injectable, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SUPPORTED_CURRENCIES } from '../constants/currency.constants';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  // Use a signal for the current currency
  currentCurrency = signal<{ name: string; code: string; sign: string }>(
    SUPPORTED_CURRENCIES.find(currency => currency.code === 'EUR')! // Default currency: USD
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
}
