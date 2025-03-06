import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { GoogleMapsService } from '../../services/google-maps.service';
import { LanguageService } from '../../services/language.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { PriceListComponent } from '../price-list/price-list.component';

@Component({
  selector: 'app-booking-initial-form',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
    GmapsAutocompleteDirective, 
    PriceListComponent, 
  ],
  templateUrl: './booking-initial-form.component.html',
  styleUrl: './booking-initial-form.component.scss'
})
export class BookingInitialFormComponent implements OnInit {
  socialIcon = SOCIAL_ICONS;
  bookingService = inject(BookingService);
  priceCalculatorService = inject(PriceCalculatorService);
  searchVehicle = output<any>();

  hasSubmitted = false;

  constructor(
    private fb: FormBuilder, 
    private googleMapsService: GoogleMapsService, 
    public languageService: LanguageService, 
    private gtmService: GoogleTagManagerService, 
  ) {
  }

  ngOnInit(): void {
    this.toggleReturnTrip(); // Ensure return fields are updated on initialization
  }

  toggleReturnTrip(): void {
    const returnDateControl = this.bookingService.bookingInitialForm.get('returnDate');
    const returnTimeControl = this.bookingService.bookingInitialForm.get('returnTime');
    const isReturnTrip = this.bookingService.bookingInitialForm.get('returnTrip')?.value;

    if (isReturnTrip) {
      returnDateControl?.setValidators(Validators.required);
      returnTimeControl?.setValidators(Validators.required);
    } else {
      returnDateControl?.clearValidators();
      returnTimeControl?.clearValidators();
    }

    returnDateControl?.updateValueAndValidity();
    returnTimeControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.hasSubmitted = true;
    console.log('Booking Form:', this.bookingService.bookingInitialForm.value);
    const pickupLat: number = this.bookingService.bookingInitialForm.get('pickup_lat')?.value;
    const pickupLng: number = this.bookingService.bookingInitialForm.get('pickup_lng')?.value;
    const destLat: number = this.bookingService.bookingInitialForm.get('dest_lat')?.value;
    const destLng: number = this.bookingService.bookingInitialForm.get('dest_lng')?.value;
  
    const origin: google.maps.LatLngLiteral = { lat: pickupLat, lng: pickupLng };
    const destination: google.maps.LatLngLiteral = { lat: destLat, lng: destLng };

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(pickupLat, pickupLng);
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(destLat, destLng);

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
      this.bookingService.distance.set(result.distance);
      this.bookingService.drivingDuration.set(result.duration);
      this.bookingService.bookingCarTypeSelectionForm.get('distance')!.setValue(
        result.distance);
      this.bookingService.bookingCarTypeSelectionForm.get('driving_duration')!.setValue(
        result.duration);
    }).catch(error => {
      console.error('Error calculating distance:', error);
    });

    if (this.bookingService.bookingInitialForm.valid) {
      console.log('Booking Details:', this.bookingService.bookingInitialForm.value);
      // Handle booking submission logic here

      this.searchVehicle.emit(this.bookingService.bookingInitialForm.value);
    } else {
      console.log('bookingInitialForm is invalid');
    }

    // Send event to GTM
    this.gtmService.pushTag({
      event: 'view_item',
      category: 'Booking',
      action: 'Click',
      label: 'View Item'
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
  
  // translations for from, to, from placeholder, to placeholder, search, book your transfer, description
  translations: any = {
    from: {
      en: 'From', 
      de: 'Von',
      ru: 'От',
      tr: 'Nereden',
    }, 
    from_required: {
      en: 'Pickup location is required.',
      de: 'Abholort ist erforderlich.',
      ru: 'Место взятия обязательно.',
      tr: 'Alınacak yer gereklidir.',
    }, 
    to: {
      en: 'To', 
      de: 'Nach',
      ru: 'До',
      tr: 'Nereye',
    },
    to_required: {
      en: 'Destination location is required.', 
      de: 'Zielort ist erforderlich.',
      ru: 'Пункт назначения обязателен.',
      tr: 'Gidilecek yer gereklidir.',
    }, 
    from_placeholder: {
      en: 'Enter pickup location', 
      de: 'Abholort eingeben',
      ru: 'Введите место взятия',
      tr: 'Alınacak yer',
    },
    to_placeholder: {
      en: 'Enter destination', 
      de: 'Ziel eingeben',
      ru: 'Введите пункт назначения',
      tr: 'Gidilecek yer',
    },
    search: {
      en: 'Search', 
      de: 'Suche',
      ru: 'Поиск',
      tr: 'Ara',
    },
    book_your_transfer: {
      en: 'Book Your Airport Transfer', 
      de: 'Buchen Sie Ihren Flughafentransfer',
      ru: 'Забронируйте ваш трансфер из аэропорта',
      tr: 'Havalimanı Transferinizi Ayırtın',
    },
    description: {
      en: 'Plan your journey in just a few steps. Choose your destination, date, and time, and enjoy a seamless travel experience.',
      de: 'Planen Sie Ihre Reise in nur wenigen Schritten. Wählen Sie Ihr Ziel, Datum und Uhrzeit und genießen Sie ein nahtloses Reiseerlebnis.',
      ru: 'Запланируйте свое путешествие всего в несколько шагов. Выберите ваш пункт назначения, дату и время и наслаждайтесь безупречным путешествием.',
      tr: 'Yolculuğunuzu sadece birkaç adımda planlayın. Gidilecek yerinizi, tarihinizi ve saatinizi seçin ve sorunsuz bir seyahat deneyiminin tadını çıkarın.',
    }, 
    fixedPrices: {
      en: 'Or You can choose from fixed prices...',
      de: 'Oder Sie können aus Festpreisen wählen...',
      ru: 'Или вы можете выбрать из фиксированных цен...',
      tr: 'Ya da sabit fiyatlar arasından seçim yapabilirsiniz...',
    }
  }
}
