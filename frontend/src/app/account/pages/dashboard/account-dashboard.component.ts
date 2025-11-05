import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { ReservationService } from '../../../admin/services/reservation.service';
import { MyReservation } from '../../../admin/models/reservation.model';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, RouterLink],
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
  private readonly upcomingLimit = 3;
  private readonly pendingLimit = 3;
  private readonly maxLocationLabelLength = 30;

  readonly user = this.authService.user;
  readonly upcomingReservations = signal<MyReservation[]>([]);
  readonly pendingConfirmationReservations = signal<MyReservation[]>([]);
  readonly upcomingLoading = signal(false);
  readonly pendingLoading = signal(false);
  readonly currentLang = computed(() => this.languageService.extractLangFromUrl(this.router.url));

  private readonly statusLabels: Record<string, string> = {
    draft: 'Pending confirmation',
    awaiting_payment: 'Awaiting payment',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled_by_user: 'Cancelled by you',
    cancelled_by_operator: 'Cancelled by operator',
    no_show: 'No show',
  };

  ngOnInit(): void {
    this.loadUpcomingReservations();
    this.loadPendingConfirmationReservations();
  }

  statusLabel(status: string | null | undefined): string {
    if (!status) {
      return 'Status not set';
    }
    const normalized = status.toLowerCase();
    return this.statusLabels[normalized] ?? normalized;
  }

  tripTitle(reservation: MyReservation): string {
    const hasRoute =
      !!(reservation.pickup_short || reservation.pickup_full || reservation.dest_short || reservation.dest_full);
    if (!hasRoute) {
      return 'Route not yet assigned';
    }
    const pickup = this.truncate(reservation.pickup_short || reservation.pickup_full || 'Pickup', this.maxLocationLabelLength);
    const destination = this.truncate(
      reservation.dest_short || reservation.dest_full || 'Destination',
      this.maxLocationLabelLength,
    );
    return `${pickup} → ${destination}`;
  }

  transferDateLabel(reservation: MyReservation): string {
    const date = this.parseDate(reservation.transfer_date);
    const time = (reservation.transfer_time ?? '').trim();
    const dateLabel = date ? this.datePipe.transform(date, 'mediumDate') : null;
    if (!dateLabel && !time) {
      return 'Date not set';
    }
    if (dateLabel && time) {
      return `${dateLabel} • ${time}`;
    }
    return dateLabel ?? time ?? 'Date not set';
  }

  trackByReservationId(_: number, reservation: MyReservation): number {
    return reservation.id;
  }

  reservationLink(reservation: MyReservation): any[] {
    return this.languageService.commandsWithLang(
      this.currentLang(),
      'account',
      'reservations',
      String(reservation.id),
    );
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
}
