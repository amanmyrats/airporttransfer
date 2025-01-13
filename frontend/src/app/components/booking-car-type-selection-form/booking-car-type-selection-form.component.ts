import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit, output } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { CarType } from '../../models/car-type.model';
import { SUPPORTED_CAR_TYPES } from '../../constants/car-type.constants';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-booking-car-type-selection-form',
  imports: [
    CommonModule, 
  ],
  templateUrl: './booking-car-type-selection-form.component.html',
  styleUrl: './booking-car-type-selection-form.component.scss'
})
export class BookingCarTypeSelectionFormComponent implements OnInit {
  bookingService = inject(BookingService);
  priceCalculatorService = inject(PriceCalculatorService);
  currencyService = inject(CurrencyService);
  carTypeSelectionOutput = output<any>();

  carTypes: CarType[] = [];

  constructor(
  ) {
    this.carTypes = SUPPORTED_CAR_TYPES;
  }

  ngOnInit(): void {
    console.log('BookingCarTypeSelectionFormComponent initialized');
  }

  onCarTypeSelection(carType: any, price: number, currency_code: string, distance: number): void {
    console.log('Selected CarType:', carType);
    // Handle carType selection logic here
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      car_type: carType.code,
      amount: price, 
      currency_code: currency_code,
      distance: distance, 
      driving_duration: 60,
    });
    if (this.bookingService.bookingCarTypeSelectionForm.valid) {
      this.carTypeSelectionOutput.emit(this.bookingService.bookingCarTypeSelectionForm.value);
    } else {
      console.log('CarType selection form is invalid');
    }
  }

  // Dynamically calculate prices based on current currency and distance
  calculatedPrices = computed(() =>
    this.carTypes.map((carType) => {
      const priceInEuros = this.priceCalculatorService.calculatePrice(
        this.bookingService.distance(), 
        carType.coefficient!);
      return {
        ...carType,
        price: this.priceCalculatorService.getRoundedPrice(
          priceInEuros, 
          this.currencyService.currentCurrency().code!, 
          this.currencyService.currentCurrency().rate!),
      };
    })
  );
}
