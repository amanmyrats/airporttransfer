import { AfterViewInit, Component, computed, effect, ElementRef, Inject, inject, Input, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MainLocationService } from '../../services/main-location.service';
import { PopularRouteService } from '../../admin/services/popular-route.service';
import { CarTypeService } from '../../services/car-type.service';
import { CurrencyService } from '../../services/currency.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
// import { GoogleMapsService } from '../../services/google-maps.service';
import { BookingService } from '../../services/booking.service';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
// import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { MainLocation } from '../../models/main-location.model';
import { PricesLoadingComponent } from '../prices-loading/prices-loading.component';

@Component({
  selector: 'app-price-list',
  imports: [
    CommonModule, 
    PricesLoadingComponent, 
  ],
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss'
})
export class PriceListComponent implements OnInit, AfterViewInit {
  @ViewChild('transferPricesContainer') transferPricesContainer!: ElementRef;
  @Input() langInput!: any;

  navbar = NAVBAR_MENU;
  activeIndex: number = 1;
  mainLocationService = inject(MainLocationService);
  popularRouteService = inject(PopularRouteService);
  carTypeService = inject(CarTypeService);
  priceCalculatorService = inject(PriceCalculatorService);
  currencyService = inject(CurrencyService);
  isLoadingPricesSignal = this.popularRouteService.isLoadingPricesSignal;

  popularRoutesSignal = this.popularRouteService.popularRoutesSignal;

  isBookNowLoading: boolean = false;
  loadingRouteId: string | null = null;
  
  mainLocations: any[] = this.mainLocationService.getMainLocations();
  selectedLocation: any | null = null;
  switchedRouteIds = signal<Set<string>>(new Set<string>());

  // private router! : Router;
  // isBrowser: boolean;

  // constructor(@Inject(PLATFORM_ID) private platformId: any) {
  //   if (typeof window !== 'undefined') {
  //     this.router = inject(Router);
  //   }
  //   this.isBrowser = isPlatformBrowser(this.platformId);
  // }
  constructor(
    private bookingService: BookingService, 
    public languageService: LanguageService, 
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object, 
  ) {
    this.mainLocations = this.mainLocationService.getMainLocations();
    this.popularRouteService.updatePopularRoutesSignal();


    // Effect to filter main locations based on popularRoutesSignal
    effect(() => {
      const popularRoutes = this.popularRoutesSignal();
      const filteredMainLocations = this.mainLocationService.getMainLocations().filter(location =>
        popularRoutes.some(route => route.main_location === location.code)
      );
      this.mainLocations = filteredMainLocations;
    });
  }
  
  ngOnInit(): void {
    this.showTransferPrices(this.mainLocations[0], true);
  }

  bookRoute(
    routeId: string,
    pickup_short: string, 
    dest_short: string,
    pickup_full: string, 
    dest_full: string, 
    car_type: string, 
    price: number, 
    currency_code: string, 
    is_switched_route: number = 0,  
  ): void {
    this.isBookNowLoading = true;
    this.loadingRouteId = routeId;
    this.bookingService.bookingInitialForm.patchValue({
      pickup_short: pickup_short,
      dest_short: dest_short, 
      pickup_full: pickup_full,
      dest_full: dest_full, 
      is_from_popular_routes: 1,
      is_switched_route: is_switched_route,
    });
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      car_type: car_type,
      amount: price,
      currency_code: currency_code,
    });

    const initialFormValue = this.bookingService.bookingInitialForm.value;
    const carTypeSelectionFormValue = this.bookingService.bookingCarTypeSelectionForm.value;
    console.log('Booking Initial Form:', initialFormValue);
    console.log('Booking Car Type Selection Form:', carTypeSelectionFormValue);


    this.router.navigate([`${this.langInput.code}/${this.navbar.bookNow.slug[this.langInput.code]}/completion/`], {
      queryParams: {
        step: 3,
        is_from_popular_routes: initialFormValue.is_from_popular_routes,
        pickup_short: initialFormValue.pickup_short,
        dest_short: initialFormValue.dest_short,
        pickup_full: initialFormValue.pickup_full,
        dest_full: initialFormValue.dest_full,
        pickup_lat: initialFormValue.pickup_lat,
        pickup_lng: initialFormValue.pickup_lng,
        dest_lat: initialFormValue.dest_lat,
        dest_lng: initialFormValue.dest_lng, 
        distance: 0,
        driving_duration: 0,
        car_type: carTypeSelectionFormValue.car_type,
        amount: carTypeSelectionFormValue.amount,
        currency_code: carTypeSelectionFormValue.currency_code, 
        is_switched_route: initialFormValue.is_switched_route,
      },
    }).catch(() => {
      this.isBookNowLoading = false;
      this.loadingRouteId = null;
    });

    // Send event to GTM
    // this.gtmService.pushTag({
    //   event: 'book_now_click',
    //   category: 'Booking',
    //   action: 'Click',
    //   label: 'Book Now Button'
    // });
  }

  ngAfterViewInit(): void {
    this.activeIndex = 2;
      
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
    return value[this.langInput?.code] || key;
  }

  translations: any = {
    or_equivalent: {
      'en': 'or equivalent', 
      'de': 'oder gleichwertig',
      'ru': 'или эквивалент',
      'tr': 'veya eşdeğeri',
    }, 
    book_now: {
      'en': 'Book Now',
      'de': 'Jetzt buchen',
      'ru': 'Забронировать сейчас',
      'tr': 'Rezervasyon yap',
    },
    transfer_prices: {
      'en': 'Transfer Prices',
      'de': 'Transferpreise',
      'ru': 'Цены на трансфер',
      'tr': 'Transfer Fiyatları',
    },
    loading: {
      'en': 'Loading...',
      'de': 'Laden...',
      'ru': 'Загрузка...',
      'tr': 'Yükleniyor...',
    },
    passengers: {
      'en': 'Passengers',
      'de': 'Passagiere',
      'ru': 'Пассажиры',
      'tr': 'Yolcu',
    },
    from_label: {
      'en': 'From',
      'de': 'Abfahrt',
      'ru': 'Откуда',
      'tr': 'Kalkış',
    },
    to_label: {
      'en': 'To',
      'de': 'Ziel',
      'ru': 'Куда',
      'tr': 'Varış',
    },
    swap_route: {
      'en': 'Switch route',
      'de': 'Route wechseln',
      'ru': 'Поменять направление',
      'tr': 'Rotayı değiştir',
    },
  };



  showTransferPrices(location: MainLocation, triggeredInOnInit: boolean = false): void {
    this.selectedLocation = location;
    this.switchedRouteIds.set(new Set<string>());
    this.loadingRouteId = null;
    this.isBookNowLoading = false;
    
    if (!triggeredInOnInit) {
      if (isPlatformBrowser(this.platformId)) {

      // Wait for the view to update, then scroll
      setTimeout(() => {
        this.transferPricesContainer?.nativeElement.scrollIntoView({
          behavior: 'smooth', // Smooth scrolling
          block: 'start' // Scroll to the top of the viewport
        });
      }, 100);
      }
    }
  }

  toggleRouteDirection(routeId?: string): void {
    if (!routeId) {
      return;
    }
    this.switchedRouteIds.update((current) => {
      const next = new Set(current);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  }

  isRouteSwitched(routeId?: string): boolean {
    if (!routeId) {
      return false;
    }
    return this.switchedRouteIds().has(routeId);
  }

  getSelectedLocationShort(): string {
    if (!this.selectedLocation) {
      return '';
    }
    const langCode = this.langInput?.code;
    return (
      this.selectedLocation.short?.[langCode] ??
      this.selectedLocation.short?.en ??
      this.selectedLocation.name ??
      ''
    );
  }

  getSelectedLocationFull(): string {
    if (!this.selectedLocation) {
      return '';
    }
    const langCode = this.langInput?.code;
    return (
      this.selectedLocation[langCode] ??
      this.selectedLocation.name ??
      ''
    );
  }

  getNameSizeClass(name: string | undefined | null): string {
    if (!name) {
      return '';
    }
    const length = name.trim().length;
    if (length > 18) {
      return 'route-card__name--long';
    }
    if (length > 13) {
      return 'route-card__name--medium';
    }
    return '';
  }

  // getTranslation(key: string): string {
  //   // Implement your translation logic here
  //   return key;
  // }

  // bookRoute(mainLocationName: string, destination: string, carType: string, price: number, currencyCode: string) {
  //   // Implement your booking logic here
  //   console.log(`Booking route from ${mainLocationName} to ${destination} with ${carType} for ${price} ${currencyCode}`);
  // }

}
