import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PriceCalculatorService {
  private baseRatePerKm = 0.9; // Base rate in euros
  private minimumDistanceKm = 35; // Minimum distance for pricing

  calculatePrice(distanceKm: number, carCoefficient: number): number {
    const effectiveDistance = Math.max(distanceKm, this.minimumDistanceKm);
    const basePrice = effectiveDistance * this.baseRatePerKm;
    return basePrice * carCoefficient;
  }

  convertCurrency(priceInEuros: number, currency: string, rate: number): number {
    if (!rate) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    return priceInEuros * rate;
  }

  getFormattedPrice(priceInEuros: number, currency: string, rate: number): string {
    const convertedPrice = this.convertCurrency(priceInEuros, currency, rate);
    return `${convertedPrice.toFixed(2)} ${currency}`;
  }

  getRoundedPrice(priceInEuros: number, currency: string, rate: number): number {
    const convertedPrice = this.convertCurrency(priceInEuros, currency, rate);
    return Math.round(convertedPrice);
  }

}
