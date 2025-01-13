import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule,} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectButton } from 'primeng/selectbutton';
import { DatePicker } from 'primeng/datepicker';
import { InputMask } from 'primeng/inputmask';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { Reservation } from '../../models/reservation.model';
import { CurrencyService } from '../../../services/currency.service';
import { CarTypeService } from '../../../services/car-type.service';
import { ReservationService } from '../../services/reservation.service';
import { CarType } from '../../../models/car-type.model';
import { Currency } from '../../../models/currency.model';
import { StepperModule } from 'primeng/stepper';

@Component({
    selector: 'app-reservation-form',
    imports: [
      ReactiveFormsModule,
      MessagesModule, 
      InputTextModule, 
      TextareaModule, 
      CommonModule, 
      PanelModule, 
      FloatLabel, 
      Select, 
      SelectButton, 
      InputNumber, 
      DatePicker, 
      InputMask, 
      ButtonModule, StepperModule, 
    ],
    providers: [
        HttpErrorPrinterService,
    ],
    templateUrl: './reservation-form.component.html',
    styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  currencies: Currency[] = [];
  carTypes: CarType[] = [];
  showMyDriver: boolean = false;
  showTaseron: boolean = false;
  showAgencyComission: boolean = false;
  showChildSeatCount: boolean = false;

  needChildSeatOptions: any[] = [
    {label: 'Çocuk Koltuğu Lazım', value: true},
    {label: 'Lazım Değil', value: false},
  ];

  reservation: Reservation | null = null;
  reservationForm: FormGroup;

  constructor(
    private currencyService: CurrencyService,
    private carTypeService: CarTypeService,
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private httpErrorPrinter: HttpErrorPrinterService
    
  ){
    this.reservationForm = this.fb.group({
      id: "",
  
      number: "",
      amount: null,
      currency: "",
      
      reservation_date: new Date().toISOString().split('T')[0],
      car_type: "",
      transfer_date: new Date().toISOString().split('T')[0],
      transfer_time: "",

      flight_number: "",
      flight_date: new Date().toISOString().split('T')[0],
      flight_time: "",
    
      passenger_name: "",
      passenger_phone: "",
      passenger_count: 1,
      passenger_count_child: 0,
      note: "",
    
      pickup_short: "",
      pickup_full: "",
      dest_short: "",
      dest_full: "",

      need_child_seat: false,
      child_seat_count: 0,
      
    });
  }

  ngOnInit(): void {
      this.getCurrencies();
      this.getCarTypes();

      this.reservation = this.config.data.reservation;
      if (this.reservation) {
        this.reservationForm.patchValue(this.reservation);
      }
  }


  onSubmit(){
    console.log("Form submitted");
    console.log(this.reservationForm?.value);
    if (this.reservationForm.valid) {
      if (this.reservation) {
        this.updateReservation();
      }
    }
   
  }

  updateReservation(){
    this.reservationService.updateReservation(
      this.reservation?.id!, this.reservationForm.value).subscribe({
      next: (reservation: Reservation) => {
        console.log("Reservation updated successfully");
        console.log(reservation);
        this.dialogRef.close(reservation);
      },
      error: (error: any) => {
        this.httpErrorPrinter.printHttpError(error);
      }
    });
  }

  getCurrencies(queryString: string = ''){
    // this.currencyService.getCurrencies(queryString).subscribe({
    //   next: (paginatedCurrencies: PaginatedResponse<Currency>) => {
    //     console.log("Fetched Currencies successfully");
    //     console.log(paginatedCurrencies);
    //     this.currencies = paginatedCurrencies.results!;
    //   },
    //   error: (error: any) => {
    //     this.httpErrorPrinter.printHttpError(error);
    //   }
    // });
  }

  getCarTypes(queryString: string = ''): void {
    this.carTypes = this.carTypeService.getCarTypes(queryString);
  }

  needChildSeatToggle(event: any){
    if (event.value == true) {
      this.showChildSeatCount = true;
    } else if (event.value == false) {
      this.showChildSeatCount = false;
    } else {
      this.showChildSeatCount = false;
    }
  }

}
