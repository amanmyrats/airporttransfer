import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessagesModule } from 'primeng/messages';
import { PanelModule } from 'primeng/panel';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FormErrorPrinterService } from '../../../services/form-error-printer.service';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { CallbackService } from '../../../services/callback.service';

@Component({
    selector: 'app-status-form',
    imports: [
      PanelModule, CommonModule,
      MessagesModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextModule,
      ButtonModule, 
      FloatLabel, 
      Select, 
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
      this.statusForm.patchValue(this.reservation);
    }
    this.getStatuses();
  }

  submitForm() {
    console.log('submitting')
    console.log(this.statusForm.value);
    if (this.statusForm.valid) {
      if (this.reservation) {
        console.log('Updating reservation status:', this.statusForm.value);
        // Update the reservation
        this.reservationService.updateStatus(this.reservation?.id!, this.statusForm.value).subscribe({
          next: (reservation: Reservation) => {
            console.log('Reservation status updated:', reservation);
            const data = {
              order: {
                number: reservation['number'],
                status: reservation['status'],
              }
            }
            this.callbackService.TtAthOrderChangeCallback(data).subscribe({
              next: data => {
                console.log('New Order Callback:', data);
              },
              error: error => {
                console.error('New Order Callback Error:', error);
              }
            });
            this.dialogRef.close(reservation);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
          }
        });

      } else {
      this.formErrorPrinter.printFormValidationErrors(this.statusForm);
    }
  }
  }

  getStatuses() {
    this.reservationService.getStatuses().subscribe({
      next: (statuses: any[]) => {
        console.log('Statuses:', statuses);
        this.statuses = statuses;
      },
      error: (err: HttpErrorResponse) => {
        this.httpErrorPrinter.printHttpError(err);
      }
    });
  }

}
