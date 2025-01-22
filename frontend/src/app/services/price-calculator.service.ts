import { Injectable } from '@angular/core';
import { AIRPORTS } from '../constants/airport.constans';

@Injectable({
  providedIn: 'root'
})
export class PriceCalculatorService {
  airports = AIRPORTS;
  private baseRatePerKm = 0.9; // Base rate in euros
  private minimumDistanceKm = 35; // Minimum distance for pricing

  calculatePrice(distanceKm: number, carCoefficient: number, cityCoefficient: number = 1): number {
    const effectiveDistance = Math.max(distanceKm, this.minimumDistanceKm);
    const basePrice = effectiveDistance * this.baseRatePerKm;
    return basePrice * carCoefficient * cityCoefficient;
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

  // isPlaceInAnkara(lat: number, lng: number): boolean {
  //   return (
  //     lat >= this.cities.ANKARA.BOUNDS.south &&
  //     lat <= this.cities.ANKARA.BOUNDS.north &&
  //     lng >= this.cities.ANKARA.BOUNDS.west &&
  //     lng <= this.cities.ANKARA.BOUNDS.east
  //   );
  // };

  getAirportCoefficient(lat: number, lng: number): number {
    for (let airport of this.airports) {
      if (
        lat >= airport.bounds.south &&
        lat <= airport.bounds.north &&
        lng >= airport.bounds.west &&
        lng <= airport.bounds.east
      ) {
        return airport.coefficient;
      }
    }
    return 1.0;
  }

}
