import { Component, inject, Inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingBannerFormComponent } from '../booking-banner-form/booking-banner-form.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-banner',
  imports: [
    BookingBannerFormComponent, 
    CommonModule, 
  ],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent implements OnInit {
  private router! : Router;
  isBrowser: boolean;
  currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};

  constructor(@Inject(PLATFORM_ID) private platformId: any, 
    private route: ActivatedRoute, 
) {
    if (typeof window !== 'undefined') {
      this.router = inject(Router);
    }
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
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
    return value[this.currentLanguage.code] || key;
  }

  
  translations: any = {
    banner: {
      title: {
        en: 'Hassle-Free 24/7 Private Airport Transfers in Turkey', 
        de: 'Stressfreie 24/7 Privatflughafentransfers in der Türkei',
        ru: 'Беззаботные круглосуточные 24/7 частные трансферы из аэропорта в Турции',
        tr: 'Türkiye\'de Sorunsuz 7/24 Özel Havalimanı Transferleri',
      }, 
      subtitle: {
        en: 'Reliable, affordable, and comfortable 24/7 private car rides to and from major Turkish airports.',
        de: 'Zuverlässige, erschwingliche und komfortable 24/7 Privatfahrten zu und von den wichtigsten türkischen Flughäfen.',
        ru: 'Надежные, доступные и комфортные 24/7 частные поездки на автомобиле крупных турецких аэропортов.',
        tr: 'Önde gelen Türk havalimanlarından ve havalimanlarına güvenilir, uygun fiyatlı ve konforlu 7/24 özel araçlarla ulaşım.',
      }, 
      image: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya.webp',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya.webp',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья.webp',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya.webp',
          
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      }, 
      imageS: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya-s.webp',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya-s.webp',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья-s.webp',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya-s.webp',
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      }, 
      imageM: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya-m.webp',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya-m.webp',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья-m.webp',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya-m.webp',
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya', 
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      },
      imageJpg: {
        name: {
          en: '24-7-private-airport-transfer-turkey-antalya-istanbul-alanya.jpg',
          de: '24-7-private-flughafentransfer-turkei-antalya-istanbul-alanya.jpg',
          ru: '24-7-частный-трансфер-из-аэропорта-турция-анталья-стамбул-аланья.jpg',
          tr: '7-24-ozel-havalimani-transferi-türkiye-antalya-istanbul-alanya.jpg',
        }, 
        alt: {
          en: '24/7 Private Airport Transfer Turkey Antalya Istanbul Alanya',
          de: '24/7 Privater Flughafentransfer Türkei Antalya Istanbul Alanya',
          ru: '24/7 Частный Трансфер из Аэропорта Турция Анталья Стамбул Аланья',
          tr: '7/24 Özel Havalimanı Transferi Türkiye Antalya İstanbul Alanya',
        }
      },
    }
  };
  

  // constructor(
    // public googleMapsService: GoogleMapsService, 
    // public bookingService: BookingService, 
    // private router: Router, 
    // private languageService: LanguageService,
  // ) {
  // }

  // onSubmit(): void {
  //   const formValue = this.bookingService.bookingInitialForm.value;
  //   console.log('Booking Form:', formValue);
  //   const origin: google.maps.LatLngLiteral = { 
  //     lat: formValue.pickup_lat, lng: formValue.pickup_lng };
  //   const destination: google.maps.LatLngLiteral = { 
  //     lat: formValue.dest_lat, lng: formValue.dest_lng };

  //   this.googleMapsService.calculateDrivingDistanceAndTime(origin, destination
  //   ).then(result => {
  //       this.router.navigate([`${this.languageService.currentLang().code}/booking`], {
  //         queryParams: {
  //           step: 2,
  //           pickup_full: formValue.pickup_full,
  //           dest_full: formValue.dest_full,
  //           pickup_lat: formValue.pickup_lat,
  //           pickup_lng: formValue.pickup_lng,
  //           dest_lat: formValue.dest_lat,
  //           dest_lng: formValue.dest_lng, 
  //           distance: result.distance,
  //           driving_duration: result.duration,
  //         },
  //       });
  //   }).catch(error => {
  //     console.error('Error calculating distance:', error);
  //   });

  // }

  // onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
  //   console.log('Pickup place selected:', place);
  //   const pickup_full = this.googleMapsService.getFormattedAddress(place);
  //   const pickup_lat = this.googleMapsService.getLatitude(place);
  //   const pickup_lng = this.googleMapsService.getLongitude(place);
  //   this.bookingService.bookingInitialForm.patchValue({
  //     pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng
  //   });
  // }

  // onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
  //   console.log('Destination place selected:', place);
  //   const dest_full = this.googleMapsService.getFormattedAddress(place);
  //   const dest_lat = this.googleMapsService.getLatitude(place);
  //   const dest_lng = this.googleMapsService.getLongitude(place);
  //   this.bookingService.bookingInitialForm.patchValue({
  //     dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng
  //   });
  // }

  // preventFormSubmit(event: KeyboardEvent): void {
  //   if (event.key === 'Enter') {
  //     event.preventDefault(); // Prevent the form from submitting
  //   }
  // }
}
