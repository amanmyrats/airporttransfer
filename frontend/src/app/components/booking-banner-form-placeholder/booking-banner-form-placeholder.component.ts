import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NAVBAR_MENU } from '../../constants/navbar-menu.constants';
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../constants/language.contants';

type Translatable = Record<LanguageCode, string>;

@Component({
  selector: 'app-booking-banner-form-placeholder',
  imports: [CommonModule],
  templateUrl: './booking-banner-form-placeholder.component.html',
  styleUrl: './booking-banner-form-placeholder.component.scss',
})
export class BookingBannerFormPlaceholderComponent {
  @Input() langInput?: { code?: string };

  readonly navbarMenu = NAVBAR_MENU;
  private readonly fallbackLang: LanguageCode = SUPPORTED_LANGUAGE_CODES[0]!;
  readonly loadingPlaceholder: Translatable = {
    en: 'Loading Google Places. Please wait…',
    de: 'Google Places wird geladen. Bitte warten …',
    ru: 'Загружаем Google Places. Пожалуйста, подождите…',
    tr: 'Google Places yükleniyor. Lütfen bekleyin…',
  };

  readonly translations: Record<
    | 'title'
    | 'lead'
    | 'pickupLabel'
    | 'dropoffLabel'
    | 'submit'
    | 'disclaimer',
    Translatable
  > = {
    title: {
      en: 'Book your private airport transfer',
      de: 'Buchen Sie Ihren privaten Flughafentransfer',
      ru: 'Забронируйте частный трансфер из аэропорта',
      tr: 'Özel havalimanı transferinizi rezerve edin',
    },
    lead: {
      en: 'Instant quote with meet-and-greet, flight tracking, and 24/7 support in Turkey.',
      de: 'Sofortiges Angebot mit Begrüßung, Flugverfolgung und 24/7 Support in der Türkei.',
      ru: 'Мгновенный расчет с встречей, отслеживанием рейса и круглосуточной поддержкой по Турции.',
      tr: 'Türkiye’de karşılama, uçuş takibi ve 7/24 destek ile anında fiyat alın.',
    },
    pickupLabel: {
      en: 'From',
      de: 'Abfahrt',
      ru: 'Откуда',
      tr: 'Nereden',
    },
    dropoffLabel: {
      en: 'To',
      de: 'Ziel',
      ru: 'Куда',
      tr: 'Nereye',
    },
    submit: {
      en: 'See transfer prices',
      de: 'Transferpreise anzeigen',
      ru: 'Показать цены на трансфер',
      tr: 'Transfer fiyatlarını gör',
    },
    disclaimer: {
      en: 'Airport Transfer Hub offers private Istanbul, Antalya, Alanya, Izmir, Bodrum, and Dalaman rides with licensed chauffeurs.',
      de: 'Airport Transfer Hub bietet private Fahrten in Istanbul, Antalya, Alanya, Izmir, Bodrum und Dalaman mit lizenzierten Chauffeuren.',
      ru: 'Airport Transfer Hub выполняет частные поездки в Стамбуле, Анталии, Аланье, Измире, Бодруме и Даламане с лицензированными водителями.',
      tr: 'Airport Transfer Hub, İstanbul, Antalya, Alanya, İzmir, Bodrum ve Dalaman’da lisanslı şoförlerle özel transferler sunar.',
    },
  };

  get langCode(): LanguageCode {
    const candidate = this.langInput?.code?.toLowerCase() as LanguageCode | undefined;
    if (!candidate || !SUPPORTED_LANGUAGE_CODES.includes(candidate)) {
      return this.fallbackLang;
    }
    return candidate;
  }

  localize(copy: Translatable): string {
    return copy[this.langCode] ?? copy[this.fallbackLang];
  }

  get formAction(): string {
    const slug =
      this.navbarMenu.bookNow?.slug?.[this.langCode] ??
      this.navbarMenu.bookNow?.slug?.[this.fallbackLang] ??
      'book-now-24-7-private-airport-transfer-in-turkey';
    return `/${this.langCode}/${slug}/`;
  }
}
