import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Inject, PLATFORM_ID, OnDestroy, computed, effect, inject, Input, OnInit, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CarTypeService } from '../../services/car-type.service';
import { CurrencyService } from '../../services/currency.service';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { Currency } from '../../models/currency.model';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CountryISO } from 'ngx-intl-tel-input';
import { SearchCountryField } from 'ngx-intl-tel-input';
import { GoogleMapsService } from '../../services/google-maps.service';
import { DurationFormatPipe } from '../../pipes/duration-format.pipe';
import { Subscription } from 'rxjs';

declare var gtag: Function;
declare var dataLayer: any;

@Component({
  selector: 'app-booking-completion-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    DurationFormatPipe,
  ],
  templateUrl: './booking-completion-form.component.html',
  styleUrl: './booking-completion-form.component.scss'
})
export class BookingCompletionFormComponent implements OnInit, OnDestroy {
  @Input() langInput: any | null = null;
  defaultCountry: CountryISO = CountryISO.Turkey;  // default fallback
  showCustomPickupFullInput = false;
  showCustomDestinationFullInput = false;
  searchFields: SearchCountryField[] = [
    SearchCountryField.All,
    SearchCountryField.Iso2,
    SearchCountryField.DialCode
  ];
  preferredCountries: CountryISO[] = [
    CountryISO.Turkey,
    CountryISO.Netherlands,
    CountryISO.Germany,
    CountryISO.Switzerland,
    CountryISO.Russia,
    CountryISO.UnitedKingdom,
    CountryISO.Ukraine,
    CountryISO.Kazakhstan,
    CountryISO.UnitedStates, 
    CountryISO.Austria, 
    CountryISO.France,
    CountryISO.Italy,
    CountryISO.Spain,
    CountryISO.Poland,
    CountryISO.Romania,
    CountryISO.Bulgaria,
    CountryISO.CzechRepublic,
  ];
    
  navbar = NAVBAR_MENU;
  bookingService = inject(BookingService);
  carTypeService = inject(CarTypeService);
  currencyService = inject(CurrencyService);
  googleMapsService = inject(GoogleMapsService);

  flowerPriceInEuro = 15;
  champagnePriceInEuro = 25;
  childSeatPriceInEuro = 5;

  isSaving = false;
  hasSubmitted = false;

  stepFromUrl: number | null = null;

  previousStep = output<any>();
  // champa
  return_trip_price = signal<number>(0);
  champagnePrice = signal<number>(0);
  flowerPrice = signal<number>(0);
  childSeatCount = signal<number>(0);
  animateTransferTime = false;
  animateReturnTime = false;
  timePickerLocale = 'en-GB';
  private transferAnimationTimeout?: ReturnType<typeof setTimeout>;
  private returnAnimationTimeout?: ReturnType<typeof setTimeout>;
  private readonly timeAnimationDuration = 1100;
  private readonly timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  childSeatPrice = computed<number>(() => { 
    // if child_seat_count changes add 5 euro or equivalent to the price
    const childSeatCount: number = this.childSeatCount();
    console.log('Child seat count:', childSeatCount);
    const currencyCode: string = this.bookingService.bookingCarTypeSelectionForm.get(
      'currency_code')?.value;
    const currency: Currency = this.currencyService.getCurrencyByCode(currencyCode)!;
    console.log('Currency:', currency);
    if (this.childSeatCount() > 1) {
      const childSeatPricePerUnitInCurrentCurrency: number = this.currencyService.convert(
        this.childSeatPriceInEuro, 
        this.currencyService.getCurrencyByCode('EUR')!, 
        currency
      );
      console.log('Child seat price per unit in current currency:', childSeatPricePerUnitInCurrentCurrency);
      const newChildSeatPrice = (this.childSeatCount() -1) * childSeatPricePerUnitInCurrentCurrency;
      return newChildSeatPrice;
    }
    return 0;
   });

  needChildSeatOptions: any[] = [
    {label: 'Çocuk Koltuğu Lazım', value: true},
    {label: 'Lazım Değil', value: false},
  ];

  selectedCar = this.carTypeService.getCarTypeByCode(
    this.bookingService.bookingCarTypeSelectionForm.get('car_type')?.value
  ) 
  price = this.bookingService.bookingCarTypeSelectionForm.get('amount')?.value;
  currency = this.currencyService.getCurrencyByCode(
    this.bookingService.bookingCarTypeSelectionForm.get('currency_code')?.value
  )
  passengerCount = 333;
  isFromPopularRoute = false;
  isMobileView = false;
  routeStaticMapUrl: string | null = null;
  private readonly googleStaticMapsKey = 'AIzaSyAidis3l3HFmi1ij_qQTPIaeTCs7pAmcrQ';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    private router: Router,  
    public languageService: LanguageService, 
    private route: ActivatedRoute, 
    private http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    effect(() => {
      const existingCurrencyCode: string = this.bookingService.bookingCarTypeSelectionForm.get('currency_code')?.value;
      const newCurrency: Currency = this.currencyService.currentCurrency();
      const existingAmount: number = this.bookingService.bookingCarTypeSelectionForm.get('amount')?.value;

      this.price = this.currencyService.convert(
        existingAmount, 
        this.currencyService.getCurrencyByCode(existingCurrencyCode)!, 
        newCurrency
      );
      this.currency = newCurrency;
      this.bookingService.bookingCarTypeSelectionForm.patchValue({
        currency_code: newCurrency.code,
        amount: this.price,
      });
      this.calculateChampagnePrice();
      this.calculateFlowerPrice();
    });

  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateViewportState();
  }

  private updateViewportState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isMobileView = false;
      this.updateRouteMapUrl();
      return;
    }
    this.isMobileView = window.innerWidth <= 768;
    this.updateRouteMapUrl();
  }

  get fromLocation(): string {
    return (
      this.bookingService.bookingCompletionForm.get('pickup_full')?.value ||
      this.bookingService.bookingInitialForm.get('pickup_full')?.value ||
      ''
    );
  }

  get toLocation(): string {
    return (
      this.bookingService.bookingCompletionForm.get('dest_full')?.value ||
      this.bookingService.bookingInitialForm.get('dest_full')?.value ||
      ''
    );
  }

  get distance(): number {
    return Number(this.bookingService.bookingCarTypeSelectionForm.get('distance')?.value) || 0;
  }

  get duration(): number {
    return Number(this.bookingService.bookingCarTypeSelectionForm.get('driving_duration')?.value) || 0;
  }

  getAddressLines(fullAddress: string | null | undefined): { primary: string; secondary: string } {
    return this.googleMapsService.getAddressLines(fullAddress);
  }

  shouldShowAsideSummary(): boolean {
    return !this.isMobileView || this.isFromPopularRoute;
  }

  shouldShowInlineSummary(): boolean {
    return this.isMobileView && !this.isFromPopularRoute;
  }

  shouldRenderRouteMap(): boolean {
    return !this.isMobileView && !this.isFromPopularRoute && !!this.routeStaticMapUrl;
  }

  ngOnInit(): void {
    const initialLocaleCode =
      this.langInput?.code || this.languageService.currentLang()?.code || 'en';
    this.timePickerLocale = this.resolveTimePickerLocale(initialLocaleCode);

    this.updateViewportState();

    if (isPlatformBrowser(this.platformId)) {
      this.detectUserCountry();
    }

    this.route.queryParams.subscribe((params) => {
      this.stepFromUrl = params['step'];
      const popularRouteParam = params['is_from_popular_routes'];
      console.log('bookingInitialForm:', this.bookingService.bookingInitialForm.value);
      this.bookingService.bookingCompletionForm.patchValue({
        pickup_short: this.bookingService.bookingInitialForm.get('pickup_short')?.value,
        dest_short: this.bookingService.bookingInitialForm.get('dest_short')?.value,
        pickup_full: this.bookingService.bookingInitialForm.get('pickup_full')?.value,
        dest_full: this.bookingService.bookingInitialForm.get('dest_full')?.value,
      });
      if (popularRouteParam !== undefined) {
        const normalizedValue = popularRouteParam.toString().toLowerCase();
        this.isFromPopularRoute = ['1', 'true', 'yes'].includes(normalizedValue);
        this.handlePopularRoute(params);
      } else {
        this.isFromPopularRoute = false;
      }
      this.updateRouteMapUrl();
    });

    // Ensure the return fields are updated based on the "returnTrip" checkbox
    this.toggleReturnFields();

    const initialChildSeatCount =
      Number(this.bookingService.bookingCompletionForm.get('child_seat_count')?.value) || 0;
    this.childSeatCountChanged(initialChildSeatCount);

    const initialFormSub = this.bookingService.bookingInitialForm.valueChanges.subscribe(() => {
      this.updateRouteMapUrl();
    });
    this.subscriptions.push(initialFormSub);

    this.updateRouteMapUrl();
  }
private detectUserCountry(): void {
  this.http
    .get<{ country_code?: string; country_calling_code?: string }>('https://ipapi.co/json/')
    .subscribe({
      next: (data) => {
        console.log('Geo API response:', data);

        // 1) Try IP country
        const mappedFromIP = this.resolveCountryISO(data.country_code);
        if (mappedFromIP) {
          this.defaultCountry = mappedFromIP;
          console.log('Detected country from IP:', this.defaultCountry);
        } else if (typeof navigator !== 'undefined' && navigator.language) {
          // 2) Fallback to browser language region (e.g. "de-DE" -> "DE")
          const langIso = navigator.language.split('-')[1];
          const mappedFromLang = this.resolveCountryISO(langIso);
          if (mappedFromLang) {
            this.defaultCountry = mappedFromLang;
            console.log('Fallback country from language:', this.defaultCountry);
          }
        }

        console.log('Default country set to:', this.defaultCountry);

        // Optionally set calling code into your form
        const callingCode = data.country_calling_code; // usually like "+49"
        console.log('Detected country calling code:', callingCode);
        if (callingCode) {
          this.bookingService.bookingCompletionForm.patchValue(
            { passenger_country_code: callingCode },
            { emitEvent: false },
          );
        } else if (data.country_code) {
          this.bookingService.bookingCompletionForm.patchValue(
            { passenger_country_code: data.country_code.toUpperCase() },
            { emitEvent: false },
          );
        }
      },
      error: (err) => {
        console.warn('Failed to resolve country from Geo API:', err);

        // Fallback to browser language region if available
        if (typeof navigator !== 'undefined' && navigator.language) {
          const langIso = navigator.language.split('-')[1];
          const mappedFromLang = this.resolveCountryISO(langIso);
          if (mappedFromLang) {
            this.defaultCountry = mappedFromLang;
            this.bookingService.bookingCompletionForm.patchValue(
              { passenger_country_code: (langIso ?? '').toUpperCase() },
              { emitEvent: false },
            );
          }
        }
      },
    });
}

  private handlePopularRoute(params: Record<string, string>): void {
    let pickup_short = params['pickup_short'] ?? '';
    let dest_short = params['dest_short'] ?? '';
    let pickup_full = params['pickup_full'] ?? '';
    let dest_full = params['dest_full'] ?? '';
    // const is_switched_route = params['is_switched_route'] === '1' ? 1 : 0;
    // if (is_switched_route) {
    //   // swap pickup and destination
    //   [pickup_short, dest_short] = [dest_short, pickup_short];
    //   [pickup_full, dest_full] = [dest_full, pickup_full];
    // }

    const pickupIsAirport = this.isAirport(pickup_full) || this.isAirport(pickup_short);
    const destinationIsAirport = this.isAirport(dest_full) || this.isAirport(dest_short);
    

    if (!pickupIsAirport && pickup_full) {
      this.bookingService.bookingCompletionForm.patchValue({
        pickup_full: '',
      });
      this.showCustomPickupFullInput = true;
    } else if (!destinationIsAirport && dest_full) {
      this.bookingService.bookingCompletionForm.patchValue({
        dest_full: '',
      });
      this.showCustomDestinationFullInput = true;
    } else {
      this.showCustomPickupFullInput = false;
      this.showCustomDestinationFullInput = false;
    }

    this.updateRouteMapUrl();
  }

  private isAirport(value: string): boolean {
    const normalized = value.toLowerCase();
    // include airport word in en, tr, de, ru, holland, and somre popular languages
    // and include some popular airport codes in turkey: AYT, GZP, DLM, SAW with lower case
    return (
      normalized.includes('airport') ||
      normalized.includes('havaalan') ||
      normalized.includes('havaalanı') ||
      normalized.includes('havaalani') || 
      normalized.includes('ayt') ||
      normalized.includes('gzp') || 
      normalized.includes('dlm') || 
      normalized.includes('saw') || 
      normalized.includes('flughafen') || 
      normalized.includes('flugahfen') || 
      normalized.includes('аэропорт') || 
      normalized.includes('аэропрта') || 
      normalized.includes('аэропррт') || 
      normalized.includes('аэропррт') || 
      normalized.includes('luchthaven') || 
      normalized.includes('vliegveld') || 
      normalized.includes('vliegvel') || 
      normalized.includes('vlvgel') || 
      normalized.includes('vlgel') || 
      normalized.includes('vgel')

    );
  }


  // Toggle the validators for return trip fields
  toggleReturnFields(): void {
    const returnDateControl = this.bookingService.bookingCompletionForm.get('return_transfer_date');
    const returnTimeControl = this.bookingService.bookingCompletionForm.get('return_transfer_time');
    // const returnFlighNumber = this.bookingService.bookingCompletionForm.get('return_flight_number');
    const isReturnTrip = this.bookingService.bookingCompletionForm.get('is_round_trip')?.value;

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

  // Handle form submission
  onSubmit(): void {
    this.isSaving = true;
    // wait for 2 seconds
    setTimeout(() => {
      this.isSaving = false;
    }
    , 5000);

    // Decide direction_type, ARR, DEP, ARA
    if (this.isAirport(this.bookingService.bookingCompletionForm.get('pickup_full')?.value)) {
      this.bookingService.bookingCompletionForm.patchValue({
        direction_type: 'ARR'
      });
    } else if (this.isAirport(this.bookingService.bookingCompletionForm.get('dest_full')?.value)) {
      this.bookingService.bookingCompletionForm.patchValue({
        direction_type: 'DEP'
      });
    } else {
      this.bookingService.bookingCompletionForm.patchValue({
        direction_type: 'ARA'
      });
    }

    const phone = this.bookingService.bookingCompletionForm.get('passenger_phone')?.value;
    if (phone) {
      console.log(phone.internationalNumber);  // +90 532 123 4567
      console.log(phone.nationalNumber);       // 5321234567
      console.log(phone.countryCode);          // 90
      console.log(phone.iso2);                 // 'tr'
      this.bookingService.bookingCompletionForm.patchValue({
        passenger_phone: phone.internationalNumber
      });
    } else {
      this.bookingService.bookingCompletionForm.patchValue({
        passenger_phone: this.bookingService.bookingCompletionForm.get('passenger_phone')?.value
      });
    }


    this.hasSubmitted = true;
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      amount: this.price + this.champagnePrice() + this.flowerPrice() + this.childSeatPrice(),
    });
    this.bookingService.bookingCompletionForm.patchValue({
      return_trip_amount: this.price + this.childSeatPrice(),
    });
    // add 2 other forms into this.bookingService.bookingCompletionForm
    this.bookingService.bookingForm.patchValue({
      ...this.bookingService.bookingInitialForm.value,
      ...this.bookingService.bookingCarTypeSelectionForm.value,
      ...this.bookingService.bookingCompletionForm.value,
    });
    console.log('Booking Form:', this.bookingService.bookingForm.value);
    console.log([`${this.languageService.currentLang().code}/${this.navbar.bookNow.slug[this.languageService.currentLang().code]}/received/`]);
    if (this.bookingService.bookingForm.valid) {
      console.log('Form is valid');
      this.bookingService.createBooking(
        this.bookingService.bookingForm.value).subscribe({
          next: (createdReservation) => {
            console.log('Reservation created successfully:', createdReservation);
            this.isSaving = false;
            let oneWayInfo = {}
            let returnInfo = {}
            if (createdReservation.one_way) {
              oneWayInfo = {
                number: createdReservation.one_way.number,
                status: createdReservation.one_way.status,
              }
            }
            if (createdReservation.return) {
              returnInfo = {
                number: createdReservation.return.number,
                status: createdReservation.return.status,
              }
            }

            this.router.navigate(
              [`${this.languageService.currentLang().code}/${this.navbar.bookNow.slug[this.languageService.currentLang().code]}/received/`],
              {
                state: {
                  oneWayInfo: oneWayInfo,
                  returnInfo: returnInfo,
                },
              }
            );
          },
          error: (error) => {
            console.error('Error creating reservation:', error);
            this.isSaving = false;
          }
        });
      // Send data to a backend API or navigate to a confirmation page
    } else {
      console.log('Form is invalid');
      console.log(this.bookingService.bookingCompletionForm.errors);
      this.isSaving = false;
    }


    // this.gtmService.pushTag({
    //   event: 'button_click',
    //   category: 'User Interaction',
    //   label: 'Clicked CTA Button'
    // });


      // gtag('event', 'conversion', {
      //   'send_to': 'AW-11545021785/bQeoCPKn_JsaENmajIEr',
      //   'value': 1.0,
      //   'currency': 'USD'
      // });


    // Send event to GTM
    // this.gtmService.pushTag({
    //   event: 'begin_checkout',
    //   category: 'Booking',
    //   action: 'Click',
    //   label: 'Begin Checkout'
    // });
    // dataLayer.push({
    //   event: 'conversion_event',  // Must match the GTM trigger name
    //   conversion_value: 1.0,
    //   currency: 'USD'
    // });
    
  }

  needChildSeatToggleChanged(isChecked: boolean): void {
    const control = this.bookingService.bookingCompletionForm.get('child_seat_count');
    if (!control) {
      return;
    }

    if (isChecked) {
      const currentValue = Number(control.value) || 0;
      if (currentValue < 1) {
        control.setValue(1);
        this.childSeatCountChanged(1);
      } else {
        this.childSeatCountChanged(currentValue);
      }
    } else {
      control.setValue(1);
      this.childSeatCountChanged(1);
    }
  }

  adjustNumber(controlName: string, delta: number, min: number, max: number): void {
    const control = this.bookingService.bookingCompletionForm.get(controlName);
    if (!control) {
      return;
    }
    const current = Number(control.value) || 0;
    const next = this.clamp(current + delta, min, max);
    control.setValue(next);
    control.markAsDirty();
    control.markAsTouched();
    this.handleNumberSideEffects(controlName, next);
  }

  onNumberInput(controlName: string, rawValue: number, min: number, max: number): void {
    const control = this.bookingService.bookingCompletionForm.get(controlName);
    if (!control) {
      return;
    }
    const parsed = Number.isFinite(rawValue) ? rawValue : min;
    const next = this.clamp(parsed, min, max);
    control.setValue(next);
    control.markAsDirty();
    control.markAsTouched();
    this.handleNumberSideEffects(controlName, next);
  }

  onNumberInputEvent(controlName: string, event: Event, min: number, max: number): void {
    const target = event.target as HTMLInputElement | null;
    const value = target ? target.valueAsNumber : NaN;
    this.onNumberInput(controlName, value, min, max);
  }

  onChildSeatToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.needChildSeatToggleChanged(!!target?.checked);
  }

  onTimeChange(controlName: 'transfer_time' | 'return_transfer_time'): void {
    this.formatTimeInput(controlName);
    const control = this.bookingService.bookingCompletionForm.get(controlName);
    if (!control?.value) {
      return;
    }
    this.triggerTimeAnimation(controlName);
  }

  private formatTimeInput(controlName: string): void {
    const control = this.bookingService.bookingCompletionForm.get(controlName);
    if (!control) {
      return;
    }
    control.markAsTouched();
    const raw = (control.value ?? '').toString().trim();
    if (!raw) {
      this.clearInvalidTimeError(control);
      return;
    }
    const normalized = this.normalizeTime(raw);
    if (normalized) {
      if (normalized !== control.value) {
        control.setValue(normalized);
        control.markAsDirty();
      }
      this.clearInvalidTimeError(control);
    } else {
      this.setInvalidTimeError(control);
    }
  }

  private handleNumberSideEffects(controlName: string, value: number): void {
    if (controlName === 'child_seat_count') {
      this.childSeatCountChanged(value);
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  childSeatCountChanged(value: number): void {
    this.childSeatCount.set(value);
  }

  private normalizeTime(value: string): string | null {
    const sanitized = value.replace(/[^0-9:]/g, '');
    if (this.timeRegex.test(sanitized)) {
      return sanitized;
    }

    const colonMatch = /^(\d{1,2}):(\d{1,2})$/.exec(sanitized);
    if (colonMatch) {
      const hours = Number(colonMatch[1]);
      const minutes = Number(colonMatch[2]);
      if (hours <= 23 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      return null;
    }

    if (/^\d{3,4}$/.test(sanitized)) {
      const padded = sanitized.padStart(4, '0');
      const hours = Number(padded.slice(0, 2));
      const minutes = Number(padded.slice(2));
      if (hours <= 23 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      return null;
    }

    if (/^\d{1,2}$/.test(sanitized)) {
      const hours = Number(sanitized);
      if (hours <= 23) {
        return `${hours.toString().padStart(2, '0')}:00`;
      }
    }

    return null;
  }

  private setInvalidTimeError(control: AbstractControl): void {
    const errors = control.errors ?? {};
    if (errors['invalidTime']) {
      return;
    }
    control.setErrors({ ...errors, invalidTime: true });
  }

  private clearInvalidTimeError(control: AbstractControl): void {
    const errors = control.errors;
    if (!errors || !errors['invalidTime']) {
      return;
    }

    const { invalidTime, ...rest } = errors as Record<string, any>;
    const remainingKeys = Object.keys(rest);
    control.setErrors(remainingKeys.length ? rest : null);
  }

  private triggerTimeAnimation(controlName: 'transfer_time' | 'return_transfer_time'): void {
    const runAnimation = (target: 'transfer' | 'return') => {
      if (target === 'transfer') {
        this.animateTransferTime = true;
        this.transferAnimationTimeout = setTimeout(() => {
          this.animateTransferTime = false;
        }, this.timeAnimationDuration);
      } else {
        this.animateReturnTime = true;
        this.returnAnimationTimeout = setTimeout(() => {
          this.animateReturnTime = false;
        }, this.timeAnimationDuration);
      }
    };

    const resetAndAnimate = (target: 'transfer' | 'return') => {
      if (target === 'transfer') {
        this.animateTransferTime = false;
        if (this.transferAnimationTimeout) {
          clearTimeout(this.transferAnimationTimeout);
        }
      } else {
        this.animateReturnTime = false;
        if (this.returnAnimationTimeout) {
          clearTimeout(this.returnAnimationTimeout);
        }
      }

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => runAnimation(target));
        });
      } else {
        setTimeout(() => runAnimation(target), 0);
      }
    };

    if (controlName === 'transfer_time') {
      resetAndAnimate('transfer');
    } else {
      resetAndAnimate('return');
    }
  }

  private shouldGenerateRouteMap(): boolean {
    return !this.isMobileView && !this.isFromPopularRoute;
  }

  private getCoordinatePair(prefix: 'pickup' | 'dest'): { lat: number; lng: number } | null {
    const latRaw = this.bookingService.bookingInitialForm.get(`${prefix}_lat`)?.value;
    const lngRaw = this.bookingService.bookingInitialForm.get(`${prefix}_lng`)?.value;
    const lat = this.parseCoordinateValue(latRaw);
    const lng = this.parseCoordinateValue(lngRaw);
    if (lat === null || lng === null) {
      return null;
    }
    return { lat, lng };
  }

  private parseCoordinateValue(raw: unknown): number | null {
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? raw : null;
    }
    if (typeof raw === 'string' && raw.trim().length) {
      const parsed = parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private updateRouteMapUrl(): void {
    if (!isPlatformBrowser(this.platformId) || !this.shouldGenerateRouteMap()) {
      this.routeStaticMapUrl = null;
      return;
    }

    const origin = this.getCoordinatePair('pickup');
    const destination = this.getCoordinatePair('dest');

    if (!origin || !destination) {
      this.routeStaticMapUrl = null;
      return;
    }

    const size = '380x220';
    const scale = Math.min(Math.ceil(window.devicePixelRatio || 1), 2);

    const markers = [
      `markers=${encodeURIComponent(`label:A|color:0x1d4ed8|${origin.lat},${origin.lng}`)}`,
      `markers=${encodeURIComponent(`label:B|color:0xea580c|${destination.lat},${destination.lng}`)}`,
    ];
    const path = `path=${encodeURIComponent(`color:0x2563EBFF|weight:4|${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`)}`;

    this.routeStaticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${size}&scale=${scale}&${markers.join('&')}&${path}&key=${this.googleStaticMapsKey}`;
  }

  calculateChampagnePrice(): void {
    console.log(this.bookingService.bookingCompletionForm.get('greet_with_champagne')?.value);
    if (this.bookingService.bookingCompletionForm.get('greet_with_champagne')?.value) {
      const champagnePriceInCurrentCurrency = this.currencyService.convert(
        this.champagnePriceInEuro, 
        this.currencyService.getCurrencyByCode('EUR')!, 
        this.currencyService.currentCurrency()
      );
      this.champagnePrice.set(champagnePriceInCurrentCurrency);
    } else {
      this.champagnePrice.set(0);
    }
  }

  calculateFlowerPrice(): void {
    console.log(this.bookingService.bookingCompletionForm.get('greet_with_flower')?.value);
    if (this.bookingService.bookingCompletionForm.get('greet_with_flower')?.value) {
      const flowerPriceInCurrentCurrency = this.currencyService.convert(
        this.flowerPriceInEuro, 
        this.currencyService.getCurrencyByCode('EUR')!, 
        this.currencyService.currentCurrency()
      );
      this.flowerPrice.set(flowerPriceInCurrentCurrency);
    } else {
      this.flowerPrice.set(0);
    }
  }

  goToPreviousStep(): void {
    this.previousStep.emit(this.bookingService.bookingCompletionForm.value);
  }

  ngOnDestroy(): void {
    if (this.transferAnimationTimeout) {
      clearTimeout(this.transferAnimationTimeout);
    }
    if (this.returnAnimationTimeout) {
      clearTimeout(this.returnAnimationTimeout);
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private resolveTimePickerLocale(langCode: string): string {
    switch (langCode) {
      case 'de':
        return 'de-DE';
      case 'ru':
        return 'ru-RU';
      case 'tr':
        return 'tr-TR';
      case 'en':
      default:
        return 'en-GB';
    }
  }

// create translations for above texts line by line in en, de, ru, tr languages

  translations: any = {
    reservationDetails : {
      en: 'Reservation Details',
      de: 'Reservierungsdetails',
      ru: 'Детали бронирования',
      tr: 'Rezervasyon Detayları',
    }, 
    customPickupLabel: {
      en: 'Pickup Hotel/Location',
      de: 'Abholhotel/-ort',
      ru: 'Отель/Место встречи',
      tr: 'Alış Oteli/Mekanı',
    },
    customDestinationLabel: {
      en: 'Destination Hotel/Address',
      de: 'Ziel Hotel/Adresse',
      ru: 'Отель/Адрес назначения',
      tr: 'Varış Oteli/Adresi',
    },
    car: {
      en: 'Car', 
      de: 'Auto',
      ru: 'Автомобиль',
      tr: 'Araba',
    },
    orEquivalent: {
      en: 'or equivalent',
      de: 'oder ähnlich',
      ru: 'или аналогичный',
      tr: 'veya dengi',
    },
    from: {
      en: 'From', 
      de: 'Von',
      ru: 'От',
      tr: 'Nereden',
    },
    to: {
      en: 'To', 
      de: 'Nach',
      ru: 'До',
      tr: 'Nereye',
    }, 
    price: {
      en: 'Price', 
      de: 'Preis',
      ru: 'Цена',
      tr: 'Fiyat',
    }, 
    distance: {
      en: 'Distance', 
      de: 'Entfernung',
      ru: 'Расстояние',
      tr: 'Mesafe',
    }, 
    duration: {
      en: 'Duration',
      de: 'Dauer',
      ru: 'Время в пути',
      tr: 'Süre',
    },
    completeYourReservation: {
      en: 'Complete Your Reservation',
      de: 'Vervollständigen Sie Ihre Reservierung',
      ru: 'Завершите вашу бронь',
      tr: 'Rezervasyonunuzu Tamamlayın',
    },
    travelAndFlightInfo: {
      en: 'Travel and Flight Information', 
      de: 'Reise- und Fluginformationen',
      ru: 'Информация о поездке и рейсе',
      tr: 'Seyahat ve Uçuş Bilgileri',
    }, 
    transferDate: {
      en: 'Transfer Date', 
      de: 'Transferdatum',
      ru: 'Дата трансфера',
      tr: 'Transfer Tarihi',
    }, 
    transferTime: {
      en: 'Transfer Time', 
      de: 'Transferzeit',
      ru: 'Время трансфера',
      tr: 'Transfer Zamanı',
    }, 
    flightNumber: {
      en: 'Flight Number', 
      de: 'Flugnummer',
      ru: 'Номер рейса',
      tr: 'Uçuş Numarası',
    }, 
    returnTransfer: {
      en: 'Want Return Transfer?',
      de: 'Möchten Sie einen Rücktransfer?',
      ru: 'Хотите обратный трансфер?',
      tr: 'Dönüş Transferi İster misiniz?',
    },
    returnTransferDate: {
      en: 'Return Transfer Date',
      de: 'Rücktransferdatum',
      ru: 'Дата обратного трансфера',
      tr: 'Dönüş Transfer Tarihi',
    }, 
    returnTransferTime: {
      en: 'Return Transfer Time', 
      de: 'Rücktransferzeit',
      ru: 'Время обратного трансфера',
      tr: 'Dönüş Transfer Zamanı',
    },
    returnFlightNumber: {
      en: 'Return Flight Number',
      de: 'Rückflugnummer',
      ru: 'Номер обратного рейса',
      tr: 'Dönüş Uçuş Numarası',
    }, 
    personalInfo: {
      en: 'Personal Information', 
      de: 'Persönliche Informationen',
      ru: 'Личная информация',
      tr: 'Kişisel Bilgiler',
    }, 
    fullName: {
      en: 'Name and Surname', 
      de: 'Vor- und Nachname',
      ru: 'Имя и фамилия',
      tr: 'Ad ve Soyad',
    }, 
    email: {
      en: 'Email', 
      de: 'Email',
      ru: 'Эл. адрес',
      tr: 'Email',
    }, 
    phone: {
      en: 'Phone', 
      de: 'Telefon',
      ru: 'Телефон',
      tr: 'Telefon',
    }, 
    primaryPhone: {
      en: 'Primary Phone', 
      de: 'Primäres Telefon',
      ru: 'Основной телефон',
      tr: 'Birincil Telefon',
    }, 
    additionalPhone: {
      en: 'Additional Phone', 
      de: 'Zusätzliches Telefon',
      ru: 'Дополнительный телефон',
      tr: 'Ek Telefon',
    }, 
    passengerCount: {
      en: 'Passenger Count', 
      de: 'Passagieranzahl',
      ru: 'Количество пассажиров',
      tr: 'Yolcu Sayısı',
    }, 
    childCount: {
      en: 'Child Count', 
      de: 'Kinderanzahl',
      ru: 'Количество детей',
      tr: 'Çocuk Sayısı',
    }, 
    extraServices: {
      en: 'Extra Services', 
      de: 'Zusatzleistungen',
      ru: 'Дополнительные услуги',
      tr: 'Ek Hizmetler',
    }, 
    needChildSeat: {
      en: 'Need Child Seat?', 
      de: 'Brauchen Sie einen Kindersitz?',
      ru: 'Нужен детский кресло?',
      tr: 'Çocuk Koltuğu Gerekli mi?',
    }, 
    note: {
      en: 'Note',
      de: 'Hinweis',
      ru: 'Примечание',
      tr: 'Not',
    }, 
    notePlaceholder: {
      en: 'Write any additional details...', 
      de: 'Schreiben Sie weitere Details...',
      ru: 'Напишите любые дополнительные сведения...',
      tr: 'Herhangi ek detayları yazın...',
    }, 
    payment: {
      en: 'Payment', 
      de: 'Zahlung',
      ru: 'Оплата',
      tr: 'Ödeme',
    }, 
    paymentNote: {
      en: 'Pay cash to the driver after your trip. No payment is required until you\'re fully satisfied.', 
      de: 'Zahlen Sie bar an den Fahrer nach Ihrer Reise. Es ist keine Zahlung erforderlich, bis Sie vollständig zufrieden sind.',
      ru: 'Оплатите наличными водителю после поездки. Оплата не требуется, пока вы полностью не удовлетворены.',
      tr: 'Seyahatinizden sonra sürücüye nakit ödeyin. Tamamen memnun olana kadar ödeme yapmanız gerekmez.',
    }, 
    back: {
      en: 'Back', 
      de: 'Zurück',
      ru: 'Назад',
      tr: 'Geri',
    }, 
    fieldRequired: {
      en: 'This field is required', 
      de: 'Dieses Feld ist erforderlich',
      ru: 'Это поле обязательно',
      tr: 'Bu alan gereklidir',
    }, 
    formError: {
      en: 'Please fill required fields', 
      de: 'Bitte füllen Sie die erforderlichen Felder aus',
      ru: 'Пожалуйста, заполните обязательные поля',
      tr: 'Lütfen gerekli alanları doldurun',
    }, 
    yearsOld: {
      en: 'years old',
      de: 'Jahre alt',
      ru: 'лет',
      tr: 'yaşında',
    }, 
    completeReservation: {
      en: 'Send Reservation Request', 
      de: 'Reservierung abschließen',
      ru: 'Завершить бронирование',
      tr: 'Rezervasyonu Tamamla',
    }, 
    returnTripPrice: {
      en: 'Return Trip Price', 
      de: 'Rückfahrpreis',
      ru: 'Цена обратной поездки',
      tr: 'Dönüş Yolculuğu Fiyatı',
    },
    twoTrips: {
      en: 'You have booked 2 trips',
      de: 'Sie haben 2 Fahrten gebucht',
      ru: 'Вы забронировали 2 поездки',
      tr: '2 yolculuk rezervasyonu yaptınız',
    },
    eachTripCost: {
      en: 'trip costs',
      de: 'Fahrt kostet',
      ru: 'поездка стоит',
      tr: 'yolculuğun maliyeti',
    },
    total: {
      en: 'Total',
      de: 'Gesamt',
      ru: 'Итого',
      tr: 'Toplam',
    }, 
    childSeatPricePerUnit: {
      en: '1 free, then +5 €', 
      de: '1 kostenlos, dann +5 €',
      ru: '1 бесплатно, затем +5 €',
      tr: '1 ücretsiz, sonra +5 €',
    }, 
    greetingWithFlower: {
      en: 'Greeting with Flower', 
      de: 'Begrüßung mit Blume',
      ru: 'Приветствие с цветком',
      tr: 'Çiçekle Karşılama',
    }, 
    greetingWithChampagne: {
      en: 'Greeting with Champagne', 
      de: 'Begrüßung mit Champagner',
      ru: 'Приветствие с шампанским',
      tr: 'Şampanya ile Karşılama',
    }, 
    basePrice: {
      en: 'Base Price',
      de: 'Grundpreis',
      ru: 'Базовая цена',
      tr: 'Taban Fiyat',
    }, 
    childSeatPrice: {
      en: 'Child Seat Price', 
      de: 'Kindersitzpreis',
      ru: 'Цена детского кресла',
      tr: 'Çocuk Koltuğu Fiyatı',
    }, 
    flowerPrice: {
      en: 'Flower Price', 
      de: 'Blumenpreis',
      ru: 'Цена цветка',
      tr: 'Çiçek Fiyatı',
    }, 
    champagnePrice: {
      en: 'Champagne Price', 
      de: 'Champagnerpreis',
      ru: 'Цена шампанского',
      tr: 'Şampanya Fiyatı',
    }, 
    firstTripBasePrice: {
      en: '1st Trip Base Price', 
      de: 'Grundpreis für die 1. Fahrt',
      ru: 'Базовая цена за 1 поездку',
      tr: '1. Yolculuk Taban Fiyatı',
    }, 
    firstTripChildSeatPrice: {
      en: 'Child Seat Price (1st Trip)', 
      de: 'Kindersitzpreis (1. Fahrt)',
      ru: 'Цена детского кресла (1 поездка)',
      tr: 'Çocuk Koltuğu Fiyatı (1. Yolculuk)',
    }, 
    secondTripBasePrice: {
      en: '2nd Trip Base Price', 
      de: 'Grundpreis für die 2. Fahrt',
      ru: 'Базовая цена за 2 поездку',
      tr: '2. Yolculuk Taban Fiyatı',
    }, 
    secondTripChildSeatPrice: {
      en: 'Child Seat Price (2nd Trip)', 
      de: 'Kindersitzpreis (2. Fahrt)',
      ru: 'Цена детского кресла (2 поездка)',
      tr: 'Çocuk Koltuğu Fiyatı (2. Yolculuk)',
    },
    phoneFormatHint: {
      en: 'Please include country code, starting with + or 00 (e.g. +90 555 555 5555)',
      de: 'Bitte geben Sie die Vorwahl an, beginnend mit + oder 00 (z.B. +90 555 555 5555)',
      ru: 'Пожалуйста, укажите код страны, начиная с + или 00 (например, +90 555 555 5555)',
      tr: '+ veya 00 ile başlayan ülke kodunu içermelidir (örn. +90 555 555 5555)',
    }, 
    invalidEmail: {
      en: 'Please enter a valid email address.',
      de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      ru: 'Пожалуйста, введите действительный адрес электронной почты.',
      tr: 'Lütfen geçerli bir e-posta adresi girin.',
    }
    
  }

  // Put this inside the component class
private resolveCountryISO(alpha2?: string): CountryISO | undefined {
  if (!alpha2) return undefined;
  const upper = alpha2.toUpperCase();
  const match = Object.entries(CountryISO)
    .find(([, v]) => (v as string).toUpperCase() === upper);
  return (match?.[1] as CountryISO) ?? undefined;
}

}
