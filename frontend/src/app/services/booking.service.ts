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
  airportCoefficient = signal<number>(1);
  drivingDuration = signal<number>(0);
  
  fb = inject(FormBuilder);
  bookingForm!: FormGroup;
  bookingInitialForm!: FormGroup;
  bookingCarTypeSelectionForm!: FormGroup;
  bookingCompletionForm!: FormGroup;
  
// # Extra services


  constructor(
    private http: HttpClient
  ) { 

    // Get tomorrow's date (in YYYY-MM-DD format)
    const tomorrow = new Date();
    const dayAfterTomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Add 1 day to current date
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2); // Add 2 day to current date
    const formattedTomorrow = tomorrow.toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)
    const formattedDayAfterTomorrow = dayAfterTomorrow.toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)


    // Get current time (in HH:mm format)
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // Ensure two-digit format
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two-digit format
    const formattedTime = `${hours}:${minutes}`;

        

    this.bookingInitialForm = this.fb.group({
      pickup_place: '',
      dest_place: '',
      pickup_full: ['', Validators.required],
      dest_full: ['', Validators.required],
      pickup_short: '',
      dest_short: '',
      pickup_lat: '',
      pickup_lng: '',
      dest_lat: '',
      dest_lng: '',
      airport_coefficient: 1,
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
      airport_coefficient: 1,
  });

    this.bookingCompletionForm = this.fb.group({
      transfer_date: [formattedTomorrow, Validators.required],
      transfer_time: [formattedTime, Validators.required],
      flight_number: '',
      is_round_trip: [false],
      return_transfer_date: [formattedDayAfterTomorrow],
      return_transfer_time: [formattedTime],
      return_trip_amount: 0,
      need_child_seat: [false],
      child_seat_count: 1,
      greet_with_champagne: [false],
      greet_with_flower: [false],
      note: [''],
      passenger_name: ['', Validators.required],
      passenger_email: ['', Validators.email],
      // passenger_email: ['', [Validators.required, Validators.email]],
      passenger_phone: ['', Validators.required],
      passenger_additional_phone: [''], 
      passenger_count: 1,
      passenger_count_child: 0,
      airport_coefficient: 1,
    });

  this.bookingForm = this.fb.group({
    pickup_place: '',
    dest_place: '',
    pickup_full: ['', Validators.required],
    dest_full: ['', Validators.required],
    pickup_short: '',
    dest_short: '',
    pickup_lat: '',
    pickup_lng: '',
    dest_lat: '',
    dest_lng: '',

    car_type: '', 
    amount: 0,
    return_trip_amount: 0,
    currency_code: 'EUR', 
    distance: 0,
    driving_duration: 0,

    transfer_date: ['', Validators.required],
    transfer_time: ['', Validators.required],
    flight_number: '',
    is_round_trip: [false],
    return_transfer_date: [''],
    return_transfer_time: [''],
    need_child_seat: [false],
    child_seat_count: 0,
    
    greet_with_champagne: [false],
    greet_with_flower: [false],
    passenger_name: ['', Validators.required],
    passenger_email: '',
    // passenger_email: ['', [Validators.required, Validators.email]],
    passenger_phone: ['', Validators.required],
    passenger_additional_phone: [''],
    passenger_count: 1,
    passenger_count_child: 0,
    note: [''],
    airport_coefficient: 1,
  });

  }  

  createBooking(reservation: Reservation): Observable<any> {
    return this.http.post<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}`, reservation);
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
