import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reservation } from '../admin/models/reservation.model';
import { Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  endPoint: string = "transfer/bookingcreate/"

  distance = signal<number>(0);
  drivingDuration = signal<number>(0);
  
  fb = inject(FormBuilder);
  bookingForm!: FormGroup;
  bookingInitialForm!: FormGroup;
  bookingCarTypeSelectionForm!: FormGroup;
  bookingCompletionForm!: FormGroup;
  
  constructor(
    private http: HttpClient
  ) { 
    this.bookingInitialForm = this.fb.group({
      pickup_place: '',
      dest_place: '',
      pickup_full: ['', Validators.required],
      dest_full: ['', Validators.required],
      pickup_lat: '',
      pickup_lng: '',
      dest_lat: '',
      dest_lng: '',
      // date: '',
      // time: '',
      // passengerCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      // returnTrip: [false],
      // returnDate: [''],
      // returnTime: [''],
    });
    
    this.bookingCarTypeSelectionForm = this.fb.group({
      car_type: '', 
      amount: 0,
      currency_code: 'EUR', 
      distance: 0,
      driving_duration: 0,
  });

    this.bookingCompletionForm = this.fb.group({
      transfer_date: ['', Validators.required],
      transfer_time: ['', Validators.required],
      flight_number: '',
      is_round_trip: [false],
      return_transfer_date: [''],
      return_transfer_time: [''],
      need_greet_sign: [false],
      need_child_seat: [false],
      extra_luggage: [false],
      note: [''],
      passenger_name: ['', Validators.required],
      passenger_email: '',
      // passenger_email: ['', [Validators.required, Validators.email]],
      passenger_phone: ['', Validators.required],
      passenger_additional_phone: ['']
    });

  this.bookingForm = this.fb.group({
    pickup_place: '',
    dest_place: '',
    pickup_full: ['', Validators.required],
    dest_full: ['', Validators.required],
    pickup_lat: '',
    pickup_lng: '',
    dest_lat: '',
    dest_lng: '',
    // date: '',
    // time: '',
    // passengerCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    // returnTrip: [false],
    // returnDate: [''],
    // returnTime: [''],

    car_type: '', 
    amount: 0,
    currency_code: 'EUR', 
    distance: 0,
    driving_duration: 0,

    transfer_date: ['', Validators.required],
    transfer_time: ['', Validators.required],
    flight_number: '',
    is_round_trip: [false],
    return_transfer_date: [''],
    return_transfer_time: [''],
    need_greet_sign: [false],
    need_child_seat: [false],
    extra_luggage: [false],
    note: [''],
    passenger_name: ['', Validators.required],
    passenger_email: '',
    // passenger_email: ['', [Validators.required, Validators.email]],
    passenger_phone: ['', Validators.required],
    passenger_additional_phone: ['']
  });

  }  

  createBooking(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, reservation);
  }

  mergeForms(): void {
    // patch the form values
    this.bookingForm.patchValue({
      ...this.bookingInitialForm.value,
      ...this.bookingCarTypeSelectionForm.value,
      ...this.bookingCompletionForm.value,
    });
  }
}
