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
        en: 'Hassle-Free Airport Transfers in Turkey',
        de: 'Stressfreie Flughafentransfers in der Türkei',
        ru: 'Беззаботные трансферы из аэропорта в Турции',
        tr: 'Türkiye\'de Sorunsuz Havalimanı Transferleri',
      }, 
      subtitle: {
        en: 'Reliable, affordable, and comfortable rides to and from major Turkish airports.', 
        de: 'Zuverlässige, erschwingliche und komfortable Fahrten zu und von den wichtigsten türkischen Flughäfen.',
        ru: 'Надежные, доступные и комфортные поездки в аэропорты Турции.',
        tr: 'Türkiye\'nin ana havalimanlarına güvenilir, uygun fiyatlı ve konforlu yolculuklar.',
      }, 
      imageName: {
        en: 'airport-transfer-turkey-antalya-istanbul-alanya.webp',
        de: 'flughafentransfer-turkei-antalya-istanbul-alanya.webp',
        ru: 'трансфер-из-аэропорта-турция-анталия-стамбул-аланья.webp',
        tr: 'havalimanı-transfer-türkiye-antalya-istanbul-alanya.webp',
      }, 
      imageSName: {
        en: 'airport-transfer-turkey-antalya-istanbul-alanya-s.webp',
        de: 'flughafentransfer-turkei-antalya-istanbul-alanya-s.webp',
        ru: 'трансфер-из-аэропорта-турция-анталия-стамбул-аланья-s.webp',
        tr: 'havalimanı-transfer-türkiye-antalya-istanbul-alanya-s.webp',
      }, 
      imageMName: {
        en: 'airport-transfer-turkey-antalya-istanbul-alanya-m.webp',
        de: 'flughafentransfer-turkei-antalya-istanbul-alanya-m.webp',
        ru: 'трансфер-из-аэропорта-турция-анталия-стамбул-аланья-m.webp',
        tr: 'havalimanı-transfer-türkiye-antalya-istanbul-alanya-m.webp',
      },
      imageJpgName: {
        en: 'airport-transfer-turkey-antalya-istanbul-alanya.jpg',
        de: 'flughafentransfer-turkei-antalya-istanbul-alanya.jpg',
        ru: 'трансфер-из-аэропорта-турция-анталия-стамбул-аланья.jpg',
        tr: 'havalimanı-transfer-türkiye-antalya-istanbul-alanya.jpg',
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
