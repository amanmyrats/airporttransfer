import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterOutlet } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { LanguageService } from '../../services/language.service';
import { Meta, Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-booking',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    RouterOutlet,
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  bookingService = inject(BookingService);
  activeStep: number = 1;
  currentLanguage: any = { code: 'en', name: 'English', flag: 'flags/gb.svg' };

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    public languageService: LanguageService, 
    private title: Title, 
    private meta: Meta, 
    private readonly destroyRef: DestroyRef,
  ) { }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    const detectedLanguage = this.languageService.getLanguageByCode(languageCode);
    if (detectedLanguage) {
      this.currentLanguage = detectedLanguage;
      this.languageService.currentLang.set(detectedLanguage);
    } else {
      this.currentLanguage.code = languageCode;
    }

    this.setMetaTags(this.currentLanguage.code);

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.handleQueryParams(params);
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
        map(() => this.resolveActiveStep())
      )
      .subscribe((step) => {
        this.activeStep = step;
      });

    // Initialise step based on the current URL.
    this.activeStep = this.resolveActiveStep();
  }

  private handleQueryParams(params: Params): void {
    const requestedStep = this.getRequestedStep(params);

    if (requestedStep >= 2) {
      this.prefillStep1Data(params);
    }

    if (requestedStep >= 3) {
      this.prefillStep2Data(params);
    }

    this.navigateToStep(requestedStep, params);
  }

  private getRequestedStep(params: Params): number {
    const stepParam = params['step'];
    if (stepParam === '3') {
      return 3;
    }
    if (stepParam === '2') {
      return 2;
    }
    return 1;
  }

  private navigateToStep(step: number, params: Params): void {
    const currentChildPath = this.route.firstChild?.routeConfig?.path ?? '';

    switch (step) {
      case 3:
        if (currentChildPath !== 'completion') {
          this.router.navigate(['completion'], {
            relativeTo: this.route,
            queryParams: { ...params, step: 3 },
            queryParamsHandling: 'merge',
          });
        }
        break;
      case 2:
        if (currentChildPath !== 'car-selection') {
          this.router.navigate(['car-selection'], {
            relativeTo: this.route,
            queryParams: { ...params, step: 2 },
            queryParamsHandling: 'merge',
          });
        }
        break;
      default:
        if (currentChildPath) {
          this.router.navigate(['../'], {
            relativeTo: this.route.firstChild!,
            queryParams: { ...params, step: 1 },
            queryParamsHandling: 'merge',
          });
        }
        break;
    }
  }

  private resolveActiveStep(): number {
    const childPath = this.route.firstChild?.routeConfig?.path ?? '';
    if (childPath === 'completion') {
      return 3;
    }
    if (childPath === 'car-selection') {
      return 2;
    }
    return 1;
  }

  private prefillStep1Data(params: Params): void {
    if (!params) {
      return;
    }
    this.bookingService.applyStepOneParams(params);
    this.bookingService.applyDistanceParams(params);
  }

  private prefillStep2Data(params: Params): void {
    if (!params) {
      return;
    }
    this.bookingService.applyStepTwoParams(params);
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
