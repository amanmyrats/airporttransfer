import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize, take, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ReservationService } from '../../../admin/services/reservation.service';
import { LanguageService } from '../../../services/language.service';
import {
  ChangeRequestStatus,
  ReservationChangeRequest,
  ReservationChangeSet,
  MyReservation,
  ReservationPassengerEntry,
  ReservationPassengerInput,
} from '../../../admin/models/reservation.model';

const PENDING_STATUSES: ChangeRequestStatus[] = [
  'pending_review',
  'awaiting_user_payment',
];

interface PassengerDescriptor {
  label: string;
  isChild: boolean;
  order: number;
}

@Component({
  selector: 'app-my-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, ToastModule, ReactiveFormsModule],
  templateUrl: './my-reservation-detail.component.html',
  styleUrl: './my-reservation-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class MyReservationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);
  private readonly languageService = inject(LanguageService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly reservationId = signal<number | null>(null);
  readonly reservation = this.reservationService.reservation;
  readonly reservationLoading = this.reservationService.reservationLoading;
  readonly changeRequests = this.reservationService.changeRequests;
  readonly changeRequestsLoading = this.reservationService.changeRequestsLoading;
  readonly childSeatHint =
    'If you need more than one child seat, please contact support via WhatsApp or email.';

  readonly changeRequestStatusLabels: Record<ChangeRequestStatus, string> = {
    pending_review: 'Pending review',
    auto_approved: 'Auto-approved',
    awaiting_user_payment: 'Awaiting payment',
    approved_applied: 'Approved & applied',
    declined: 'Declined',
    expired: 'Expired',
    cancelled: 'Cancelled',
  };

  readonly reservationStatusLabels: Record<string, string> = {
    draft: 'Draft',
    awaiting_payment: 'Awaiting payment',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled_by_user: 'Cancelled by user',
    cancelled_by_operator: 'Cancelled by operator',
    no_show: 'No show',
  };

  readonly canReview = computed(() => {
    const reservation = this.reservation();
    return !!reservation && reservation.can_review && !reservation.has_review;
  });

  readonly hasPendingChangeRequest = computed(() =>
    this.changeRequests().some(request => PENDING_STATUSES.includes(request.status)),
  );

  readonly form = this.fb.group({
    transfer_date: [''],
    transfer_time: [''],
    flight_date: [''],
    flight_time: [''],
    flight_number: [''],
    passenger_count: [1],
    passenger_count_child: [0],
    need_child_seat: [false],
    child_seat_count: [{ value: 0, disabled: true }],
    note: [''],
  });
  readonly passengerListForm = this.fb.group({
    passengers: this.fb.array([]),
  });
  readonly passengerEntries = signal<ReservationPassengerEntry[]>([]);
  readonly passengerLoading = signal(false);
  readonly passengerSaving = signal(false);
  readonly passengerDescriptors = computed<PassengerDescriptor[]>(() =>
    this.buildPassengerDescriptors(this.reservation()),
  );
  readonly hasAdditionalPassengers = computed(() => this.passengerDescriptors().length > 0);
  readonly primaryPassengerName = computed(() => {
    const reservation = this.reservation();
    return (
      reservation?.passenger_name?.trim() ||
      reservation?.passenger_email?.trim() ||
      'Primary passenger'
    );
  });
  readonly changeRequestSubmitting = signal(false);

  private readonly patchEffect = effect(() => {
    const reservation = this.reservation();
    if (!reservation) {
      return;
    }
    this.form.patchValue(
      {
        transfer_date: reservation.transfer_date ?? '',
        transfer_time: reservation.transfer_time ?? '',
        flight_date: reservation.flight_date ?? '',
        flight_time: reservation.flight_time ?? '',
        flight_number: reservation.flight_number ?? '',
        passenger_count: reservation.passenger_count ?? 0,
        passenger_count_child: reservation.passenger_count_child ?? 0,
        need_child_seat: reservation.need_child_seat ?? false,
        note: reservation.note ?? '',
      },
      { emitEvent: false },
    );
    this.syncChildSeatCount(Boolean(reservation.need_child_seat));
  });
  private passengerSnapshotKey: string | null = null;
  private readonly passengerFormEffect = effect(() => {
    const descriptors = this.passengerDescriptors();
    this.syncPassengerControls(descriptors.length);
    const entries = this.passengerEntries();
    descriptors.forEach((descriptor, index) => {
      const control = this.passengerArray.at(index) as FormControl | null;
      if (!control) {
        return;
      }
      const match = entries.find(
        entry => entry.order === descriptor.order && entry.is_child === descriptor.isChild,
      );
      const nextValue = match?.full_name ?? '';
      if (control.value !== nextValue) {
        control.patchValue(nextValue, { emitEvent: false });
      }
    });
  });
  private readonly passengerLoadEffect = effect(() => {
    const reservation = this.reservation();
    const reservationId = this.reservationId();
    if (!reservation || !reservationId) {
      return;
    }
    const snapshotKey = `${reservationId}:${reservation.passenger_count ?? 0}:${reservation.passenger_count_child ?? 0}:${reservation.updated_at ?? ''}`;
    if (snapshotKey === this.passengerSnapshotKey) {
      return;
    }
    this.passengerSnapshotKey = snapshotKey;
    this.loadPassengers(reservationId);
  });

  constructor() {
    this.route.paramMap.pipe(take(1)).subscribe(params => {
      const idParam = params.get('id');
      const id = idParam ? Number(idParam) : NaN;
      if (!Number.isNaN(id) && id > 0) {
        this.reservationId.set(id);
        this.bootstrapData(id);
      }
    });

    this.form
      .get('need_child_seat')
      ?.valueChanges.pipe(
        takeUntilDestroyed(),
        tap(needSeat => this.syncChildSeatCount(Boolean(needSeat))),
      )
      .subscribe();
  }

  reviewLink(): any[] {
    const id = this.reservationId();
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    if (!id) {
      return this.languageService.commandsWithLang(lang, 'account', 'reservations');
    }
    return this.languageService.commandsWithLang(lang, 'account', 'reviews', 'new', String(id));
  }

  listLink(): any[] {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    return this.languageService.commandsWithLang(lang, 'account', 'reservations');
  }

  submitChangeRequest(): void {
    const reservationId = this.reservationId();
    if (!reservationId) {
      return;
    }
    const changes = this.buildChangeSet();
    if (Object.keys(changes).length === 0) {
      this.messageService.add({
        severity: 'warn',
        detail: 'Please adjust at least one field before submitting a change request.',
      });
      return;
    }

    const payload = {
      changes,
    };

    this.changeRequestSubmitting.set(true);
    this.messageService.add({
      severity: 'info',
      detail: 'Submitting your change request…',
    });
    this.reservationService
      .createMyChangeRequest(reservationId, payload)
      .pipe(finalize(() => this.changeRequestSubmitting.set(false)))
      .subscribe({
        next: changeRequest => {
          this.messageService.add({
            severity: 'success',
            detail:
              changeRequest.status === 'approved_applied'
                ? 'Your changes have been applied.'
                : 'Change request submitted for review.',
          });
          this.refreshReservation(reservationId);
        },
        error: error => {
          const detail = error?.error?.detail || 'Unable to submit change request.';
          this.messageService.add({ severity: 'error', detail });
        },
      });
  }

  cancelChangeRequest(request: ReservationChangeRequest): void {
    if (!PENDING_STATUSES.includes(request.status)) {
      return;
    }
    this.reservationService.cancelMyChangeRequest(request.id, {}).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          detail: 'Change request cancelled.',
        });
        this.refreshReservation(request.reservation);
      },
      error: error => {
        const detail = error?.error?.detail || 'Unable to cancel change request.';
        this.messageService.add({ severity: 'error', detail });
      },
    });
  }

  changeEntryKeys(changeRequest: ReservationChangeRequest): Array<[string, unknown]> {
    return Object.entries(changeRequest.proposed_changes ?? {});
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  }

  isCancellable(request: ReservationChangeRequest): boolean {
    return PENDING_STATUSES.includes(request.status);
  }

  private bootstrapData(id: number): void {
    this.reservationService.getMyReservation(id).subscribe({
      error: error => {
        const detail = error?.error?.detail || 'Unable to load reservation.';
        this.messageService.add({ severity: 'error', detail });
      },
    });
    this.reservationService.listMyChangeRequests(id).subscribe({
      error: error => {
        const detail = error?.error?.detail || 'Unable to load change requests.';
        this.messageService.add({ severity: 'error', detail });
      },
    });
  }

  private refreshReservation(id: number): void {
    this.reservationService.getMyReservation(id).subscribe();
    this.reservationService.listMyChangeRequests(id).subscribe();
  }

  private buildChangeSet(): ReservationChangeSet {
    const reservation = this.reservation();
    if (!reservation) {
      return {};
    }
    const formValue = this.form.getRawValue();
    const fields: Array<keyof ReservationChangeSet & keyof typeof formValue> = [
      'transfer_date',
      'transfer_time',
      'flight_date',
      'flight_time',
      'flight_number',
      'passenger_count',
      'passenger_count_child',
      'need_child_seat',
      'child_seat_count',
      'note',
    ];

    const changes: ReservationChangeSet = {};
    const numericFields: Array<keyof ReservationChangeSet> = [
      'passenger_count',
      'passenger_count_child',
      'child_seat_count',
    ];
    fields.forEach(field => {
      let newValue: unknown = formValue[field];
      if (typeof newValue === 'string') {
        newValue = newValue.trim();
        if (newValue === '') {
          newValue = null;
        }
      }
      if (numericFields.includes(field)) {
        if (newValue === null || newValue === undefined) {
          newValue = null;
        } else {
          const parsed = Number(newValue);
          newValue = Number.isNaN(parsed) ? null : parsed;
        }
      }

      const currentValue = reservation[field as keyof MyReservation] as unknown;
      if (!this.valuesEqual(newValue, currentValue)) {
        (changes as Record<string, unknown>)[field] = newValue;
      }
    });
    return changes;
  }

  private valuesEqual(nextValue: unknown, currentValue: unknown): boolean {
    if (typeof nextValue === 'number' && typeof currentValue === 'number') {
      return nextValue === currentValue;
    }
    if (typeof nextValue === 'boolean' && typeof currentValue === 'boolean') {
      return nextValue === currentValue;
    }
    return (nextValue ?? '') === (currentValue ?? '');
  }

  private syncChildSeatCount(needSeat: boolean): void {
    this.form.get('child_seat_count')?.patchValue(needSeat ? 1 : 0, { emitEvent: false });
  }

  needChildSeatSelected(): boolean {
    return Boolean(this.form.get('need_child_seat')?.value);
  }

  passengerFormDisabled(): boolean {
    return this.passengerSaving() || this.passengerLoading();
  }

  savePassengerList(): void {
    const reservationId = this.reservationId();
    const descriptors = this.passengerDescriptors();
    if (!reservationId || descriptors.length === 0) {
      return;
    }
    const values = (this.passengerArray.value as Array<string | null | undefined>).map(value =>
      (value ?? '').trim(),
    );
    const missingIndex = values.findIndex(value => !value);
    if (missingIndex !== -1) {
      this.messageService.add({
        severity: 'warn',
        detail: 'Please enter the full name for every passenger.',
      });
      return;
    }
    const payload: ReservationPassengerInput[] = descriptors.map((descriptor, index) => ({
      full_name: values[index] ?? '',
      is_child: descriptor.isChild,
      order: descriptor.order,
    }));
    this.passengerSaving.set(true);
    this.messageService.add({
      severity: 'info',
      detail: 'Saving passenger list…',
    });
    this.reservationService
      .saveMyReservationPassengers(reservationId, payload)
      .pipe(finalize(() => this.passengerSaving.set(false)))
      .subscribe({
        next: passengers => {
          this.passengerEntries.set(passengers ?? []);
          this.messageService.add({
            severity: 'success',
            detail: 'Passenger list updated.',
          });
        },
        error: error => {
          const detail = error?.error?.detail || 'Unable to update passenger list.';
          this.messageService.add({ severity: 'error', detail });
        },
      });
  }

  private buildPassengerDescriptors(reservation: MyReservation | null): PassengerDescriptor[] {
    if (!reservation) {
      return [];
    }
    const totalAdults = Math.max(reservation.passenger_count ?? 0, 0);
    const totalChildren = Math.max(reservation.passenger_count_child ?? 0, 0);
    const additionalAdults = Math.max(totalAdults - 1, 0);
    const descriptors: PassengerDescriptor[] = [];
    for (let i = 0; i < additionalAdults; i += 1) {
      descriptors.push({
        label: `Passenger ${i + 2}`,
        isChild: false,
        order: descriptors.length,
      });
    }
    for (let i = 0; i < totalChildren; i += 1) {
      descriptors.push({
        label: `Child ${i + 1}`,
        isChild: true,
        order: descriptors.length,
      });
    }
    return descriptors;
  }

  private loadPassengers(reservationId: number): void {
    this.passengerLoading.set(true);
    this.reservationService.listMyReservationPassengers(reservationId).subscribe({
      next: passengers => {
        this.passengerEntries.set(passengers ?? []);
        this.passengerLoading.set(false);
      },
      error: error => {
        this.passengerEntries.set([]);
        this.passengerLoading.set(false);
        const detail = error?.error?.detail || 'Unable to load passenger names.';
        this.messageService.add({ severity: 'warn', detail });
      },
    });
  }

  private syncPassengerControls(expected: number): void {
    const array = this.passengerArray;
    if (array.length > expected) {
      while (array.length > expected) {
        array.removeAt(array.length - 1);
      }
    } else {
      while (array.length < expected) {
        array.push(new FormControl(''));
      }
    }
  }

  private get passengerArray(): FormArray {
    return this.passengerListForm.get('passengers') as FormArray;
  }
}
