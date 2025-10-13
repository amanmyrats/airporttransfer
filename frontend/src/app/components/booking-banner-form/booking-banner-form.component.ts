import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { BookingService } from '../../services/booking.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { LanguageService } from '../../services/language.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { BookingFormComponent, BookingSearchEvent } from '../booking-form/booking-form.component';

@Component({
  selector: 'app-booking-banner-form',
  imports: [
    CommonModule,
    BookingFormComponent,
  ],
  templateUrl: './booking-banner-form.component.html',
  styleUrl: './booking-banner-form.component.scss',
})
export class BookingBannerFormComponent {
  @Input() langInput: any | null = null;

  constructor(
    private googleMapsService: GoogleMapsService,
    private bookingService: BookingService,
    private router: Router,
    private languageService: LanguageService,
    private priceCalculatorService: PriceCalculatorService,
  ) {}

  onSearchVehicle(event: BookingSearchEvent): void {
    const { formValue, complete, fail } = event;
    const origin: google.maps.LatLngLiteral = {
      lat: formValue.pickup_lat || 0,
      lng: formValue.pickup_lng || 0,
    };
    const destination: google.maps.LatLngLiteral = {
      lat: formValue.dest_lat || 0,
      lng: formValue.dest_lng || 0,
    };

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(
      formValue.pickup_lat,
      formValue.pickup_lng,
    );
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(
      formValue.dest_lat,
      formValue.dest_lng,
    );
    const airportCoefficient = Math.max(airportCoefficientPickUp, airportCoefficientDest);

    this.bookingService.bookingInitialForm
      .get('airport_coefficient')
      ?.setValue(airportCoefficient);
    this.bookingService.airportCoefficient.set(airportCoefficient);

    this.googleMapsService
      .calculateDrivingDistanceAndTime(origin, destination)
      .then(result => {
        return this.router.navigate(
          [`${this.languageCode}/${NAVBAR_MENU.bookNow.slug[this.languageCode]}/`],
          {
            queryParams: {
              step: 2,
              pickup_short: formValue.pickup_short,
              dest_short: formValue.dest_short,
              pickup_full: formValue.pickup_full,
              dest_full: formValue.dest_full,
              pickup_lat: formValue.pickup_lat,
              pickup_lng: formValue.pickup_lng,
              dest_lat: formValue.dest_lat,
              dest_lng: formValue.dest_lng,
              distance: result.distance,
              driving_duration: result.duration,
              airport_coefficient: airportCoefficient,
            },
          },
        );
      })
      .catch(error => {
        console.error('Error calculating distance:', error);
        return this.router.navigate(
          [`${this.languageCode}/${NAVBAR_MENU.bookNow.slug[this.languageCode]}/`],
          {
            queryParams: {
              step: 2,
              pickup_short: formValue.pickup_short,
              dest_short: formValue.dest_short,
              pickup_full: formValue.pickup_full,
              dest_full: formValue.dest_full,
              pickup_lat: formValue.pickup_lat,
              pickup_lng: formValue.pickup_lng,
              dest_lat: formValue.dest_lat,
              dest_lng: formValue.dest_lng,
              distance: 0,
              driving_duration: 0,
              airport_coefficient: airportCoefficient,
            },
          },
        );
      })
      .then(() => complete())
      .catch((navigationError) => {
        console.error('Navigation error after search submission:', navigationError);
        fail(navigationError);
      });
  }

  private get languageCode(): string {
    return this.langInput?.code ?? this.languageService.currentLang().code;
  }
}
