import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { PanelModule } from 'primeng/panel';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { FormErrorPrinterService } from '../../../services/form-error-printer.service';
import { Rate, } from '../../models/rate.model';
import { RateService } from '../../services/rate.service';
import { InputNumber } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { Currency } from '../../../models/currency.model';
import { PaginatedResponse } from '../../../models/paginated-response.model';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { CurrencyService } from '../../../services/currency.service';

@Component({
    selector: 'app-rate-form',
    imports: [
        PanelModule,
        MessagesModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        Select, InputTextModule, ButtonModule, ReactiveFormsModule,
        MessagesModule, FloatLabel,
        InputNumber, CommonModule, PanelModule, 
    ],
    providers: [
        HttpErrorPrinterService, FormErrorPrinterService,
    ],
    templateUrl: './rate-form.component.html',
    styleUrl: './rate-form.component.scss'
})
export class RateFormComponent implements OnInit {

  rateForm: FormGroup;
  rate: Rate | null = null;
  currencies: Currency[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private rateService: RateService,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private formErrorPrinter: FormErrorPrinterService,
    private currencyService: CurrencyService, 
  ) {
    this.rateForm = this.fb.group({
      id: [''],
      currency_code: ['', Validators.required],
      euro_rate: null,
    });
  }

  ngOnInit(): void {
    this.rate = this.config.data.rate;
    if (this.rate) {
      this.rateForm.patchValue(this.rate);
    }
    this.currencies = this.currencyService.getCurrencies();
  }

  submitForm() {
    if (this.rateForm.valid) {
      if (this.rate) {
        console.log('Updating rate:', this.rateForm.value);
        // Update the rate
        this.rateService.updateRate(this.rate?.id!, this.rateForm.value).subscribe({
          next: (rate: Rate) => {
            console.log('Rate updated:', rate);
            this.dialogRef.close(rate);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
          }
        });

      }
      else {
        // Create a new rate
        console.log('Creating rate:', this.rateForm.value);
        this.rateService.createRate(this.rateForm.value).subscribe({
          next: (rate: Rate) => {
            console.log('Rate created:', rate);
            this.dialogRef.close(rate);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
          }
        });
      }
    } else {
      this.formErrorPrinter.printFormValidationErrors(this.rateForm);
    }
  }
  
}
