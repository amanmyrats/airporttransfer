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

  readonly reservations = this.reservationService.myReservations;
  readonly loading = this.reservationService.myReservationsLoading;
  readonly meta = this.reservationService.myReservationsMeta;

  private readonly pageSizeState = signal(this.defaultPageSize);
  private readonly pageIndexState = signal(0);
  readonly defaultOrdering = '-reservation_date';
  readonly reservationOrderingOptions = [
    { label: 'Newest reservation created', value: '-reservation_date' },
    { label: 'Oldest reservation created', value: 'reservation_date' },
    { label: 'Earliest transfer date', value: 'transfer_date' },
    { label: 'Latest transfer date', value: '-transfer_date' },
    { label: 'Status A-Z', value: 'status' },
    { label: 'Status Z-A', value: '-status' },
    { label: 'Payment status A-Z', value: 'payment_status' },
    { label: 'Payment status Z-A', value: '-payment_status' },
  ];
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

  private readonly statusLabels: Record<string, string> = {
    draft: 'Draft',
    awaiting_payment: 'Awaiting payment',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled_by_user: 'Cancelled by you',
    cancelled_by_operator: 'Cancelled by operator',
    no_show: 'No show',
  };

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

  readonly statusOptions = Object.entries(this.statusLabels).map(([value, label]) => ({
    value,
    label,
  }));

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

  tripTitle(reservation: MyReservation): string {
    const hasRoute =
      !!(reservation.pickup_short || reservation.pickup_full || reservation.dest_short || reservation.dest_full);
    if (!hasRoute) {
      return 'Route not yet assigned';
    }
    const pickup = reservation.pickup_short || reservation.pickup_full || 'Pickup';
    const destination = reservation.dest_short || reservation.dest_full || 'Destination';
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
      return 'Date not set';
    }
    if (dateLabel && time) {
      return `${dateLabel} • ${time}`;
    }
    return dateLabel ?? time ?? 'Date not set';
  }

  passengerSummary(reservation: MyReservation): string {
    const adults = reservation.passenger_count ?? 0;
    const children = reservation.passenger_count_child ?? 0;
    const segments: string[] = [];
    if (adults > 0) {
      segments.push(`${adults} adult${adults > 1 ? 's' : ''}`);
    }
    if (children > 0) {
      segments.push(`${children} child${children > 1 ? 'ren' : ''}`);
    }
    return segments.length > 0 ? segments.join(', ') : 'Passengers not set';
  }

  whatsappHref(reservation: MyReservation): string {
    const baseUrl =
      this.whatsappConfig.url ??
      (this.whatsappConfig.phone ? `https://wa.me/${String(this.whatsappConfig.phone).replace(/\D/g, '')}` : 'https://wa.me/');
    const separator = baseUrl.includes('?') ? '&' : '?';
    const identifier = reservation.number ?? reservation.id;
    const message = encodeURIComponent(
      `Hello! I would like assistance with reservation ${identifier}.`,
    );
    return `${baseUrl}${separator}text=${message}`;
  }

  emailHref(reservation: MyReservation): string {
    const subject = encodeURIComponent(`Reservation ${reservation.number ?? reservation.id} assistance`);
    const body = encodeURIComponent('Hello AirportTransferHub team,\n\nI need help with my reservation.\n\nThank you.');
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
}
