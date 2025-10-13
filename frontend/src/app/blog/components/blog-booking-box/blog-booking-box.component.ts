import { Component, DestroyRef, Input, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { GmapsAutocompleteDirective } from '../../../directives/gmaps-autocomplete.directive';
import { GoogleMapsService } from '../../../services/google-maps.service';
import { BookingService } from '../../../services/booking.service';
import { LanguageService } from '../../../services/language.service';
import { PriceCalculatorService } from '../../../services/price-calculator.service';
import { NAVBAR_MENU } from '../../../constants/navbar-menu.constants';
import { GoogleMapsLoaderService, GoogleMapsLoaderState } from '../../../services/google-maps-loader.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-blog-booking-box',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    GmapsAutocompleteDirective
  ],
  templateUrl: './blog-booking-box.component.html',
  styleUrl: './blog-booking-box.component.scss'
})
export class BlogBookingBoxComponent {
  @Input() langInput: any | null = null;
  isBookNowLoading = false;
  mapsStatus: GoogleMapsLoaderState = { status: 'loading' };
  private readonly destroyRef = inject(DestroyRef);

  get isMapsReady(): boolean {
    return this.mapsStatus.status === 'ready';
  }

  constructor(
    public googleMapsService: GoogleMapsService,
    public bookingService: BookingService,
    private router: Router,
    private languageService: LanguageService,
    private priceCalculatorService: PriceCalculatorService,
    private mapsLoaderService: GoogleMapsLoaderService,
  ) {
    this.mapsLoaderService.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        this.mapsStatus = status;
      });
  }

  onSubmit(): void {
    if (!this.isMapsReady) {
      return;
    }
    this.isBookNowLoading = true;
    const formValue = this.bookingService.bookingInitialForm.value;

    const origin = { lat: formValue.pickup_lat || 0, lng: formValue.pickup_lng || 0 };
    const destination = { lat: formValue.dest_lat || 0, lng: formValue.dest_lng || 0 };

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(
      formValue.pickup_lat, formValue.pickup_lng
    );
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(
      formValue.dest_lat, formValue.dest_lng
    );
    const coefficient = Math.max(airportCoefficientPickUp, airportCoefficientDest);
    this.bookingService.bookingInitialForm.get('airport_coefficient')!.setValue(coefficient);
    this.bookingService.airportCoefficient.set(coefficient);

    this.googleMapsService.calculateDrivingDistanceAndTime(origin, destination)
      .then(result => {
        this.navigateToBooking(formValue, result.distance, result.duration, coefficient);
      })
      .catch(() => {
        this.navigateToBooking(formValue, 0, 0, coefficient);
      });
  }

  private navigateToBooking(formValue: any, distance: number, duration: number, coefficient: number) {
    this.isBookNowLoading = false;
    this.router.navigate([`${this.langInput.code}/${NAVBAR_MENU.bookNow.slug[this.langInput.code]}/`], {
      queryParams: {
        step: 2,
        pickup_full: formValue.pickup_full,
        dest_full: formValue.dest_full,
        pickup_lat: formValue.pickup_lat,
        pickup_lng: formValue.pickup_lng,
        dest_lat: formValue.dest_lat,
        dest_lng: formValue.dest_lng,
        distance,
        driving_duration: duration,
        airport_coefficient: coefficient
      }
    });
  }

  onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full, pickup_lat, pickup_lng
    });
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      dest_full, dest_lat, dest_lng
    });
  }

  preventFormSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') event.preventDefault();
  }

  clearField(controlName: string): void {
    if (!this.isMapsReady) {
      return;
    }
    this.bookingService.bookingInitialForm.get(controlName)?.setValue('');
  }

  translations: any = {
    bookNowTitle: {
      en: 'Book your transfer',
      de: 'Buchen Sie Ihren Transfer',
      ru: 'Забронируйте трансфер',
      tr: 'Transferinizi rezerve edin'
    },
    pickUp: {
      en: 'Pickup Location',
      de: 'Abholort',
      ru: 'Место встречи',
      tr: 'Alış Yeri'
    },
    pickUpPlaceHolder: {
      en: 'Enter your pickup location',
      de: 'Geben Sie Ihren Abholort ein',
      ru: 'Введите место встречи',
      tr: 'Alış yerinizi girin'
    },
    dropOff: {
      en: 'Dropoff Location',
      de: 'Zielort',
      ru: 'Место назначения',
      tr: 'İniş Yeri'
    },
    dropOffPlaceHolder: {
      en: 'Enter your dropoff location',
      de: 'Geben Sie Ihren Zielort ein',
      ru: 'Введите место назначения',
      tr: 'İniş yerinizi girin'
    },
    bookNow: {
      en: 'See Price Options',
      de: 'Preisoptionen anzeigen',
      ru: 'Посмотреть варианты цен',
      tr: 'Fiyat seçeneklerini gör'
    },
    mapsLoading: {
      en: 'Loading place suggestions…',
      de: 'Lade Ortsvorschläge…',
      ru: 'Загружаем подсказки адресов…',
      tr: 'Konum önerileri yükleniyor…',
    },
    mapsError: {
      en: 'We couldn’t reach Google Places. Please refresh the page or chat with us on WhatsApp.',
      de: 'Google Places konnte nicht geladen werden. Bitte Seite neu laden oder uns über WhatsApp kontaktieren.',
      ru: 'Не удалось загрузить Google Places. Обновите страницу или напишите нам в WhatsApp.',
      tr: 'Google Places yüklenemedi. Lütfen sayfayı yenileyin veya WhatsApp üzerinden bize yazın.',
    },
  };
}
