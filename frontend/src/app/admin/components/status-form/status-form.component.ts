import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessagesModule } from 'primeng/messages';
import { PanelModule } from 'primeng/panel';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FormErrorPrinterService } from '../../../services/form-error-printer.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { CallbackService } from '../../../services/callback.service';
import { finalize } from 'rxjs/operators';

type StatusMessage = {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
};

@Component({
    selector: 'app-status-form',
    imports: [
      PanelModule, CommonModule,
      MessagesModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextModule,
      ButtonModule, 
    ],
    providers: [
        HttpErrorPrinterService, FormErrorPrinterService,
    ],
    templateUrl: './status-form.component.html',
    styleUrl: './status-form.component.scss'
})
export class StatusFormComponent implements OnInit {

  statusForm: FormGroup;
  reservation: Reservation | null = null; 
  statuses: any[] = [];
  submitting = false;
  submittingStatus: string | null = null;
  messages: StatusMessage[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private reservationService: ReservationService,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private formErrorPrinter: FormErrorPrinterService, 
    private callbackService: CallbackService,
    
  ) {
    this.statusForm = this.fb.group({
      id: [''],
      status: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.reservation = this.config.data.reservation;
    if (this.reservation) {
      this.statusForm.patchValue({
        id: this.reservation.id,
        status: this.reservation.status,
      });
    }
    this.getStatuses();
  }

  submitForm() {
    console.log('submitting')
    console.log(this.statusForm.value);
    if (this.submitting || !this.statusForm.valid) {
      if (!this.statusForm.valid) {
        this.formErrorPrinter.printFormValidationErrors(this.statusForm);
      }
      return;
    }

    if (!this.reservation) {
      this.formErrorPrinter.printFormValidationErrors(this.statusForm);
      return;
    }

    const selectedStatus = this.statusForm.value.status as ReservationStatus | undefined;
    if (!selectedStatus) {
      this.formErrorPrinter.printFormValidationErrors(this.statusForm);
      return;
    }
    const previousStatus = this.reservation.status;

    this.submitting = true;
    this.submittingStatus = selectedStatus ?? null;
    this.messages = [];

    console.log('Updating reservation status:', this.statusForm.value);
    this.reservationService
      .updateStatus(
        this.reservation?.id!,
        {
          id: this.reservation.id,
          status: selectedStatus,
        } as Reservation,
      )
      .pipe(finalize(() => {
        this.submitting = false;
        this.submittingStatus = null;
      }))
      .subscribe({
        next: (reservation: Reservation) => {
          console.log('Reservation status updated:', reservation);
          this.reservation = reservation;
          this.statusForm.patchValue({ status: reservation.status });
          const data = {
            order: {
              number: reservation['number'],
              status: reservation['status'],
            }
          }
          this.callbackService.TtAthOrderChangeCallback(data).subscribe({
            next: data => {
              console.log('Order Change Callback:', data);
              const message = this.extractCallbackMessage(data);
              const isSuccess = (message || '').toLowerCase().includes('order updated successfully');
              if (!isSuccess) {
                const userMessage =
                  'Status cannot be updated because the order is inoperation or completed on transfertakip.com.';
                this.handleCallbackFailure(previousStatus, message, { revert: true, userMessage });
                return;
              }
              this.dialogRef.close(reservation);
            },
            error: error => {
              console.error('Order Change Callback Error:', error);
              const userMessage = 'This status cannot be updated in transfertakip.com.';
              const callbackMsg = this.extractCallbackMessage(error);
              this.handleCallbackFailure(previousStatus, callbackMsg, {
                revert: true,
                userMessage: callbackMsg || userMessage,
              });
            }
          });
        },
        error: (err: HttpErrorResponse) => {
          if (previousStatus) {
            this.statusForm.patchValue({ status: previousStatus });
          }
          this.httpErrorPrinter.printHttpError(err);
        }
      });
  }

  getStatuses() {
    this.reservationService.getStatuses().subscribe({
      next: (statuses: any[]) => {
        console.log('Statuses:', statuses);
        this.statuses = statuses?.filter(status => status?.value !== 'awaiting_payment');
      },
      error: (err: HttpErrorResponse) => {
        this.httpErrorPrinter.printHttpError(err);
      }
    });
  }

  onStatusClick(statusValue: string) {
    if (this.submitting || this.isCurrentStatus(statusValue)) {
      return;
    }
    this.statusForm.patchValue({ status: statusValue });
    this.statusForm.markAsDirty();
    this.statusForm.markAsTouched();
    this.submitForm();
  }

  isCurrentStatus(statusValue: string): boolean {
    const current = this.reservation?.status || this.statusForm.value.status;
    return current === statusValue;
  }

  private handleCallbackFailure(
    previousStatus: ReservationStatus | undefined | null,
    message?: string | null,
    options?: { revert?: boolean; userMessage?: string },
  ) {
    const primary = options?.userMessage || message || 'Update blocked.';
    const extra = options?.revert ? 'Previous status restored.' : '';
    this.messages = [
      {
        severity: 'warn',
        summary: 'Order Update',
        detail: [primary, extra].filter(Boolean).join(' '),
      },
    ];
    if (options?.revert && previousStatus && this.reservation?.id) {
      this.reservationService
        .updateStatus(this.reservation.id, { status: previousStatus } as Reservation)
        .subscribe({
          next: reverted => {
            this.reservation = reverted;
            this.statusForm.patchValue({ status: reverted.status });
          },
          error: err => {
            this.httpErrorPrinter.printHttpError(err);
          },
        });
    } else if (options?.revert && previousStatus) {
      this.statusForm.patchValue({ status: previousStatus });
    }
  }

  private extractCallbackMessage(payload: any): string | null {
    if (!payload) return null;
    if (typeof payload === 'string') {
      return payload;
    }
    if (payload?.message) {
      return String(payload.message);
    }
    if (payload?.error?.message) {
      return String(payload.error.message);
    }
    if (payload?.error) {
      return String(payload.error);
    }
    if (payload?.statusText) {
      return String(payload.statusText);
    }
    return null;
  }

}
