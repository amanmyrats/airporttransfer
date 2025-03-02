import { Injectable } from '@angular/core';
import { AIRPORTS } from '../constants/airport.constans';
import { CarType } from '../models/car-type.model';

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

  calculateFixedPrice(distanceKm: number, carType: CarType, cityCoefficient: number = 1): number {
    if (carType.code == 'VITO') {
      return this.getVitoPrice(distanceKm) * cityCoefficient;
    } else if (carType.code == 'SPRINTER') {
      return this.getSprinterPrice(distanceKm) * cityCoefficient;
    } else {
      return 0
    }
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

  getVitoPrice(distance: number): number {
      const pricingTable = [
          { min: 0, max: 30, price: 20 },
          { min: 31, max: 37, price: 25 },
          { min: 38, max: 45, price: 30 },
          { min: 46, max: 71, price: 35 },
          { min: 71, max: 90, price: 40 },
          { min: 91, max: 119, price: 45 },
          { min: 120, max: 135, price: 50 },
          { min: 136, max: 150, price: 60 },
          { min: 151, max: 175, price: 80 },
          { min: 176, max: 225, price: 100 },
      ];

      for (const range of pricingTable) {
          if (distance >= range.min && distance <= range.max) {
              return range.price;
          }
      }

      return 0; // Return null if distance is out of range
  }

  getSprinterPrice(distance: number): number {
    const sprinterPricingTable = [
        { min: 0, max: 30, price: 35 },
        { min: 31, max: 37, price: 40 },
        { min: 38, max: 45, price: 50 },
        { min: 46, max: 71, price: 60 },
        { min: 71, max: 90, price: 70 },
        { min: 91, max: 119, price: 80 },
        { min: 120, max: 135, price: 100 },
        { min: 136, max: 150, price: 120 },
        { min: 151, max: 175, price: 140 },
        { min: 176, max: 225, price: 160 },
    ];

    for (const range of sprinterPricingTable) {
        if (distance >= range.min && distance <= range.max) {
            return range.price;
        }
    }

    return 0; // Return null if distance is out of range
  }

}
