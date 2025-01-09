import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { PanelModule } from 'primeng/panel';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HttpErrorResponse } from '@angular/common/http';
import { FloatLabel } from 'primeng/floatlabel';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FormErrorPrinterService } from '../../../services/form-error-printer.service';
import { CarType } from '../../models/car-type.model';
import { CarTypeService } from '../../services/car-type.service';

@Component({
    selector: 'app-car-type-form',
    imports: [
        PanelModule,
        MessagesModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule, 
        FloatLabel, 
    ],
    providers: [
        HttpErrorPrinterService, FormErrorPrinterService,
    ],
    templateUrl: './car-type-form.component.html',
    styleUrl: './car-type-form.component.scss'
})
export class CarTypeFormComponent implements OnInit{

  carTypeForm: FormGroup;
  carType: CarType | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private carTypeService: CarTypeService,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private formErrorPrinter: FormErrorPrinterService, 
  ) { 
    this.carTypeForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.carType = this.config.data.carType;
    if (this.carType) {
      this.carTypeForm.patchValue(this.carType);
    }
  }

  submitForm() {
    if (this.carTypeForm.valid) {
      if (this.carType) {
        console.log('Updating carType:', this.carTypeForm.value);
        // Update the carType
        this.carTypeService.updateCarType(this.carType?.id!, this.carTypeForm.value).subscribe({
          next: (carType: CarType) => {
            console.log('CarType updated:', carType);
            this.dialogRef.close(carType);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
          }
        });
        
      }
      else {
        // Create a new carType
        console.log('Creating carType:', this.carTypeForm.value);
        this.carTypeService.createCarType(this.carTypeForm.value).subscribe({
          next: (carType: CarType) => {
            console.log('CarType created:', carType);
            this.dialogRef.close(carType);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
          }
        });
      }
    } else {
      this.formErrorPrinter.printFormValidationErrors(this.carTypeForm);
    }
  }


}
