import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { CarType } from '../../models/car-type.model';
import { SUPPORTED_CAR_TYPES } from '../../constants/car-type.constants';

@Component({
  selector: 'app-booking-car-type-selection-form',
  imports: [
    CommonModule, 
  ],
  templateUrl: './booking-car-type-selection-form.component.html',
  styleUrl: './booking-car-type-selection-form.component.scss'
})
export class BookingCarTypeSelectionFormComponent {
  bookingService = inject(BookingService);
  carTypeSelectionOutput = output<any>();

  carTypes: CarType[] = [];

  constructor() {
    this.carTypes = SUPPORTED_CAR_TYPES;
  }

  onCarTypeSelection(carType: any, price: number, currency_code: string, distance: number): void {
    console.log('Selected CarType:', carType);
    // Handle carType selection logic here
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      car_type: carType.code,
      amount: price, 
      currency_code: 'EUR',
      distance: 50, 
      driving_duration: 60,
    });
    if (this.bookingService.bookingCarTypeSelectionForm.valid) {
      this.carTypeSelectionOutput.emit(this.bookingService.bookingCarTypeSelectionForm.value);
    } else {
      console.log('CarType selection form is invalid');
    }
  }

}
