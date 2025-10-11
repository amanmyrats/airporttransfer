import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, output, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { BookingService } from '../../services/booking.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { LanguageService } from '../../services/language.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { SOCIAL_ICONS } from '../../constants/social.constants';

const SUPPORTED_LANGUAGE_CODES = ['en', 'de', 'ru', 'tr'] as const;
type LanguageCode = typeof SUPPORTED_LANGUAGE_CODES[number];

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GmapsAutocompleteDirective,
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit {
  @Input() langInput: any | null = null;

  bookingService = inject(BookingService);
  priceCalculatorService = inject(PriceCalculatorService);
  searchVehicle = output<any>();
  hasSubmitted = false;
  readonly socialIcon = SOCIAL_ICONS;

  readonly translations = {
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
    clearPickup: {
      en: 'Clear pickup field',
      de: 'Abholort löschen',
      ru: 'Очистить место отправления',
      tr: 'Alış alanını temizle',
    },
    clearDropOff: {
      en: 'Clear drop-off field',
      de: 'Zielort löschen',
      ru: 'Очистить пункт назначения',
      tr: 'Varış alanını temizle',
    },
    search: {
      en: 'Search',
      de: 'Suche',
      ru: 'Поиск',
      tr: 'Ara',
    },
    helperLine: {
      en: 'Enter hotel, villa, or cruise port details to unlock Antalya airport VIP car options and instant fares.',
      de: 'Geben Sie Hotel-, Villa- oder Kreuzfahrthafen-Daten ein, um Antalya VIP-Transferfahrzeuge und Sofortpreise zu sehen.',
      ru: 'Укажите отель, виллу или круизный порт, чтобы открыть VIP-авто и тарифы для аэропорта Анталии.',
      tr: 'Antalya havalimanı VIP araç seçenekleri ve anlık fiyatlar için otel, villa veya liman bilgilerini ekleyin.',
    },
    errorTitle: {
      en: 'Can’t find your destination?',
      de: 'Sie finden Ihr Ziel nicht?',
      ru: 'Не находите нужное направление?',
      tr: 'Aradığınız destinasyonu bulamadınız mı?',
    },
    errorText: {
      en: 'No worries — our concierge team will curate the perfect route. Choose any option below and we will handle the rest.',
      de: 'Keine Sorge – unser Concierge-Team stellt die ideale Route für Sie zusammen. Wählen Sie eine Option unten, wir kümmern uns um den Rest.',
      ru: 'Не переживайте — наш консьерж подберёт лучший маршрут. Выберите удобный способ связи ниже, и мы все организуем.',
      tr: 'Endişelenmeyin — concierge ekibimiz sizin için en uygun rotayı planlar. Aşağıdaki seçeneklerden birini seçmeniz yeterli.',
    },
    contactWhatsapp: {
      en: 'WhatsApp',
      de: 'WhatsApp',
      ru: 'WhatsApp',
      tr: 'WhatsApp',
    },
    contactTelegram: {
      en: 'Telegram',
      de: 'Telegram',
      ru: 'Telegram',
      tr: 'Telegram',
    },
    contactPhone: {
      en: 'Phone',
      de: 'Telefon',
      ru: 'Телефон',
      tr: 'Telefon',
    },
    contactEmail: {
      en: 'Email',
      de: 'E-Mail',
      ru: 'Email',
      tr: 'E-posta',
    },
    swapLocations: {
      en: 'Switch locations',
      de: 'Orte tauschen',
      ru: 'Поменять местами',
      tr: 'Konumları değiştir',
    },
  } as const;

  constructor(
    private googleMapsService: GoogleMapsService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.toggleReturnTrip();
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
    const pickupLat: number = this.bookingService.bookingInitialForm.get('pickup_lat')?.value;
    const pickupLng: number = this.bookingService.bookingInitialForm.get('pickup_lng')?.value;
    const destLat: number = this.bookingService.bookingInitialForm.get('dest_lat')?.value;
    const destLng: number = this.bookingService.bookingInitialForm.get('dest_lng')?.value;

    const origin: google.maps.LatLngLiteral = { lat: pickupLat, lng: pickupLng };
    const destination: google.maps.LatLngLiteral = { lat: destLat, lng: destLng };

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(pickupLat, pickupLng);
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(destLat, destLng);

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
      this.searchVehicle.emit(this.bookingService.bookingInitialForm.value);
    }
  }

  onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng
    });
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng
    });
  }

  preventFormSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  clearField(controlName: string): void {
    this.bookingService.bookingInitialForm.get(controlName)?.setValue('');
  }

  swapLocations(): void {
    const form = this.bookingService.bookingInitialForm;
    const pairs: [string, string][] = [
      ['pickup_place', 'dest_place'],
      ['pickup_full', 'dest_full'],
      ['pickup_short', 'dest_short'],
      ['pickup_lat', 'dest_lat'],
      ['pickup_lng', 'dest_lng'],
    ];

    pairs.forEach(([fromKey, toKey]) => {
      const fromControl = form.get(fromKey);
      const toControl = form.get(toKey);
      if (!fromControl || !toControl) return;

      const fromValue = fromControl.value;
      fromControl.setValue(toControl.value ?? '');
      toControl.setValue(fromValue ?? '');
    });
  }

  get currentLangCode(): LanguageCode {
    const code = this.langInput?.code ?? this.languageService.currentLang().code;
    return this.isSupportedLanguage(code) ? code : 'en';
  }

  private isSupportedLanguage(code: unknown): code is LanguageCode {
    return typeof code === 'string' && SUPPORTED_LANGUAGE_CODES.includes(code as LanguageCode);
  }
}
