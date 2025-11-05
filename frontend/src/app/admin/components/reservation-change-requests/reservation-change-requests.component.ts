import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import { ChangeRequestService } from '../../services/change-request.service';
import {
  ChangeRequestStatus,
  Reservation,
  ReservationChangeRequest,
} from '../../models/reservation.model';

type ActionState = Record<number, boolean>;
type NoteDrafts = Record<number, string>;
type ChangeEntry = {
  field: string;
  label: string;
  current: string;
  proposed: string;
};

@Component({
  selector: 'app-reservation-change-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TextareaModule,
    DividerModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './reservation-change-requests.component.html',
  styleUrl: './reservation-change-requests.component.scss',
})
export class ReservationChangeRequestsComponent implements OnInit {
  reservation!: Reservation;
  requests: ReservationChangeRequest[] = [];
  loading = false;
  error: string | null = null;
  actionLoading: ActionState = {};
  noteDrafts: NoteDrafts = {};
  hasChanges = false;
  private onUpdateCallback?: (request: ReservationChangeRequest) => void;
  private messageService?: MessageService;
  private changeDisplayMap: Record<number, ChangeEntry[]> = {};

  private readonly approveStatuses: ChangeRequestStatus[] = [
    'pending_review',
    'auto_approved',
    'awaiting_user_payment',
  ];
  private readonly declineStatuses: ChangeRequestStatus[] = [
    'pending_review',
    'awaiting_user_payment',
  ];
  private readonly fieldLabels: Record<string, string> = {
    transfer_date: 'Transfer Tarihi',
    transfer_time: 'Transfer Saati',
    flight_date: 'Uçuş Tarihi',
    flight_time: 'Uçuş Saati',
    flight_number: 'Uçuş Numarası',
    passenger_count: 'Yolcu Sayısı',
    passenger_count_child: 'Çocuk Yolcu',
    need_child_seat: 'Çocuk Koltuğu',
    child_seat_count: 'Çocuk Koltuğu Adedi',
    note: 'Not',
    pickup_short: 'Kalkış',
    dest_short: 'Varış',
    pickup_full: 'Kalkış (Detay)',
    dest_full: 'Varış (Detay)',
    transfer_type: 'Transfer Tipi',
    direction_type: 'Yön Tipi',
    car_type: 'Araç Tipi',
    transfer_date_time: 'Transfer Tarih & Saat',
  };

  constructor(
    private readonly changeRequestService: ChangeRequestService,
    private readonly dialogConfig: DynamicDialogConfig,
    private readonly dialogRef: DynamicDialogRef,
  ) {}

  ngOnInit(): void {
    this.reservation = this.dialogConfig.data?.reservation;
    this.onUpdateCallback = this.dialogConfig.data?.onUpdate;
    this.messageService = this.dialogConfig.data?.messageService as MessageService | undefined;
    if (!this.reservation?.id) {
      this.error = 'Rezervasyon bilgisi bulunamadı.';
      return;
    }
    this.fetchRequests();
  }

  fetchRequests(): void {
    if (!this.reservation?.id) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.changeRequestService
      .listByReservation(Number(this.reservation.id), { page_size: 50 })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          const items = response.results ?? [];
          this.requests = items;
          this.noteDrafts = items.reduce<NoteDrafts>((acc, item) => {
            acc[item.id] = item.decision_reason ?? '';
            return acc;
          }, {});
          this.changeDisplayMap = items.reduce<Record<number, ChangeEntry[]>>((acc, item) => {
            acc[item.id] = this.buildChangeEntries(item);
            return acc;
          }, {});
        },
        error: err => {
          this.error = this.extractError(err);
        },
      });
  }

  approve(request: ReservationChangeRequest): void {
    if (!this.canApprove(request.status) || this.actionLoading[request.id]) {
      return;
    }
    this.executeAction(
      request,
      () => this.changeRequestService.approve(request.id, this.buildPayload(request.id)),
      'Değişiklik isteği onaylandı.',
    );
  }

  decline(request: ReservationChangeRequest): void {
    if (!this.canDecline(request.status) || this.actionLoading[request.id]) {
      return;
    }
    this.executeAction(
      request,
      () => this.changeRequestService.decline(request.id, this.buildPayload(request.id)),
      'Değişiklik isteği reddedildi.',
    );
  }

  canApprove(status: ChangeRequestStatus): boolean {
    return this.approveStatuses.includes(status);
  }

  canDecline(status: ChangeRequestStatus): boolean {
    return this.declineStatuses.includes(status);
  }

  statusLabel(status: ChangeRequestStatus): string {
    const labels: Record<ChangeRequestStatus, string> = {
      pending_review: 'İncelemede',
      auto_approved: 'Oto Onaylandı',
      awaiting_user_payment: 'Ödeme Bekleniyor',
      approved_applied: 'Uygulandı',
      declined: 'Reddedildi',
      expired: 'Süresi Doldu',
      cancelled: 'İptal Edildi',
    };
    return labels[status];
  }

  statusSeverity(status: ChangeRequestStatus): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Partial<Record<ChangeRequestStatus, 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast'>> = {
      pending_review: 'info',
      auto_approved: 'success',
      awaiting_user_payment: 'warn',
      approved_applied: 'success',
      declined: 'danger',
      expired: 'secondary',
      cancelled: 'secondary',
    };
    return severities[status] ?? 'info';
  }

  close(result?: { refresh?: boolean }): void {
    if (this.dialogRef) {
      this.dialogRef.close(result);
    }
  }

  trackByRequestId(_index: number, item: ReservationChangeRequest): number {
    return item.id;
  }

  getChangeEntries(request: ReservationChangeRequest): ChangeEntry[] {
    return this.changeDisplayMap[request.id] ?? [];
  }

  private executeAction(
    request: ReservationChangeRequest,
    action: () => import('rxjs').Observable<ReservationChangeRequest>,
    successMessage: string,
  ): void {
    this.actionLoading[request.id] = true;
    action()
      .pipe(
        finalize(() => {
          this.actionLoading[request.id] = false;
        }),
      )
      .subscribe({
        next: updated => {
          this.hasChanges = true;
          this.updateRequest(updated);
          if (this.reservation) {
            this.reservation.latest_change_request_status = updated.status;
            this.reservation.has_change_request = this.requests.length > 0;
          }
          this.onUpdateCallback?.(updated);
          this.changeDisplayMap[updated.id] = this.buildChangeEntries(updated);
          this.messageService?.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: successMessage,
          });
        },
        error: err => {
          const detail = this.extractError(err);
          this.messageService?.add({
            severity: 'error',
            summary: 'Hata',
            detail,
          });
        },
      });
  }

  private updateRequest(updated: ReservationChangeRequest): void {
    this.requests = this.requests.map(item =>
      item.id === updated.id ? updated : item,
    );
    this.noteDrafts[updated.id] = updated.decision_reason ?? '';
    this.changeDisplayMap[updated.id] = this.buildChangeEntries(updated);
  }

  private buildPayload(id: number): { note?: string } {
    const note = (this.noteDrafts[id] ?? '').trim();
    return note ? { note } : {};
  }

  private extractError(err: unknown): string {
    if (!err) {
      return 'Bilinmeyen bir hata oluştu.';
    }
    if (typeof err === 'string') {
      return err;
    }
    if (this.isHttpError(err)) {
      const data = err.error;
      if (typeof data === 'string') {
        return data;
      }
      if (data && typeof data === 'object') {
        if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
          return data.non_field_errors.join(' ');
        }
        if (data.detail) {
          return Array.isArray(data.detail) ? data.detail.join(' ') : String(data.detail);
        }
      }
      return err.statusText || `Sunucu hatası (${err.status}).`;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return 'Beklenmeyen bir hata oluştu.';
    }
  }

  private isHttpError(value: unknown): value is { status: number; statusText: string; error?: any } {
    return !!value && typeof value === 'object' && 'status' in value && 'statusText' in value;
  }

  private buildChangeEntries(request: ReservationChangeRequest): ChangeEntry[] {
    const proposed = request.proposed_changes ?? {};
    const entries: ChangeEntry[] = [];
    Object.entries(proposed).forEach(([field, proposedValue]) => {
      const currentValue = this.getCurrentValue(field);
      if (this.areValuesEqual(currentValue, proposedValue)) {
        return;
      }
      entries.push({
        field,
        label: this.fieldLabels[field] ?? this.humanize(field),
        current: this.formatValue(currentValue),
        proposed: this.formatValue(proposedValue),
      });
    });
    return entries;
  }

  private getCurrentValue(field: string): unknown {
    if (!this.reservation) {
      return undefined;
    }
    return (this.reservation as Record<string, unknown>)[field];
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'boolean') {
      return value ? 'Evet' : 'Hayır';
    }
    if (Array.isArray(value)) {
      return value.map(v => this.formatValue(v)).join(', ');
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  private areValuesEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private humanize(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }
}
