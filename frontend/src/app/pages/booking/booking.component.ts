import { Component, inject, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { BookingInitialFormComponent } from '../../components/booking-initial-form/booking-initial-form.component';
import { BookingCompletionFormComponent } from '../../components/booking-completion-form/booking-completion-form.component';
import { BookingCarTypeSelectionFormComponent } from '../../components/booking-car-type-selection-form/booking-car-type-selection-form.component';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { LanguageService } from '../../services/language.service';
import { BookingSearchEvent } from '../../components/booking-form/booking-form.component';
import { usePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { Meta, Title } from '@angular/platform-browser';


@Component({
  selector: 'app-booking',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    ButtonModule, StepperModule, 
    BookingInitialFormComponent, 
    BookingCarTypeSelectionFormComponent, 
    BookingCompletionFormComponent, 
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  bookingService = inject(BookingService);
  activeStep: number = 1;
  stepFromUrl: number | null = null;
  currentLanguage = {code: 'en', name: 'English', flag: 'flags/gb.svg'};

  constructor(
    private route: ActivatedRoute, 
    public languageService: LanguageService, 
    private title: Title, 
    private meta: Meta, 
  ) { }

  ngOnInit(): void {
    console.log('BookingComponent initialized');

    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  
    this.setMetaTags(this.currentLanguage.code);

    this.route.queryParams.subscribe((params) => {
      if (params['step'] === '2') {
        this.prefillStep1Data(params);
        this.stepFromUrl = 2; // Start from step 2
        this.activeStep = this.stepFromUrl;
      }
      if (params['step'] === '3') {
        this.prefillStep1Data(params);
        this.prefillStep2Data(params);
        this.stepFromUrl = 3;
        this.activeStep = this.stepFromUrl; // Start from step 3
      }
    });
    usePreset(Aura);
  }


  prefillStep1Data(params: any): void {
    this.bookingService.bookingInitialForm.patchValue({
      pickup_short: params['pickup_short'],
      dest_short: params['dest_short'],
      pickup_full: params['pickup_full'],
      pickup_lat: params['pickup_lat'],
      pickup_lng: params['pickup_lng'],
      dest_full: params['dest_full'],
      dest_lat: params['dest_lat'],
      dest_lng: params['dest_lng'],
      is_popular_route: params['is_popular_route'] === '1' ? true : false,
    });
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      distance: params['distance'],
      driving_duration: params['driving_duration'],
    });
  }

  prefillStep2Data(params: any): void {
    this.bookingService.bookingCarTypeSelectionForm.patchValue({
      car_type: params['car_type'],
      amount: params['amount'],
      currency_code: params['currency_code'],
    });
  }

  goToStep(event: any, fromStep: number, toStep: number): void {
    console.log('Navigating fromStep:', fromStep);
    console.log('Navigating toStep:', toStep);
    console.log('Event:', event);

    if (event && typeof event === 'object' && 'complete' in event && typeof event.complete === 'function') {
      const bookingEvent = event as BookingSearchEvent;
      this.activeStep = toStep;
      bookingEvent.complete();
      return;
    }

    this.activeStep = toStep;
  }

  setMetaTags(langCode: string): void {
    // { path: 'en/book-now-24-7-private-airport-transfer-in-turkey', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'en' }   },
    // { path: 'de/jetzt-buchen-24-7-privater-flughafentransfer-in-der-türkei', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'de' }   },
    // { path: 'ru/забронировать-сейчас-24-7-частный-трансфер-из-аэропорта-в-турции', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'ru' }   },
    // { path: 'tr/türkiye-de-7-24-özel-havalimanı-transferi-şimdi-rezervasyon-yap', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent), data: { language: 'tr' }   },

    const metaTags: any = {
      en: {
        title: 'Book Now - 24/7 Private Airport Transfer in Turkey',
        description: 'Book your 24/7 private airport transfer in Turkey. Affordable and reliable services covering Antalya, Istanbul, Alanya, Izmir, and more.',
      },
      de: {
        title: 'Buchen Sie jetzt - 24/7 privater Flughafentransfer in der Türkei',
        description: 'Buchen Sie Ihren 24/7 privaten Flughafentransfer in der Türkei. Erschwingliche und zuverlässige Dienstleistungen in Antalya, Istanbul, Alanya, Izmir und mehr.',
      },
      ru: {
        title: 'Забронировать сейчас - 24/7 частный трансфер из аэропорта в Турции',
        description: 'Забронируйте свой 24/7 частный трансфер из аэропорта в Турции. Доступные и надежные услуги в Анталии, Стамбуле, Аланье, Измире и других городах.',
      }, 
      tr: {
        title: 'Şimdi Rezervasyon Yap - Türkiye\'de 7/24 Özel Havalimanı Transferi',
        description: 'Türkiye\'deki 7/24 özel havalimanı transferinizi şimdi rezerve edin. Antalya, İstanbul, Alanya, İzmir ve daha fazlasını kapsayan uygun fiyatlı ve güvenilir hizmetler.',
      }

    };

    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }

  translations: any = {
    destination: {
      en: 'Destination',
      de: 'Ziel',
      ru: 'Место назначения',
      tr: 'Gidilecek Yer',
    },
    vehicle: {
      en: 'Vehicle',
      de: 'Fahrzeug',
      ru: 'Транспортное средство',
      tr: 'Araç',
    }, 
    personal: {
      en: 'Personal Info', 
      de: 'Persönliche Informationen',
      ru: 'Личная информация',
      tr: 'Kişisel Bilgiler',
    }, 
    back: {
      en: 'Back', 
      de: 'Zurück',
      ru: 'Назад',
      tr: 'Geri',
    },
  }

}
