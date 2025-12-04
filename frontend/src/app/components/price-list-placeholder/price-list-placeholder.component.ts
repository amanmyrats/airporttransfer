import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, effect } from '@angular/core';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { MainLocationService } from '../../services/main-location.service';
import { PopularRouteService } from '../../admin/services/popular-route.service';
import { CarTypeService } from '../../services/car-type.service';
import { MainLocation } from '../../models/main-location.model';
import { PopularRoute } from '../../admin/models/popular-route.model';
import { CarType } from '../../models/car-type.model';
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../constants/language.contants';

type Translatable = Record<LanguageCode, string>;

interface RouteSummary {
  destination: string;
  price: number | null;
  currency: string;
  distance?: string;
  carTypeName?: string;
  carTypeCode?: string;
}

interface LocationSummary {
  code: string;
  location: MainLocation;
  routes: RouteSummary[];
}

@Component({
  selector: 'app-price-list-placeholder',
  imports: [CommonModule],
  templateUrl: './price-list-placeholder.component.html',
  styleUrl: './price-list-placeholder.component.scss',
})
export class PriceListPlaceholderComponent implements OnInit {
  @Input() langInput?: { code?: string };

  readonly navbarMenu = NAVBAR_MENU;
  private readonly fallbackLang: LanguageCode = SUPPORTED_LANGUAGE_CODES[0]!;

  locationSummaries: LocationSummary[] = [];

  readonly translations: Record<'heading' | 'intro' | 'viewMore' | 'priceLabel' | 'fallbackPrice', Translatable> = {
    heading: {
      en: 'Popular airport transfer prices',
      de: 'Beliebte Flughafentransfer-Preise',
      ru: 'Популярные цены на трансфер из аэропорта',
      tr: 'Popüler havalimanı transfer fiyatları',
    },
    intro: {
      en: 'Current guide prices for private airport transfers operated by Airport Transfer Hub across Turkey. Fares include meet-and-greet, flight tracking, and 24/7 customer care.',
      de: 'Aktuelle Richtpreise für private Flughafentransfers von Airport Transfer Hub in der Türkei. Die Tarife beinhalten Begrüßung, Flugüberwachung und 24/7 Kundenservice.',
      ru: 'Актуальные ориентировочные цены на частные трансферы из аэропортов по всей Турции от Airport Transfer Hub. Тарифы включают встречу, отслеживание рейса и круглосуточную поддержку.',
      tr: 'Airport Transfer Hub tarafından Türkiye genelinde sunulan özel havalimanı transferleri için güncel örnek fiyatlar. Ücretlere karşılama, uçuş takibi ve 7/24 destek dahildir.',
    },
    viewMore: {
      en: 'View complete price list',
      de: 'Komplette Preisliste ansehen',
      ru: 'Посмотреть полный прайс-лист',
      tr: 'Tüm fiyat listesini görüntüle',
    },
    priceLabel: {
      en: 'Price',
      de: 'Preis',
      ru: 'Цена',
      tr: 'Fiyat',
    },
    fallbackPrice: {
      en: 'Price on request',
      de: 'Preis auf Anfrage',
      ru: 'Цена по запросу',
      tr: 'Fiyat isteğe bağlı',
    },
  };

  constructor(
    private readonly mainLocationService: MainLocationService,
    private readonly popularRouteService: PopularRouteService,
    private readonly carTypeService: CarTypeService,
  ) {
    effect(() => {
      const routes = this.popularRouteService.popularRoutesSignal();
      this.locationSummaries = this.buildLocationSummaries(routes);
    });
  }

  ngOnInit(): void {
    if (!this.popularRouteService.popularRoutesSignal().length) {
      this.popularRouteService.updatePopularRoutesSignal();
    }
  }

  get langCode(): LanguageCode {
    const code = this.langInput?.code?.toLowerCase() as LanguageCode | undefined;
    if (!code || !SUPPORTED_LANGUAGE_CODES.includes(code)) {
      return this.fallbackLang;
    }
    return code;
  }

  localize(copy: Translatable): string {
    return copy[this.langCode] ?? copy[this.fallbackLang];
  }

  get pricePageUrl(): string {
    const slug =
      this.navbarMenu.prices?.slug?.[this.langCode] ??
      this.navbarMenu.prices?.slug?.[this.fallbackLang] ??
      'affordable-prices-for-24-7-private-airport-transfers-in-turkey';
    return `/${this.langCode}/${slug}/`;
  }

  getLocationName(location: MainLocation): string {
    const langKey = this.langCode as keyof MainLocation;
    const localized = (location as any)?.[langKey];
    if (typeof localized === 'string' && localized.trim()) {
      return localized;
    }
    return location.name ?? location.code ?? '';
  }

  trackLocation(index: number, summary: LocationSummary): string {
    return summary.code;
  }

  trackRoute(index: number, route: RouteSummary): string {
    return `${route.destination}-${route.carTypeCode ?? 'car'}-${route.price ?? 'na'}`;
  }

  private buildLocationSummaries(routes: PopularRoute[]): LocationSummary[] {
    if (!Array.isArray(routes) || !routes.length) {
      return [];
    }

    const carTypes = this.carTypeService.getCarTypes();
    const carTypeByCode = new Map<string, CarType>();
    carTypes.forEach((carType) => {
      if (carType.code) {
        carTypeByCode.set(carType.code, carType);
      }
    });

    const routesByLocation = new Map<string, PopularRoute[]>();
    routes.forEach((route) => {
      const locationCode = this.getRouteLocationCode(route);
      if (!locationCode) {
        return;
      }
      if (!routesByLocation.has(locationCode)) {
        routesByLocation.set(locationCode, []);
      }
      routesByLocation.get(locationCode)!.push(route);
    });

    return this.mainLocationService
      .getMainLocations()
      .filter((location) => location.code && routesByLocation.has(location.code))
      .map<LocationSummary>((location) => {
        const groupedRoutes = routesByLocation.get(location.code!) ?? [];

        const summaries: RouteSummary[] = groupedRoutes
          .filter((route) => !!route.destination)
          .sort((a, b) => {
            const aPrice = this.toNumeric(a.euro_price) ?? Number.POSITIVE_INFINITY;
            const bPrice = this.toNumeric(b.euro_price) ?? Number.POSITIVE_INFINITY;
            return aPrice - bPrice;
          })
          .map((route) => {
            const carType = route.car_type ? carTypeByCode.get(route.car_type) : undefined;
            const numericPrice = this.toNumeric(route.euro_price);
            return {
              destination: route.destination ?? '',
              price: numericPrice,
              currency: 'EUR',
              distance: route.distance ?? '',
              carTypeName: carType?.name ?? route.car_type ?? '',
              carTypeCode: route.car_type,
            };
          });

        return {
          code: location.code ?? '',
          location,
          routes: summaries,
        };
      })
      .filter((summary) => summary.routes.length > 0);
  }

  private getRouteLocationCode(route: PopularRoute): string | undefined {
    return (
      route.main_location ||
      route.airport ||
      route.airport_detail?.code ||
      route.airport_detail?.iata_code ||
      undefined
    );
  }

  private toNumeric(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }
}
