import { Component } from '@angular/core';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { GoogleMapsService } from '../../services/google-maps.service';
import { BookingService } from '../../services/booking.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { SOCIAL_ICONS } from '../../constants/social.constants';

@Component({
  selector: 'app-booking-banner-form',
  imports: [
    GmapsAutocompleteDirective, 
    FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: './booking-banner-form.component.html',
  styleUrl: './booking-banner-form.component.scss'
})
export class BookingBannerFormComponent {
  socialIcons = SOCIAL_ICONS;

  constructor(
    public googleMapsService: GoogleMapsService, 
    public bookingService: BookingService, 
    private router: Router, 
    public languageService: LanguageService, 
    private priceCalculatorService: PriceCalculatorService,
  ) {
  }

  onSubmit(): void {
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
        this.router.navigate([`${this.languageService.currentLang().code}/${NAVBAR_MENU.bookNow.slug[this.languageService.currentLang().code]}/`], {
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
      console.error('Error calculating distance:', error);
      this.router.navigate([`${this.languageService.currentLang().code}/${NAVBAR_MENU.bookNow.slug[this.languageService.currentLang().code]}/`], {
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
    console.log('Pickup place selected:', place);
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng
    });
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    console.log('Destination place selected:', place);
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng
    });
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
    return value[this.languageService.currentLang().code] || key;
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
    bookNow: {
      en: 'Book Now',
      de: 'Jetzt buchen',
      ru: 'Забронировать сейчас',
      tr: 'Şimdi rezervasyon yap',
    },
    orWriteToUs: {
      en: 'Or write to us directly for 24/7 support, and we’ll help you find the best private airport transfer options in Turkey.', 
      de: 'Oder schreiben Sie uns direkt für 24/7 Unterstützung, und wir helfen Ihnen, die besten privaten Flughafentransferoptionen in der Türkei zu finden.',
      ru: 'Или напишите нам напрямую для круглосуточной поддержки, и мы поможем вам найти лучшие варианты частных трансферов из аэропорта в Турции.',
      tr: 'Veya 7/24 destek için doğrudan bize yazın ve size Türkiye\'deki en iyi özel havalimanı transfer seçeneklerini bulmanıza yardımcı olalım.',
    }
  };
}
