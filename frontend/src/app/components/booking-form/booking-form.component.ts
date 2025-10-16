import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, output, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { BookingService } from '../../services/booking.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { LanguageService } from '../../services/language.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { GoogleMapsLoaderService, GoogleMapsLoaderState } from '../../services/google-maps-loader.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const SUPPORTED_LANGUAGE_CODES = ['en', 'de', 'ru', 'tr'] as const;
type LanguageCode = typeof SUPPORTED_LANGUAGE_CODES[number];

export interface BookingSearchEvent {
  formValue: any;
  complete: () => void;
  fail: (error?: unknown) => void;
}

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
  @Input() horizontalInDesktop = false;
  @Input() isShowExtraTitle = false;

  bookingService = inject(BookingService);
  priceCalculatorService = inject(PriceCalculatorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapsLoader = inject(GoogleMapsLoaderService);
  searchVehicle = output<BookingSearchEvent>();
  hasSubmitted = false;
  isSubmitting = false;
  readonly socialIcon = SOCIAL_ICONS;
  mapsStatus: GoogleMapsLoaderState = { status: 'loading' };
  private pendingPlaceResolutions = 0;
  submissionError = false;
  submissionErrorMessageKey: string | null = null;

  get canSubmit(): boolean {
    return (
      this.isMapsReady &&
      !this.isSubmitting &&
      this.pendingPlaceResolutions === 0
    );
  }

  get isMapsReady(): boolean {
    return this.mapsStatus.status === 'ready';
  }

  get showSwapButton(): boolean {
    const form = this.bookingService.bookingInitialForm;
    return Boolean(form.get('pickup_full')?.value || form.get('dest_full')?.value);
  }

  getErrorMessage(messageKey: string | null): string {
    if (!messageKey) {
      return this.translations.errorText[this.currentLangCode];
    }
    const entry = (this.translations as Record<string, Record<LanguageCode, string>>)[messageKey];
    if (entry && entry[this.currentLangCode]) {
      return entry[this.currentLangCode];
    }
    return this.translations.errorText[this.currentLangCode];
  }

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
      en: 'See Price Options',
      de: 'Preisoptionen anzeigen',
      ru: 'Посмотреть варианты цен',
      tr: 'Fiyat seçeneklerini gör'
    },
    helperLine: {
      en: 'Enter hotel, villa, or cruise port details to unlock Istanbul, Antalya airport VIP car options and instant fares.',
      de: 'Geben Sie Hotel-, Villa- oder Kreuzfahrthafen-Daten ein, um Istanbul, Antalya VIP-Transferfahrzeuge und Sofortpreise zu sehen.',
      ru: 'Укажите отель, виллу или круизный порт, чтобы открыть VIP-авто и тарифы для аэропорта Стамбула, Анталии.',
      tr: 'İstanbul, Antalya havalimanı VIP araç seçenekleri ve anlık fiyatlar için otel, villa veya liman bilgilerini ekleyin.',
    },
    bookNowTitle: {
      en: 'Book your transfer',
      de: 'Buchen Sie Ihren Transfer',
      ru: 'Забронируйте трансфер',
      tr: 'Transferinizi rezerve edin',
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
    coordinateError: {
      en: 'Please choose both pickup and destination from the suggestions before searching.',
      de: 'Bitte wählen Sie sowohl Abhol- als auch Zielort aus den Vorschlägen aus, bevor Sie suchen.',
      ru: 'Пожалуйста, выберите адрес отправления и назначения из подсказок перед поиском.',
      tr: 'Lütfen arama yapmadan önce hem alınacak hem de bırakılacak yeri önerilerden seçin.',
    },
    distanceError: {
      en: "We couldn't reach Google Maps to calculate the distance. Please try again.",
      de: 'Die Entfernung konnte über Google Maps nicht berechnet werden. Bitte versuchen Sie es erneut.',
      ru: 'Не удалось получить расстояние через Google Maps. Попробуйте ещё раз.',
      tr: 'Google Maps üzerinden mesafe hesaplanamadı. Lütfen tekrar deneyin.',
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
    mapsLoading: {
      en: 'Loading place suggestions…',
      de: 'Lade Ortsvorschläge…',
      ru: 'Загружаем подсказки адресов…',
      tr: 'Konum önerileri yükleniyor…',
    },
    mapsError: {
      en: 'We couldn’t reach Google Places. Please refresh the page or reach us via WhatsApp for help.',
      de: 'Google Places konnte nicht geladen werden. Bitte Seite neu laden oder uns über WhatsApp kontaktieren.',
      ru: 'Не удалось загрузить Google Places. Обновите страницу или свяжитесь с нами через WhatsApp.',
      tr: 'Google Places yüklenemedi. Lütfen sayfayı yenileyin veya WhatsApp üzerinden bize ulaşın.',
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
    this.mapsLoader.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => {
        this.mapsStatus = status;
      });

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

  async onSubmit(): Promise<void> {
    console.log('Submitting booking form');
    if (!this.isMapsReady) {
      return;
    }
    this.hasSubmitted = true;
    this.isSubmitting = true;
    this.submissionError = false;
    this.submissionErrorMessageKey = null;
    const pickupLat = this.parseCoordinate(this.bookingService.bookingInitialForm.get('pickup_lat')?.value);
    const pickupLng = this.parseCoordinate(this.bookingService.bookingInitialForm.get('pickup_lng')?.value);
    const destLat = this.parseCoordinate(this.bookingService.bookingInitialForm.get('dest_lat')?.value);
    const destLng = this.parseCoordinate(this.bookingService.bookingInitialForm.get('dest_lng')?.value);
    console.log('Parsed coordinates:', { pickupLat, pickupLng, destLat, destLng });
    if (pickupLat === null || pickupLng === null || destLat === null || destLng === null) {
      console.warn('Cannot submit booking: coordinates are not resolved yet.', {
        pickupLat,
        pickupLng,
        destLat,
        destLng,
      });
      this.submissionError = true;
      this.submissionErrorMessageKey = 'coordinateError';
      this.isSubmitting = false;
      return;
    }

    const origin: google.maps.LatLngLiteral = { lat: pickupLat, lng: pickupLng };
    const destination: google.maps.LatLngLiteral = { lat: destLat, lng: destLng };

    const airportCoefficientPickUp = this.priceCalculatorService.getAirportCoefficient(pickupLat, pickupLng);
    const airportCoefficientDest = this.priceCalculatorService.getAirportCoefficient(destLat, destLng);
    console.log('Airport coefficients:', { airportCoefficientPickUp, airportCoefficientDest });
    this.bookingService.bookingInitialForm.get('airport_coefficient')!.setValue(
      Math.max(airportCoefficientPickUp, airportCoefficientDest)
    );
    this.bookingService.airportCoefficient.set(
      Math.max(airportCoefficientPickUp, airportCoefficientDest)
    );

    try {
      const result = await this.googleMapsService.calculateDrivingDistanceAndTime(origin, destination);
      this.bookingService.distance.set(result.distance);
      this.bookingService.drivingDuration.set(result.duration);
      this.bookingService.bookingCarTypeSelectionForm.get('distance')!.setValue(result.distance);
      this.bookingService.bookingCarTypeSelectionForm.get('driving_duration')!.setValue(result.duration);
      console.log('Calculated distance and duration:', result);
    } catch (error) {
      console.error('Error calculating distance:', error);
      this.submissionError = true;
      this.submissionErrorMessageKey = 'distanceError';
      this.isSubmitting = false;
      return;
    }
    console.log('Final form value before search event:', this.bookingService.bookingInitialForm.value);
    if (!this.bookingService.bookingInitialForm.valid) {
      this.isSubmitting = false;
      return;
    }

    const resolveSubmission = () => {
      if (this.isSubmitting) {
        this.isSubmitting = false;
      }
    };
    console.log('Emitting searchVehicle event');
    this.searchVehicle.emit({
      formValue: this.bookingService.bookingInitialForm.value,
      complete: resolveSubmission,
      fail: (_error?: unknown) => resolveSubmission(),
    });
  }

  onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    const pickup_short = this.buildShortArea(place) ?? pickup_full; // graceful fallback
    console.log('Pickup short area:', pickup_short);


    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng,
      pickup_short: pickup_short
    });
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    const dest_short = this.buildShortArea(place) ?? dest_full; // graceful fallback
    console.log('Destination short area:', dest_short);
    
    this.bookingService.bookingInitialForm.patchValue({
      dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng, 
      dest_short: dest_short
    });
  }

  preventFormSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  clearField(controlName: string): void {
    if (!this.isMapsReady) {
      return;
    }
    const form = this.bookingService.bookingInitialForm;
    switch (controlName) {
      case 'pickup_full':
        form.patchValue(
          { pickup_full: '', pickup_lat: '', pickup_lng: '', pickup_short: '' },
          { emitEvent: false }
        );
        break;
      case 'dest_full':
        form.patchValue(
          { dest_full: '', dest_lat: '', dest_lng: '', dest_short: '' },
          { emitEvent: false }
        );
        break;
      default:
        form.get(controlName)?.setValue('');
    }
  }

  swapLocations(): void {
    if (!this.isMapsReady) {
      return;
    }
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

  onPlaceResolving(): void {
    this.pendingPlaceResolutions += 1;
  }

  onPlaceResolved(): void {
    this.pendingPlaceResolutions = Math.max(0, this.pendingPlaceResolutions - 1);
  }

  private parseCoordinate(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  
  /** Find first address component whose type matches any in `types`. */
private pickComponent(
  place: google.maps.places.PlaceResult,
  types: string[]
): string | undefined {
  const c = place.address_components?.find(ac =>
    ac.types?.some(t => types.includes(t))
  );
  return c?.long_name || c?.short_name || undefined;
}

/** Build a short area label like "Binbirdirek / Fatih" or "Tekirova / Kemer".
 *  Includes smallest → district, excludes province (admin_area_level_1) and country.
 */
private buildShortArea(place: google.maps.places.PlaceResult): string | undefined {
  // Airports → leave short empty
  const isAirport =
    (place.types ?? []).includes('airport') ||
    /(?:\bairport\b|havaliman[ıi])/i.test(
      `${place.name ?? ''} ${place.formatted_address ?? ''}`
    );
  if (isAirport) return '';

  // Most granular
  const province =
    this.pickComponent(place, ['administrative_area_level_1']) ?? undefined;
  const country =
    this.pickComponent(place, ['country']) ?? undefined;

  const normalize = (value: string | undefined) =>
    value ? value.trim().toLowerCase() : undefined;

  const provinceNormalized = normalize(province);
  const countryNormalized = normalize(country);

  const orderedTypes = [
    'neighborhood',
    'sublocality_level_5',
    'sublocality_level_4',
    'sublocality_level_3',
    'sublocality_level_2',
    'sublocality_level_1',
    'sublocality',
    'administrative_area_level_4',
    'administrative_area_level_3',
    'administrative_area_level_2',
    'locality',
  ];

  const relevantComponents =
    place.address_components
      ?.map(component => {
        const index = orderedTypes.findIndex(type =>
          component.types?.includes(type)
        );
        if (index === -1) {
          return null;
        }
        const name = (component.long_name || component.short_name || '').trim();
        if (!name) {
          return null;
        }
        return { index, name };
      })
      .filter((entry): entry is { index: number; name: string } => !!entry)
      .sort((a, b) => a.index - b.index) ?? [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const { name } of relevantComponents) {
    const normalized = normalize(name);
    if (!normalized) {
      continue;
    }

    if (provinceNormalized && normalized === provinceNormalized) {
      continue;
    }
    if (countryNormalized && normalized === countryNormalized) {
      continue;
    }
    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(name);

    if (result.length >= 3) {
      break;
    }
  }

  return result.length ? result.join(', ') : undefined;
}




}
