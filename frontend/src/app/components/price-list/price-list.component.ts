import { AfterViewInit, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { MainLocationService } from '../../services/main-location.service';
import { PopularRouteService } from '../../admin/services/popular-route.service';
import { CarTypeService } from '../../services/car-type.service';
import { CurrencyService } from '../../services/currency.service';
import { PriceCalculatorService } from '../../services/price-calculator.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { BookingService } from '../../services/booking.service';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { GoogleTagManagerService } from 'angular-google-tag-manager';

@Component({
  selector: 'app-price-list',
  imports: [
    TabsModule, 
    CommonModule, 
  ],
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss'
})
export class PriceListComponent implements OnInit, AfterViewInit {
  navbar = NAVBAR_MENU;
  activeIndex: number = 1;
  mainLocationService = inject(MainLocationService);
  popularRouteService = inject(PopularRouteService);
  carTypeService = inject(CarTypeService);
  priceCalculatorService = inject(PriceCalculatorService);
  currencyService = inject(CurrencyService);

  popularRoutesSignal = this.popularRouteService.popularRoutesSignal;
  
  mainLocations: any[] = this.mainLocationService.getMainLocations();

  // private router! : Router;
  // isBrowser: boolean;

  // constructor(@Inject(PLATFORM_ID) private platformId: any) {
  //   if (typeof window !== 'undefined') {
  //     this.router = inject(Router);
  //   }
  //   this.isBrowser = isPlatformBrowser(this.platformId);
  // }
  constructor(
    private googleMapsService: GoogleMapsService, 
    private bookingService: BookingService, 
    public languageService: LanguageService, 
    private router: Router, 
    private gtmService: GoogleTagManagerService, 
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
  }

  bookRoute(
    pickup_full: string, dest_full: string, 
    car_type: string, 
    price: number, currency_code: string  
  ): void {
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: pickup_full,
      dest_full: dest_full,
    });
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      car_type: car_type,
      amount: price,
      currency_code: currency_code,
    });

    const intialFormValue = this.bookingService.bookingInitialForm.value;
    const carTypeSelectionFormValue = this.bookingService.bookingCarTypeSelectionForm.value;
    console.log('Booking Initial Form:', intialFormValue);
    console.log('Booking Car Type Selection Form:', carTypeSelectionFormValue);


    this.router.navigate([`${this.languageService.currentLang().code}/${this.navbar.bookNow.slug[this.languageService.currentLang().code]}/`], {
      queryParams: {
        step: 3,
        pickup_full: intialFormValue.pickup_full,
        dest_full: intialFormValue.dest_full,
        pickup_lat: intialFormValue.pickup_lat,
        pickup_lng: intialFormValue.pickup_lng,
        dest_lat: intialFormValue.dest_lat,
        dest_lng: intialFormValue.dest_lng, 
        distance: 0,
        driving_duration: 0,
        car_type: carTypeSelectionFormValue.car_type,
        amount: carTypeSelectionFormValue.amount,
        currency_code: carTypeSelectionFormValue.currency_code
      },
    });

    // Send event to GTM
    this.gtmService.pushTag({
      event: 'book_now_initialform_click',
      category: 'Booking',
      action: 'Click',
      label: 'Book Now Button'
    });
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
    return value[this.languageService.currentLang().code] || key;
  }

  translations: any = {
    or_equivalent: {
      'en': 'or equivalent', 
      'de': 'oder gleichwertig',
      'tr': 'veya eşdeğeri',
      'ru': 'или эквивалент',
    }, 
    book_now: {
      'en': 'Book Now',
      'de': 'Jetzt buchen',
      'tr': 'Rezervasyon yap',
      'ru': 'Забронировать сейчас',
    },
  };

}