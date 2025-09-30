import { Component, Input } from '@angular/core';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { GoogleMapsService } from '../../services/google-maps.service';
import { BookingService } from '../../services/booking.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { SOCIAL_ICONS } from '../../constants/social.constants';
// import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-banner-form',
  imports: [
    FormsModule, ReactiveFormsModule, 
    ButtonModule, CommonModule, 
    GmapsAutocompleteDirective, 
  ],
  templateUrl: './booking-banner-form.component.html',
  styleUrl: './booking-banner-form.component.scss'
})
export class BookingBannerFormComponent {
  @Input() langInput: any | null = null; // Input property for language selection
  socialIcons = SOCIAL_ICONS;
  isBookNowLoading: boolean = false;

  constructor(
    public googleMapsService: GoogleMapsService, 
    public bookingService: BookingService, 
    private router: Router, 
    public languageService: LanguageService, 
    private priceCalculatorService: PriceCalculatorService, 
  ) {
  }

  onSubmit(): void {
    this.isBookNowLoading = true;
    const formValue = this.bookingService.bookingInitialForm.value;
    console.log('Booking Form:', formValue);
    const origin: google.maps.LatLngLiteral = { 
      lat: formValue.pickup_lat || 0, lng: formValue.pickup_lng || 0 };
    const destination: google.maps.LatLngLiteral = { 
      lat: formValue.dest_lat || 0, lng: formValue.dest_lng || 0 };
      console.log('Origin:', origin, 'Destination:', destination);

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(
      formValue.pickup_lat, formValue.pickup_lng);
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(
      formValue.dest_lat, formValue.dest_lng);

    console.log('Coefficients:', airportCoefficientPickUp, airportCoefficientDest);
    // Assign bigger airport coefficient to booking form
    this.bookingService.bookingInitialForm.get('airport_coefficient')!.setValue(
      Math.max(airportCoefficientPickUp, airportCoefficientDest)
    );
    this.bookingService.airportCoefficient.set(
      Math.max(airportCoefficientPickUp, airportCoefficientDest)
    );
    
    this.googleMapsService.calculateDrivingDistanceAndTime(origin, destination
    ).then(result => {
        this.router.navigate([`${this.langInput.code}/${NAVBAR_MENU.bookNow.slug[this.langInput.code]}/`], {
          queryParams: {
            step: 2,
            pickup_full: formValue.pickup_full,
            dest_full: formValue.dest_full,
            pickup_lat: formValue.pickup_lat,
            pickup_lng: formValue.pickup_lng,
            dest_lat: formValue.dest_lat,
            dest_lng: formValue.dest_lng, 
            distance: result.distance,
            driving_duration: result.duration, 
            airport_coefficient: formValue.airport_coefficient
          },
        });
    }).catch(error => {
      this.isBookNowLoading = false;
      console.error('Error calculating distance:', error);
      this.router.navigate([`${this.langInput.code}/${NAVBAR_MENU.bookNow.slug[this.langInput.code]}/`], {
        queryParams: {
          step: 2,
          pickup_full: formValue.pickup_full,
          dest_full: formValue.dest_full,
          pickup_lat: formValue.pickup_lat,
          pickup_lng: formValue.pickup_lng,
          dest_lat: formValue.dest_lat,
          dest_lng: formValue.dest_lng, 
          distance: 0,
          driving_duration: 0, 
          airport_coefficient: formValue.airport_coefficient
        },
      });
    });

  }

  onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
    this.isBookNowLoading = true;
    console.log('Pickup place selected:', place);
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng
    });
    this.isBookNowLoading = false;
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    this.isBookNowLoading = true;
    console.log('Destination place selected:', place);
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng
    });
    this.isBookNowLoading = false;
  }

  preventFormSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the form from submitting
    }
  }

  getTranslation(key: string): string {
    if (typeof key !== 'string') {
      console.error('Translation key is not a string:', key);
      return '';
    }
  
    const keys = key.split('.');
    let value = this.translations;
    for (const k of keys) {
      value = value[k];
      if (!value) return key; // Return key if translation not found
    }
    return value[this.langInput.code] || key;
  }

  clearField(controlName: string): void {
    this.bookingService.bookingInitialForm.get(controlName)?.setValue('');
  }
  

  translations: any = {
    pickUp: {
      en: 'Pickup Location',
      de: 'Abholort',
      ru: 'Место встречи',
      tr: 'Alış Yeri',
    }, 
    pickUpPlaceHolder: {
      en: 'Enter your pickup location', 
      de: 'Geben Sie Ihren Abholort ein',
      ru: 'Введите место встречи',
      tr: 'Alış yerinizi girin',
    },
    dropOff: {
      en: 'Dropoff Location',
      de: 'Zielort',
      ru: 'Место назначения',
      tr: 'İniş Yeri',
    },
    dropOffPlaceHolder: {
      en: 'Enter your dropoff location',
      de: 'Geben Sie Ihren Zielort ein',
      ru: 'Введите место назначения',
      tr: 'İniş yerinizi girin',
    },
    // bookNow: {
    //   en: 'Book Now',
    //   de: 'Jetzt buchen',
    //   ru: 'Забронировать сейчас',
    //   tr: 'Şimdi rezervasyon yap',
    // },
    bookNow: {
      en: 'See Price Options',
      de: 'Preisoptionen anzeigen',
      ru: 'Посмотреть варианты цен',
      tr: 'Fiyat seçeneklerini gör',
    },
    orWriteToUs: {
      en: 'Or write to us directly for 24/7 support and reservation assistance.',
      de: 'Oder schreiben Sie uns direkt für 24/7 Unterstützung und Reservierungshilfe.',
      ru: 'Или напишите нам напрямую для круглосуточной поддержки и помощи в бронировании.',
      tr: 'Veya 24/7 destek ve rezervasyon yardımı için doğrudan bize yazın.',
    }
  };
}
