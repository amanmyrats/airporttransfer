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
import { InputNumber } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { PopularRoute } from '../../models/popular-route.model';
import { MainLocation } from '../../../models/main-location.model';
import { CarType } from '../../../models/car-type.model';
import { PopularRouteService } from '../../services/popular-route.service';
import { MainLocationService } from '../../../services/main-location.service';
import { CarTypeService } from '../../../services/car-type.service';

@Component({
  selector: 'app-popular-route-form',
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
  templateUrl: './popular-route-form.component.html',
  styleUrl: './popular-route-form.component.scss'
})
export class PopularRouteFormComponent implements OnInit {

  popularRouteForm: FormGroup;
  popularRoute: PopularRoute | null = null;
  mainLocations: MainLocation[] = [];
  carTypes: CarType[] = [];
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private popularRouteService: PopularRouteService,
    private httpErrorPrinter: HttpErrorPrinterService, 
    private formErrorPrinter: FormErrorPrinterService,
    private mainLocationService: MainLocationService, 
    private carTypeService: CarTypeService,
  ) {
    this.popularRouteForm = this.fb.group({
      id: [''],
      airport: ['', Validators.required],
      car_type: ['', Validators.required],
      destination: ['', Validators.required],
      euro_price: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.popularRoute = this.config.data.popularRoute;
    if (this.popularRoute) {
      this.popularRouteForm.patchValue({
        ...this.popularRoute,
        airport: this.popularRoute.airport
          || this.popularRoute.airport_detail?.iata_code
          || this.popularRoute.main_location,
      });
    }
    this.mainLocations = this.mainLocationService.getMainLocations();
    this.carTypes = this.carTypeService.getCarTypes();
  }

  submitForm() {
    if (this.popularRouteForm.valid) {
      this.isSaving = true;
      if (this.popularRoute) {
        console.log('Updating popularRoute:', this.popularRouteForm.value);
        // Update the popularRoute
        this.popularRouteService.updatePopularRoute(
          this.popularRoute?.id!, this.popularRouteForm.value).subscribe({
          next: (popularRoute: PopularRoute) => {
            console.log('PopularRoute updated:', popularRoute);
            this.dialogRef.close(popularRoute);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
            this.isSaving = false;
          }
        });

      }
      else {
        // Create a new popularRoute
        console.log('Creating popularRoute:', this.popularRouteForm.value);
        this.popularRouteService.createPopularRoute(
          this.popularRouteForm.value).subscribe({
          next: (popularRoute: PopularRoute) => {
            console.log('PopularRoute created:', popularRoute);
            this.dialogRef.close(popularRoute);
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
            this.isSaving = false;
          }
        });
      }
    } else {
      this.formErrorPrinter.printFormValidationErrors(this.popularRouteForm);
    }
  }
  
}
