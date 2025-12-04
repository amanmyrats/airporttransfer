import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { ReservationService } from '../../../admin/services/reservation.service';
import { DuePaymentReservation, MyReservation } from '../../../admin/models/reservation.model';
import { LanguageService } from '../../../services/language.service';
import { formatMinor } from '../../../payment/utils/money.util';
import { ACCOUNT_FALLBACK_LANGUAGE, AccountLanguageCode, normalizeAccountLanguage } from '../../constants/account-language.constants';

const ACCOUNT_DASHBOARD_TRANSLATIONS = {
  header: {
    welcomeBack: {
      en: 'Welcome back',
      de: 'Willkommen zurück',
      ru: 'С возвращением',
      tr: 'Tekrar hoş geldiniz',
    },
  },
  cards: {
    duePayments: {
      en: 'Pending or due payments',
      de: 'Ausstehende oder fällige Zahlungen',
      ru: 'Ожидающие или просроченные платежи',
      tr: 'Bekleyen veya vadesi gelen ödemeler',
    },
    passengerDetails: {
      en: 'Passenger details required',
      de: 'Passagierangaben erforderlich',
      ru: 'Требуются данные пассажиров',
      tr: 'Yolcu bilgileri gerekli',
    },
    pendingConfirmation: {
      en: 'Pending confirmation',
      de: 'Bestätigung ausstehend',
      ru: 'Ожидают подтверждения',
      tr: 'Onay bekleyenler',
    },
    upcoming: {
      en: 'Upcoming reservations',
      de: 'Bevorstehende Reservierungen',
      ru: 'Предстоящие бронирования',
      tr: 'Yaklaşan rezervasyonlar',
    },
    profileCompleteness: {
      en: 'Profile completeness',
      de: 'Profilvollständigkeit',
      ru: 'Заполненность профиля',
      tr: 'Profil tamamlanma durumu',
    },
  },
  placeholders: {
    duePaymentsLoading: {
      en: 'Loading pending payments…',
      de: 'Ausstehende Zahlungen werden geladen…',
      ru: 'Загрузка ожидающих платежей…',
      tr: 'Bekleyen ödemeler yükleniyor…',
    },
    passengerDetailsLoading: {
      en: 'Checking passenger details…',
      de: 'Passagierangaben werden geprüft…',
      ru: 'Проверяем данные пассажиров…',
      tr: 'Yolcu bilgileri kontrol ediliyor…',
    },
    pendingLoading: {
      en: 'Loading pending confirmations…',
      de: 'Ausstehende Bestätigungen werden geladen…',
      ru: 'Загрузка заявок в ожидании…',
      tr: 'Bekleyen onaylar yükleniyor…',
    },
    upcomingLoading: {
      en: 'Loading upcoming reservations…',
      de: 'Bevorstehende Reservierungen werden geladen…',
      ru: 'Загрузка предстоящих бронирований…',
      tr: 'Yaklaşan rezervasyonlar yükleniyor…',
    },
    passengerNamesMissing: {
      en: 'Passenger names missing',
      de: 'Passagiernamen fehlen',
      ru: 'Имена пассажиров отсутствуют',
      tr: 'Yolcu isimleri eksik',
    },
    noUpcoming: {
      en: 'No upcoming reservations yet. Book your next transfer!',
      de: 'Noch keine bevorstehenden Reservierungen. Buchen Sie Ihren nächsten Transfer!',
      ru: 'Нет предстоящих бронирований. Забронируйте следующий трансфер!',
      tr: 'Yaklaşan rezervasyon yok. Bir sonraki transferinizi ayırtın!',
    },
  },
  labels: {
    duePrefix: {
      en: 'Due',
      de: 'Fällig',
      ru: 'К оплате',
      tr: 'Ödenecek',
    },
    marketingOptIn: {
      en: 'Marketing opt-in',
      de: 'Marketing-Einwilligung',
      ru: 'Согласие на маркетинг',
      tr: 'Pazarlama izni',
    },
    yes: {
      en: 'Yes',
      de: 'Ja',
      ru: 'Да',
      tr: 'Evet',
    },
    no: {
      en: 'No',
      de: 'Nein',
      ru: 'Нет',
      tr: 'Hayır',
    },
  },
  fields: {
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
    dateNotSet: {
      en: 'Date not set',
      de: 'Datum nicht festgelegt',
      ru: 'Дата не указана',
      tr: 'Tarih belirlenmedi',
    },
    statusNotSet: {
      en: 'Status not set',
      de: 'Status nicht festgelegt',
      ru: 'Статус не указан',
      tr: 'Durum belirtilmedi',
    },
    paymentStatusNotSet: {
      en: 'Payment status not set',
      de: 'Zahlungsstatus nicht festgelegt',
      ru: 'Статус оплаты не указан',
      tr: 'Ödeme durumu belirtilmedi',
    },
  },
  statuses: {
    draft: {
      en: 'Pending confirmation',
      de: 'Bestätigung ausstehend',
      ru: 'Ожидает подтверждения',
      tr: 'Onay bekliyor',
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
  paymentStatuses: {
    unpaid: {
      en: 'Unpaid',
      de: 'Unbezahlt',
      ru: 'Не оплачено',
      tr: 'Ödenmedi',
    },
    paid: {
      en: 'Paid',
      de: 'Bezahlt',
      ru: 'Оплачено',
      tr: 'Ödendi',
    },
    partial_refund: {
      en: 'Partially refunded',
      de: 'Teilweise erstattet',
      ru: 'Частично возвращено',
      tr: 'Kısmen iade edildi',
    },
    refunded: {
      en: 'Refunded',
      de: 'Erstattet',
      ru: 'Возвращено',
      tr: 'İade edildi',
    },
  },
} as const;

type DashboardStatusKey = keyof typeof ACCOUNT_DASHBOARD_TRANSLATIONS.statuses;
type DashboardPaymentStatusKey = keyof typeof ACCOUNT_DASHBOARD_TRANSLATIONS.paymentStatuses;

interface AccountDashboardCopy {
  header: {
    welcomeBack: string;
  };
  cards: {
    duePayments: string;
    passengerDetails: string;
    pendingConfirmation: string;
    upcoming: string;
    profileCompleteness: string;
  };
  placeholders: {
    duePaymentsLoading: string;
    passengerDetailsLoading: string;
    pendingLoading: string;
    upcomingLoading: string;
    passengerNamesMissing: string;
    noUpcoming: string;
  };
  labels: {
    duePrefix: string;
    marketingOptIn: string;
    yes: string;
    no: string;
  };
  fields: {
    routeFallback: string;
    pickupFallback: string;
    destinationFallback: string;
    dateNotSet: string;
    statusNotSet: string;
    paymentStatusNotSet: string;
  };
  statuses: Record<DashboardStatusKey, string>;
  paymentStatuses: Record<DashboardPaymentStatusKey, string>;
}

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './account-dashboard.component.html',
  styleUrl: './account-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class AccountDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly reservationService = inject(ReservationService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  private readonly upcomingStatusAllowList = new Set<string>(['confirmed', 'awaiting_payment']);
  private readonly duePaymentsLimit = 3;
  private readonly passengerReminderLimit = 3;
  private readonly upcomingLimit = 3;
  private readonly pendingLimit = 3;
  private readonly maxLocationLabelLength = 30;

  readonly user = this.authService.user;
  readonly duePaymentReservations = signal<DuePaymentReservation[]>([]);
  readonly passengerReminderReservations = signal<MyReservation[]>([]);
  readonly upcomingReservations = signal<MyReservation[]>([]);
  readonly pendingConfirmationReservations = signal<MyReservation[]>([]);
  readonly duePaymentsLoading = signal(false);
  readonly passengerReminderLoading = signal(false);
  readonly upcomingLoading = signal(false);
  readonly pendingLoading = signal(false);
  readonly currentLang = computed(() => this.languageService.extractLangFromUrl(this.router.url));
  private cardNavigationKey: string | null = null;

  protected copy: AccountDashboardCopy;
  private statusLabels: Record<string, string>;
  private paymentStatusLabels: Record<string, string>;

  constructor() {
    const lang = this.detectLanguage();
    this.copy = this.buildCopy(lang);
    this.statusLabels = { ...this.copy.statuses };
    this.paymentStatusLabels = { ...this.copy.paymentStatuses };
  }

  ngOnInit(): void {
    this.loadDuePaymentReservations();
    this.loadPassengerReminderReservations();
    this.loadUpcomingReservations();
    this.loadPendingConfirmationReservations();
  }

  statusLabel(status: string | null | undefined): string {
    if (!status) {
      return this.copy.fields.statusNotSet;
    }
    const normalized = status.toLowerCase();
    return this.statusLabels[normalized] ?? normalized;
  }

  tripTitle(reservation: Pick<MyReservation, 'pickup_short' | 'pickup_full' | 'dest_short' | 'dest_full'>): string {
    const hasRoute =
      !!(reservation.pickup_short || reservation.pickup_full || reservation.dest_short || reservation.dest_full);
    if (!hasRoute) {
      return this.copy.fields.routeFallback;
    }
    const pickup = this.truncate(
      reservation.pickup_short || reservation.pickup_full || this.copy.fields.pickupFallback,
      this.maxLocationLabelLength,
    );
    const destination = this.truncate(
      reservation.dest_short || reservation.dest_full || this.copy.fields.destinationFallback,
      this.maxLocationLabelLength,
    );
    return `${pickup} → ${destination}`;
  }

  transferDateLabel(reservation: Pick<MyReservation, 'transfer_date' | 'transfer_time'>): string {
    const date = this.parseDate(reservation.transfer_date);
    const time = (reservation.transfer_time ?? '').trim();
    const dateLabel = date ? this.datePipe.transform(date, 'mediumDate') : null;
    if (!dateLabel && !time) {
      return this.copy.fields.dateNotSet;
    }
    if (dateLabel && time) {
      return `${dateLabel} • ${time}`;
    }
    return dateLabel ?? time ?? this.copy.fields.dateNotSet;
  }

  trackByReservationId(_: number, reservation: { id: number }): number {
    return reservation.id;
  }

  reservationLink(reservation: Pick<MyReservation, 'id'>): any[] {
    return this.languageService.commandsWithLang(
      this.currentLang(),
      'account',
      'reservations',
      String(reservation.id),
    );
  }

  checkoutLink(reservation: Pick<MyReservation, 'number'> & Pick<MyReservation, 'id'>): any[] {
    const bookingRef = (reservation.number ?? '').trim();
    if (bookingRef.length > 0) {
      return this.languageService.commandsWithLang(this.currentLang(), 'checkout', bookingRef);
    }
    return this.reservationLink(reservation);
  }

  openCheckoutReservation(reservation: DuePaymentReservation, event?: Event): void {
    const identifier = reservation.id ?? reservation.number ?? reservation.due_currency;
    this.navigateWithCardLoading(this.checkoutLink(reservation), event, 'checkout', identifier);
  }

  openAccountReservation(reservation: MyReservation, event?: Event, focusPassengers = false): void {
    const commands = this.reservationLink(reservation);
    const queryParams = focusPassengers ? { focus: 'passengers' } : undefined;
    this.navigateWithCardLoading(commands, event, 'reservation', reservation.id, queryParams);
  }

  paymentStatusLabel(status: string | null | undefined): string {
    if (!status) {
      return this.copy.fields.paymentStatusNotSet;
    }
    const normalized = status.toLowerCase();
    return this.paymentStatusLabels[normalized] ?? normalized;
  }

  dueAmountLabel(reservation: DuePaymentReservation): string | null {
    const dueMinor = reservation.due_minor;
    const currency = (reservation.due_currency ?? '').trim().toUpperCase();
    if (typeof dueMinor !== 'number' || !currency) {
      return null;
    }
    try {
      return formatMinor(dueMinor, currency);
    } catch (error) {
      const fallback = dueMinor / 100;
      return `${fallback.toFixed(2)} ${currency}`;
    }
  }

  private loadDuePaymentReservations(): void {
    if (this.duePaymentsLoading()) {
      return;
    }
    this.duePaymentsLoading.set(true);
    this.reservationService
      .listMyDuePayments(this.duePaymentsLimit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reservations => {
          this.duePaymentReservations.set(reservations ?? []);
          this.duePaymentsLoading.set(false);
        },
        error: error => {
          console.error('Failed to load due payment reservations', error);
          this.duePaymentReservations.set([]);
          this.duePaymentsLoading.set(false);
        },
      });
  }

  private loadPassengerReminderReservations(): void {
    if (this.passengerReminderLoading()) {
      return;
    }
    this.passengerReminderLoading.set(true);
    this.reservationService
      .listMyMissingPassengerReservations(this.passengerReminderLimit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reservations => {
          this.passengerReminderReservations.set(reservations ?? []);
          this.passengerReminderLoading.set(false);
        },
        error: error => {
          console.error('Failed to load passenger reminder reservations', error);
          this.passengerReminderReservations.set([]);
          this.passengerReminderLoading.set(false);
        },
      });
  }

  private loadUpcomingReservations(): void {
    if (this.upcomingLoading()) {
      return;
    }
    this.upcomingLoading.set(true);
    const params: Record<string, unknown> = {
      transfer_date_time_from: new Date().toISOString(),
      ordering: 'transfer_date,transfer_time',
      page_size: this.upcomingLimit * 3,
    };
    this.reservationService
      .queryMine(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const items = (response.results ?? [])
            .filter(reservation => this.shouldIncludeInUpcoming(reservation))
            .slice(0, this.upcomingLimit);
          this.upcomingReservations.set(items);
          this.upcomingLoading.set(false);
        },
        error: error => {
          console.error('Failed to load upcoming reservations', error);
          this.upcomingReservations.set([]);
          this.upcomingLoading.set(false);
        },
      });
  }

  private loadPendingConfirmationReservations(): void {
    if (this.pendingLoading()) {
      return;
    }
    this.pendingLoading.set(true);
    const params: Record<string, unknown> = {
      status: 'draft',
      ordering: '-created_at',
      page_size: this.pendingLimit,
    };
    this.reservationService
      .queryMine(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const items = (response.results ?? []).slice(0, this.pendingLimit);
          this.pendingConfirmationReservations.set(items);
          this.pendingLoading.set(false);
        },
        error: error => {
          console.error('Failed to load pending confirmation reservations', error);
          this.pendingConfirmationReservations.set([]);
          this.pendingLoading.set(false);
        },
      });
  }

  private shouldIncludeInUpcoming(reservation: MyReservation): boolean {
    const status = (reservation.status ?? '').toLowerCase();
    if (!status || !this.upcomingStatusAllowList.has(status)) {
      return false;
    }
    return this.isReservationInFuture(reservation);
  }

  private isReservationInFuture(reservation: MyReservation): boolean {
    const date = reservation.transfer_date;
    if (!date) {
      return false;
    }
    const dateTime = this.parseDateTime(date, reservation.transfer_time);
    if (!dateTime) {
      return false;
    }
    return dateTime.getTime() >= Date.now();
  }

  private parseDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private parseDateTime(date: string | null, time: string | null): Date | null {
    if (!date) {
      return null;
    }
    const normalizedTime = (time ?? '00:00').trim() || '00:00';
    const candidate = new Date(`${date}T${normalizedTime}`);
    if (!Number.isNaN(candidate.getTime())) {
      return candidate;
    }
    const fallback = new Date(date);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  private truncate(value: string | null | undefined, maxLength: number): string {
    const raw = (value ?? '').trim();
    if (!raw || raw.length <= maxLength) {
      return raw;
    }
    return `${raw.slice(0, maxLength - 1)}…`;
  }

  private detectLanguage(): AccountLanguageCode {
    const urlLang = this.languageService.extractLangFromUrl(this.router.url);
    const serviceLang = this.languageService.currentLang?.()?.code ?? null;
    return normalizeAccountLanguage(urlLang ?? serviceLang ?? null);
  }

  private buildCopy(lang: AccountLanguageCode): AccountDashboardCopy {
    const fallback = ACCOUNT_FALLBACK_LANGUAGE;
    const pick = (entry: Record<AccountLanguageCode, string>): string => entry[lang] ?? entry[fallback];
    const pickMap = <T extends Record<string, Record<AccountLanguageCode, string>>>(entries: T): Record<keyof T, string> =>
      Object.fromEntries(
        Object.entries(entries).map(([key, value]) => [key, pick(value as Record<AccountLanguageCode, string>)]),
      ) as Record<keyof T, string>;

    return {
      header: {
        welcomeBack: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.header.welcomeBack),
      },
      cards: {
        duePayments: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.cards.duePayments),
        passengerDetails: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.cards.passengerDetails),
        pendingConfirmation: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.cards.pendingConfirmation),
        upcoming: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.cards.upcoming),
        profileCompleteness: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.cards.profileCompleteness),
      },
      placeholders: {
        duePaymentsLoading: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.placeholders.duePaymentsLoading),
        passengerDetailsLoading: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.placeholders.passengerDetailsLoading),
        pendingLoading: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.placeholders.pendingLoading),
        upcomingLoading: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.placeholders.upcomingLoading),
        passengerNamesMissing: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.placeholders.passengerNamesMissing),
        noUpcoming: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.placeholders.noUpcoming),
      },
      labels: {
        duePrefix: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.labels.duePrefix),
        marketingOptIn: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.labels.marketingOptIn),
        yes: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.labels.yes),
        no: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.labels.no),
      },
      fields: {
        routeFallback: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.fields.routeFallback),
        pickupFallback: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.fields.pickupFallback),
        destinationFallback: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.fields.destinationFallback),
        dateNotSet: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.fields.dateNotSet),
        statusNotSet: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.fields.statusNotSet),
        paymentStatusNotSet: pick(ACCOUNT_DASHBOARD_TRANSLATIONS.fields.paymentStatusNotSet),
      },
      statuses: pickMap(ACCOUNT_DASHBOARD_TRANSLATIONS.statuses) as Record<DashboardStatusKey, string>,
      paymentStatuses: pickMap(ACCOUNT_DASHBOARD_TRANSLATIONS.paymentStatuses) as Record<DashboardPaymentStatusKey, string>,
    };
  }

  isCardLoading(section: string, id: string | number | null | undefined): boolean {
    const key = this.buildLoadingKey(section, id);
    return Boolean(key && key === this.cardNavigationKey);
  }

  private navigateWithCardLoading(
    commands: any[],
    event: Event | undefined,
    section: string,
    id: string | number | null | undefined,
    queryParams?: Record<string, string>,
  ): void {
    if (!this.beginCardNavigation(event, section, id)) {
      return;
    }
    this.router.navigate(commands, { queryParams }).catch(() => {
      this.resetCardNavigation();
    });
  }

  private beginCardNavigation(event: Event | undefined, section: string, id: string | number | null | undefined): boolean {
    const key = this.buildLoadingKey(section, id);
    if (!key) {
      event?.preventDefault();
      event?.stopPropagation();
      return false;
    }
    if (this.cardNavigationKey) {
      event?.preventDefault();
      event?.stopPropagation();
      return false;
    }
    event?.preventDefault();
    event?.stopPropagation();
    this.cardNavigationKey = key;
    return true;
  }

  private buildLoadingKey(section: string, id: string | number | null | undefined): string | null {
    if (id === null || id === undefined) {
      return null;
    }
    const normalized = String(id).trim();
    if (!normalized) {
      return null;
    }
    return `${section}:${normalized}`;
  }

  private resetCardNavigation(): void {
    this.cardNavigationKey = null;
  }
}
