import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorState } from 'primeng/paginator';

import { FilterSearchComponent } from '../../../admin/components/filter-search/filter-search.component';
import { ReservationService } from '../../../admin/services/reservation.service';
import { LanguageService } from '../../../services/language.service';
import { environment as env } from '../../../../environments/environment';
import { MyReservation } from '../../../admin/models/reservation.model';
import { CommonService } from '../../../services/common.service';
import { SOCIAL_ICONS } from '../../../constants/social.constants';
import { SharedPaginatorComponent } from '../../../admin/components/shared-paginator/shared-paginator.component';
import { ACCOUNT_FALLBACK_LANGUAGE, AccountLanguageCode, normalizeAccountLanguage } from '../../constants/account-language.constants';

const ACCOUNT_RESERVATIONS_TRANSLATIONS = {
  header: {
    title: {
      en: 'My Reservations',
      de: 'Meine Reservierungen',
      ru: 'Мои бронирования',
      tr: 'Rezervasyonlarım',
    },
    resultsSingular: {
      en: '{count} reservation found',
      de: '{count} Reservierung gefunden',
      ru: 'Найдено {count} бронирование',
      tr: '{count} rezervasyon bulundu',
    },
    resultsPlural: {
      en: '{count} reservations found',
      de: '{count} Reservierungen gefunden',
      ru: 'Найдено {count} бронирований',
      tr: '{count} rezervasyon bulundu',
    },
    resultsEmpty: {
      en: 'Bookings you complete will be listed here.',
      de: 'Ihre abgeschlossenen Buchungen erscheinen hier.',
      ru: 'Оформленные бронирования появятся здесь.',
      tr: 'Tamamladığınız rezervasyonlar burada listelenecek.',
    },
  },
  actions: {
    refresh: {
      en: 'Refresh',
      de: 'Aktualisieren',
      ru: 'Обновить',
      tr: 'Yenile',
    },
    viewDetails: {
      en: 'View details',
      de: 'Details anzeigen',
      ru: 'Подробнее',
      tr: 'Detayları gör',
    },
    writeReview: {
      en: 'Write a review',
      de: 'Bewertung schreiben',
      ru: 'Оставить отзыв',
      tr: 'Yorum yaz',
    },
  },
  filters: {
    transferDate: {
      en: 'Transfer Date',
      de: 'Transferdatum',
      ru: 'Дата трансфера',
      tr: 'Transfer tarihi',
    },
    transferDateRange: {
      en: 'Transfer Date Range',
      de: 'Transferzeitraum',
      ru: 'Диапазон даты трансфера',
      tr: 'Transfer tarih aralığı',
    },
    reservationDateRange: {
      en: 'Reservation Date Range',
      de: 'Reservierungszeitraum',
      ru: 'Диапазон даты бронирования',
      tr: 'Rezervasyon tarih aralığı',
    },
  },
  ordering: {
    statusPriority: {
      en: 'Status (draft first)',
      de: 'Status (Entwurf zuerst)',
      ru: 'Статус (сначала черновики)',
      tr: 'Durum (taslaklar önce)',
    },
    newestReservation: {
      en: 'Newest reservation created',
      de: 'Neueste Reservierung erstellt',
      ru: 'Новейшее бронирование',
      tr: 'En yeni rezervasyon',
    },
    oldestReservation: {
      en: 'Oldest reservation created',
      de: 'Älteste Reservierung erstellt',
      ru: 'Самое раннее бронирование',
      tr: 'En eski rezervasyon',
    },
    earliestTransfer: {
      en: 'Earliest transfer date',
      de: 'Frühestes Transferdatum',
      ru: 'Ближайшая дата трансфера',
      tr: 'En erken transfer tarihi',
    },
    latestTransfer: {
      en: 'Latest transfer date',
      de: 'Spätestes Transferdatum',
      ru: 'Самая поздняя дата трансфера',
      tr: 'En geç transfer tarihi',
    },
    statusAZ: {
      en: 'Status A-Z',
      de: 'Status A-Z',
      ru: 'Статус A-Я',
      tr: 'Durum A-Z',
    },
    statusZA: {
      en: 'Status Z-A',
      de: 'Status Z-A',
      ru: 'Статус Я-A',
      tr: 'Durum Z-A',
    },
    paymentStatusAZ: {
      en: 'Payment status A-Z',
      de: 'Zahlungsstatus A-Z',
      ru: 'Статус оплаты A-Я',
      tr: 'Ödeme durumu A-Z',
    },
    paymentStatusZA: {
      en: 'Payment status Z-A',
      de: 'Zahlungsstatus Z-A',
      ru: 'Статус оплаты Я-A',
      tr: 'Ödeme durumu Z-A',
    },
  },
  statuses: {
    draft: {
      en: 'Draft',
      de: 'Entwurf',
      ru: 'Черновик',
      tr: 'Taslak',
    },
    awaiting_payment: {
      en: 'Awaiting payment',
      de: 'Wartet auf Zahlung',
      ru: 'Ожидает оплаты',
      tr: 'Ödeme bekleniyor',
    },
    confirmed: {
      en: 'Confirmed',
      de: 'Bestätigt',
      ru: 'Подтверждено',
      tr: 'Onaylandı',
    },
    completed: {
      en: 'Completed',
      de: 'Abgeschlossen',
      ru: 'Завершено',
      tr: 'Tamamlandı',
    },
    cancelled_by_user: {
      en: 'Cancelled by you',
      de: 'Von Ihnen storniert',
      ru: 'Отменено вами',
      tr: 'Sizin tarafınızdan iptal',
    },
    cancelled_by_operator: {
      en: 'Cancelled by operator',
      de: 'Vom Betreiber storniert',
      ru: 'Отменено оператором',
      tr: 'Operatör tarafından iptal',
    },
    no_show: {
      en: 'No show',
      de: 'Nicht erschienen',
      ru: 'Неявка',
      tr: 'Gelmedi',
    },
  },
  fields: {
    reservationLabel: {
      en: 'Reservation',
      de: 'Reservierung',
      ru: 'Бронирование',
      tr: 'Rezervasyon',
    },
    routeFallback: {
      en: 'Route not yet assigned',
      de: 'Route noch nicht zugewiesen',
      ru: 'Маршрут ещё не назначен',
      tr: 'Rota henüz atanmadı',
    },
    pickupFallback: {
      en: 'Pickup',
      de: 'Abholung',
      ru: 'Точка отправления',
      tr: 'Alış noktası',
    },
    destinationFallback: {
      en: 'Destination',
      de: 'Ziel',
      ru: 'Пункт назначения',
      tr: 'Varış noktası',
    },
    transfer: {
      en: 'Transfer',
      de: 'Transfer',
      ru: 'Трансфер',
      tr: 'Transfer',
    },
    flight: {
      en: 'Flight',
      de: 'Flug',
      ru: 'Рейс',
      tr: 'Uçuş',
    },
    passengers: {
      en: 'Passengers',
      de: 'Passagiere',
      ru: 'Пассажиры',
      tr: 'Yolcular',
    },
    contact: {
      en: 'Contact',
      de: 'Kontakt',
      ru: 'Контакты',
      tr: 'İletişim',
    },
    notes: {
      en: 'Notes',
      de: 'Notizen',
      ru: 'Заметки',
      tr: 'Notlar',
    },
    dateNotSet: {
      en: 'Date not set',
      de: 'Datum nicht festgelegt',
      ru: 'Дата не указана',
      tr: 'Tarih belirlenmedi',
    },
    passengersMissing: {
      en: 'Passengers not set',
      de: 'Passagiere nicht angegeben',
      ru: 'Пассажиры не указаны',
      tr: 'Yolcu bilgisi yok',
    },
  },
  passengerSummary: {
    adultSingular: {
      en: 'adult',
      de: 'Erwachsener',
      ru: 'взрослый',
      tr: 'yetişkin',
    },
    adultPlural: {
      en: 'adults',
      de: 'Erwachsene',
      ru: 'взрослых',
      tr: 'yetişkin',
    },
    childSingular: {
      en: 'child',
      de: 'Kind',
      ru: 'ребенок',
      tr: 'çocuk',
    },
    childPlural: {
      en: 'children',
      de: 'Kinder',
      ru: 'детей',
      tr: 'çocuk',
    },
  },
  contact: {
    whatsappLabel: {
      en: 'WhatsApp',
      de: 'WhatsApp',
      ru: 'WhatsApp',
      tr: 'WhatsApp',
    },
    emailLabel: {
      en: 'Email',
      de: 'E-Mail',
      ru: 'Email',
      tr: 'E-posta',
    },
    whatsappAria: {
      en: 'Contact us via WhatsApp about this reservation',
      de: 'Kontaktieren Sie uns per WhatsApp zu dieser Reservierung',
      ru: 'Свяжитесь с нами в WhatsApp по этому бронированию',
      tr: 'Bu rezervasyon hakkında WhatsApp üzerinden bize ulaşın',
    },
    emailAria: {
      en: 'Email support about this reservation',
      de: 'Schreiben Sie dem Support zu dieser Reservierung',
      ru: 'Напишите поддержке по этому бронированию',
      tr: 'Bu rezervasyon hakkında destek ekibine e-posta gönderin',
    },
  },
  support: {
    whatsappMessage: {
      en: 'Hello! I would like assistance with reservation {reservation}.',
      de: 'Hallo! Ich benötige Hilfe zu Reservierung {reservation}.',
      ru: 'Здравствуйте! Мне нужна помощь по бронированию {reservation}.',
      tr: 'Merhaba! {reservation} rezervasyonu için yardıma ihtiyacım var.',
    },
    emailSubject: {
      en: 'Reservation {reservation} assistance',
      de: 'Hilfe zu Reservierung {reservation}',
      ru: 'Помощь по бронированию {reservation}',
      tr: '{reservation} rezervasyonu desteği',
    },
    emailBody: {
      en: 'Hello AirportTransfer team,\n\nI need help with my reservation.\n\nThank you.',
      de: 'Hallo AirportTransfer-Team,\n\nich benötige Hilfe zu meiner Reservierung.\n\nVielen Dank.',
      ru: 'Здравствуйте, команда AirportTransfer,\n\nмне нужна помощь с моим бронированием.\n\nСпасибо.',
      tr: 'Merhaba AirportTransfer ekibi,\n\nrezervasyonum için yardıma ihtiyacım var.\n\nTeşekkürler.',
    },
  },
  empty: {
    title: {
      en: 'No reservations yet',
      de: 'Noch keine Reservierungen',
      ru: 'Пока нет бронирований',
      tr: 'Henüz rezervasyon yok',
    },
    body: {
      en: 'Once you book a transfer, it will appear in this list.',
      de: 'Sobald Sie einen Transfer buchen, erscheint er hier.',
      ru: 'Как только вы оформите трансфер, он появится в этом списке.',
      tr: 'Bir transfer rezervasyonu yaptığınızda burada göreceksiniz.',
    },
  },
} as const;

type ReservationStatusKey = keyof typeof ACCOUNT_RESERVATIONS_TRANSLATIONS.statuses;
type ReservationOrderingKey = keyof typeof ACCOUNT_RESERVATIONS_TRANSLATIONS.ordering;

interface AccountReservationsCopy {
  header: {
    title: string;
    resultsSingular: string;
    resultsPlural: string;
    resultsEmpty: string;
  };
  actions: {
    refresh: string;
    viewDetails: string;
    writeReview: string;
  };
  filters: {
    transferDate: string;
    transferDateRange: string;
    reservationDateRange: string;
  };
  ordering: Record<ReservationOrderingKey, string>;
  statuses: Record<ReservationStatusKey, string>;
  fields: {
    reservationLabel: string;
    routeFallback: string;
    pickupFallback: string;
    destinationFallback: string;
    transfer: string;
    flight: string;
    passengers: string;
    contact: string;
    notes: string;
    dateNotSet: string;
    passengersMissing: string;
  };
  passengerSummary: {
    adultSingular: string;
    adultPlural: string;
    childSingular: string;
    childPlural: string;
  };
  contact: {
    whatsappLabel: string;
    emailLabel: string;
    whatsappAria: string;
    emailAria: string;
  };
  support: {
    whatsappMessage: string;
    emailSubject: string;
    emailBody: string;
  };
  empty: {
    title: string;
    body: string;
  };
}

@Component({
  selector: 'app-my-reservations-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    FilterSearchComponent,
    SharedPaginatorComponent,
  ],
  providers: [DatePipe],
  templateUrl: './my-reservations-list.component.html',
  styleUrl: './my-reservations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReservationsListComponent {
  @ViewChild(FilterSearchComponent) filterSearch?: FilterSearchComponent;

  private readonly reservationService = inject(ReservationService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly datePipe = inject(DatePipe);
  private readonly commonService = inject(CommonService);

  private readonly whatsappConfig = SOCIAL_ICONS.whatsapp ?? {};
  private readonly phoneConfig = SOCIAL_ICONS.phone ?? {};
  private readonly emailConfig = SOCIAL_ICONS.email ?? {};

  private readonly defaultPageSize = env.pagination.defaultPageSize;
  protected copy: AccountReservationsCopy;
  private statusLabels: Record<string, string> = {};
  private orderingOptions: { label: string; value: string }[] = [];

  readonly reservations = this.reservationService.myReservations;
  readonly loading = this.reservationService.myReservationsLoading;
  readonly meta = this.reservationService.myReservationsMeta;

  private readonly pageSizeState = signal(this.defaultPageSize);
  private readonly pageIndexState = signal(0);
  readonly defaultOrdering = 'status_priority';
  readonly detailedFilterKeys = ['transfer_date', 'date_variation', 'reservation_date_variation', 'ordering'];
  private readonly queryState = signal<Record<string, string | number | string[]>>({
    page: 1,
    page_size: this.defaultPageSize,
    ordering: this.defaultOrdering,
  });

  readonly pageSize = computed(() => this.pageSizeState());
  readonly pageIndex = computed(() => this.pageIndexState());
  readonly firstIndex = computed(() => this.pageIndex() * this.pageSize());
  readonly totalRecords = computed(() => this.meta().count ?? 0);
  readonly hasResults = computed(() => this.reservations().length > 0);
  readonly isEmpty = computed(() => !this.loading() && !this.hasResults());
  readonly currentLang = computed(() => this.languageService.extractLangFromUrl(this.router.url));
  readonly whatsappDisplay =
    this.phoneConfig.formatted ?? this.whatsappConfig.phone ?? this.phoneConfig.number ?? '+90 554 139 8307';
  readonly supportEmail =
    this.emailConfig.support ?? this.emailConfig.reservation ?? this.emailConfig.info ?? 'support@airporttransferhub.com';

  private readonly statusSeverities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> =
    {
      draft: 'secondary',
      awaiting_payment: 'warn',
      confirmed: 'success',
      completed: 'info',
      cancelled_by_user: 'danger',
      cancelled_by_operator: 'danger',
      no_show: 'warn',
    };

  constructor() {
    this.copy = this.buildCopy(this.detectLanguage());
    this.statusLabels = { ...this.copy.statuses };
    this.orderingOptions = this.buildOrderingOptions();
  }

  get reservationOrderingOptions(): { label: string; value: string }[] {
    return this.orderingOptions;
  }

  get statusOptions(): { value: string; label: string }[] {
    return Object.entries(this.statusLabels).map(([value, label]) => ({ value, label }));
  }

  onSearch(queryString: string = ''): void {
    const parsedParams = this.commonService.parseQueryParams(queryString);
    const nextParams: Record<string, string | number | string[]> = { ...parsedParams };
    const rawPage = parsedParams['page'];
    const rawPageSize = parsedParams['page_size'];
    const rawOrdering = parsedParams['ordering'];
    const page = Number(Array.isArray(rawPage) ? rawPage[rawPage.length - 1] : rawPage ?? 1);
    const pageSizeCandidate = Number(
      Array.isArray(rawPageSize) ? rawPageSize[rawPageSize.length - 1] : rawPageSize ?? this.pageSize(),
    );
    const pageSize = pageSizeCandidate > 0 ? pageSizeCandidate : this.defaultPageSize;
    const orderingCandidate = Array.isArray(rawOrdering)
      ? rawOrdering[rawOrdering.length - 1]
      : rawOrdering;
    const ordering = orderingCandidate && String(orderingCandidate).length > 0
      ? String(orderingCandidate)
      : this.defaultOrdering;
    const first = Math.max(0, (page - 1) * pageSize);

    this.pageIndexState.set(Math.max(0, page - 1));
    this.pageSizeState.set(pageSize);
    nextParams['page'] = page;
    nextParams['page_size'] = pageSize;
    nextParams['ordering'] = ordering;
    this.queryState.set(nextParams);

    if (this.filterSearch) {
      this.filterSearch.first = first;
      this.filterSearch.rows = pageSize;
      if (this.filterSearch.event) {
        this.filterSearch.event.first = first;
        this.filterSearch.event.rows = pageSize;
      }
    }

    this.fetchReservations(this.queryState());
  }

  onStatusesRequested(): void {
    // Options are provided via binding; no additional fetch required.
  }

  onPageChange(event: PaginatorState): void {
    const rows = event.rows && event.rows > 0 ? event.rows : this.pageSize();
    const first = event.first ?? 0;
    const page = rows > 0 ? Math.floor(first / rows) + 1 : 1;

    const currentParams = { ...this.queryState() };
    currentParams['page'] = page;
    currentParams['page_size'] = rows;

    this.pageIndexState.set(Math.max(0, page - 1));
    this.pageSizeState.set(rows);
    this.queryState.set(currentParams);

    if (this.filterSearch) {
      this.filterSearch.first = first;
      this.filterSearch.rows = rows;
      this.filterSearch.totalRecords = this.totalRecords();
      if (this.filterSearch.event) {
        this.filterSearch.event.first = first;
        this.filterSearch.event.rows = rows;
      }
      this.filterSearch.updateActiveUrlQueryParams(this.commonService.toQueryString(currentParams));
    }

    this.fetchReservations(currentParams);
  }

  refresh(): void {
    if (this.loading()) {
      return;
    }
    this.fetchReservations({ ...this.queryState() });
  }

  detailLink(reservation: MyReservation): any[] {
    return this.languageService.commandsWithLang(
      this.currentLang(),
      'account',
      'reservations',
      String(reservation.id),
    );
  }

  resultsLabel(count: number): string {
    const template = count === 1 ? this.copy.header.resultsSingular : this.copy.header.resultsPlural;
    return template.replace('{count}', String(count));
  }

  reservationHeading(reservation: MyReservation): string {
    const identifier = reservation.number ?? `#${reservation.id}`;
    return `${this.copy.fields.reservationLabel} ${identifier}`;
  }

  tripTitle(reservation: MyReservation): string {
    const hasRoute =
      !!(reservation.pickup_short || reservation.pickup_full || reservation.dest_short || reservation.dest_full);
    if (!hasRoute) {
      return this.copy.fields.routeFallback;
    }
    const pickup = reservation.pickup_short || reservation.pickup_full || this.copy.fields.pickupFallback;
    const destination = reservation.dest_short || reservation.dest_full || this.copy.fields.destinationFallback;
    return `${pickup} → ${destination}`;
  }

  statusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return this.statusSeverities[status] ?? 'secondary';
  }

  transferDateLabel(reservation: MyReservation): string {
    const date = this.parseDate(reservation.transfer_date);
    const time = reservation.transfer_time?.trim();
    const dateLabel = date ? this.datePipe.transform(date, 'mediumDate') : null;
    if (!dateLabel && !time) {
      return this.copy.fields.dateNotSet;
    }
    if (dateLabel && time) {
      return `${dateLabel} • ${time}`;
    }
    return dateLabel ?? time ?? this.copy.fields.dateNotSet;
  }

  passengerSummary(reservation: MyReservation): string {
    const adults = reservation.passenger_count ?? 0;
    const children = reservation.passenger_count_child ?? 0;
    const segments: string[] = [];
    if (adults > 0) {
      const label = adults === 1 ? this.copy.passengerSummary.adultSingular : this.copy.passengerSummary.adultPlural;
      segments.push(`${adults} ${label}`);
    }
    if (children > 0) {
      const label = children === 1 ? this.copy.passengerSummary.childSingular : this.copy.passengerSummary.childPlural;
      segments.push(`${children} ${label}`);
    }
    return segments.length > 0 ? segments.join(', ') : this.copy.fields.passengersMissing;
  }

  whatsappHref(reservation: MyReservation): string {
    const baseUrl =
      this.whatsappConfig.url ??
      (this.whatsappConfig.phone ? `https://wa.me/${String(this.whatsappConfig.phone).replace(/\D/g, '')}` : 'https://wa.me/');
    const separator = baseUrl.includes('?') ? '&' : '?';
    const identifier = reservation.number ?? reservation.id;
    const messageTemplate = this.copy.support.whatsappMessage.replace('{reservation}', String(identifier));
    const message = encodeURIComponent(messageTemplate);
    return `${baseUrl}${separator}text=${message}`;
  }

  emailHref(reservation: MyReservation): string {
    const identifier = reservation.number ?? reservation.id;
    const subject = encodeURIComponent(
      this.copy.support.emailSubject.replace('{reservation}', String(identifier)),
    );
    const body = encodeURIComponent(this.copy.support.emailBody);
    return `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
  }

  trackByReservationId(_: number, reservation: MyReservation): number {
    return reservation.id;
  }

  canWriteReview(reservation: MyReservation): boolean {
    return reservation.can_review && !reservation.has_review;
  }

  reviewLink(reservation: MyReservation): any[] {
    return this.languageService.commandsWithLang(
      this.currentLang(),
      'account',
      'reviews',
      'new',
      String(reservation.id),
    );
  }

  private fetchReservations(params: Record<string, string | number | string[]>): void {
    this.reservationService.listMine(params).subscribe({
      error: error => console.error('Failed to load reservations', error),
    });
  }

  private parseDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private detectLanguage(): AccountLanguageCode {
    const urlLang = this.languageService.extractLangFromUrl(this.router.url);
    const serviceLang = this.languageService.currentLang?.()?.code ?? null;
    return normalizeAccountLanguage(urlLang ?? serviceLang ?? null);
  }

  private buildOrderingOptions(): { label: string; value: string }[] {
    const ordering = this.copy.ordering;
    return [
      { label: ordering.statusPriority, value: 'status_priority' },
      { label: ordering.newestReservation, value: '-reservation_date' },
      { label: ordering.oldestReservation, value: 'reservation_date' },
      { label: ordering.earliestTransfer, value: 'transfer_date' },
      { label: ordering.latestTransfer, value: '-transfer_date' },
      { label: ordering.statusAZ, value: 'status' },
      { label: ordering.statusZA, value: '-status' },
      { label: ordering.paymentStatusAZ, value: 'payment_status' },
      { label: ordering.paymentStatusZA, value: '-payment_status' },
    ];
  }

  private buildCopy(lang: AccountLanguageCode): AccountReservationsCopy {
    const fallback = ACCOUNT_FALLBACK_LANGUAGE;
    const pick = (entry: Record<AccountLanguageCode, string>): string =>
      entry[lang] ?? entry[fallback];
    const pickMap = (entries: Record<string, Record<AccountLanguageCode, string>>): Record<string, string> =>
      Object.fromEntries(
        Object.entries(entries).map(([key, value]) => [key, value[lang] ?? value[fallback]]),
      );

    return {
      header: {
        title: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.header.title),
        resultsSingular: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.header.resultsSingular),
        resultsPlural: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.header.resultsPlural),
        resultsEmpty: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.header.resultsEmpty),
      },
      actions: {
        refresh: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.actions.refresh),
        viewDetails: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.actions.viewDetails),
        writeReview: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.actions.writeReview),
      },
      filters: {
        transferDate: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.filters.transferDate),
        transferDateRange: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.filters.transferDateRange),
        reservationDateRange: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.filters.reservationDateRange),
      },
      ordering: pickMap(ACCOUNT_RESERVATIONS_TRANSLATIONS.ordering) as Record<ReservationOrderingKey, string>,
      statuses: pickMap(ACCOUNT_RESERVATIONS_TRANSLATIONS.statuses) as Record<ReservationStatusKey, string>,
      fields: {
        reservationLabel: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.reservationLabel),
        routeFallback: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.routeFallback),
        pickupFallback: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.pickupFallback),
        destinationFallback: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.destinationFallback),
        transfer: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.transfer),
        flight: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.flight),
        passengers: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.passengers),
        contact: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.contact),
        notes: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.notes),
        dateNotSet: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.dateNotSet),
        passengersMissing: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.fields.passengersMissing),
      },
      passengerSummary: {
        adultSingular: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.passengerSummary.adultSingular),
        adultPlural: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.passengerSummary.adultPlural),
        childSingular: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.passengerSummary.childSingular),
        childPlural: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.passengerSummary.childPlural),
      },
      contact: {
        whatsappLabel: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.contact.whatsappLabel),
        emailLabel: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.contact.emailLabel),
        whatsappAria: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.contact.whatsappAria),
        emailAria: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.contact.emailAria),
      },
      support: {
        whatsappMessage: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.support.whatsappMessage),
        emailSubject: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.support.emailSubject),
        emailBody: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.support.emailBody),
      },
      empty: {
        title: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.empty.title),
        body: pick(ACCOUNT_RESERVATIONS_TRANSLATIONS.empty.body),
      },
    };
  }
}
