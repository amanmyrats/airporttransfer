import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reservation } from '../admin/models/reservation.model';
import { Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';
import { GoogleMapsLoaderService } from './google-maps-loader.service';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  endPoint: string = "transfer/"

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
    private http: HttpClient,
    private googleMapsLoader: GoogleMapsLoaderService,
  ) { 

    // Get tomorrow's date (in YYYY-MM-DD format)
    const today = new Date();
    // const dayAfterTomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1); // Add 1 day to current date
    // dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2); // Add 2 day to current date
    const formattedToday = today.toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)
    // const formattedDayAfterTomorrow = dayAfterTomorrow.toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)


    // Get current time (in HH:mm format)
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // Ensure two-digit format
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two-digit format
    const formattedTime = `${hours}:${minutes}`;

        

    this.bookingInitialForm = this.fb.group({
      pickup_place: '',
      dest_place: '',
      pickup_full: [{ value: '', disabled: true }, Validators.required],
      dest_full: [{ value: '', disabled: true }, Validators.required],
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
      is_switched_route: 0,
      is_from_popular_routes: 0,
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
      pickup_full: '', 
      dest_full: '',
      transfer_date: [formattedToday, Validators.required],
      transfer_time: [formattedTime, Validators.required],
      flight_number: '',
      is_round_trip: [false],
      return_transfer_date: [formattedToday],
      return_transfer_time: [formattedTime],
      return_flight_number: '',
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
      direction_type: 'ARR'
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
    return_flight_number: '',
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
    direction_type: 'ARR'
  });

    // this.googleMapsLoader.state$.subscribe((state) => {
      // this.toggleInitialFormControls(state.status === 'ready');
    // });
      this.toggleInitialFormControls(true);

  }  

  private toggleInitialFormControls(enable: boolean): void {
    const pickupControl = this.bookingInitialForm.get('pickup_full');
    const destControl = this.bookingInitialForm.get('dest_full');

    if (!pickupControl || !destControl) {
      return;
    }

    if (enable) {
      if (pickupControl.disabled) {
        pickupControl.enable({ emitEvent: false });
      }
      if (destControl.disabled) {
        destControl.enable({ emitEvent: false });
      }
    } else {
      if (pickupControl.enabled) {
        pickupControl.disable({ emitEvent: false });
      }
      if (destControl.enabled) {
        destControl.disable({ emitEvent: false });
      }
    }
  }

  createBooking(reservation: Reservation): Observable<any> {
    return this.http.post<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}bookingcreate/`, reservation);
  }

  updateBooking(id: string, reservation: Reservation): Observable<any> {
    return this.http.put<any>(`${env.baseUrl}${env.apiV1}${this.endPoint}bookingupdate/${id}/`, reservation);
  }


  mergeForms(): void {
    // patch the form values
    this.bookingForm.patchValue({
      ...this.bookingInitialForm.value,
      ...this.bookingCarTypeSelectionForm.value,
      ...this.bookingCompletionForm.value,
    });
  }

  applyStepOneParams(params: Params): void {
    this.bookingInitialForm.patchValue({
      pickup_short: params['pickup_short'] ?? this.bookingInitialForm.get('pickup_short')?.value,
      dest_short: params['dest_short'] ?? this.bookingInitialForm.get('dest_short')?.value,
      pickup_full: params['pickup_full'] ?? this.bookingInitialForm.get('pickup_full')?.value,
      pickup_lat: params['pickup_lat'] ?? this.bookingInitialForm.get('pickup_lat')?.value,
      pickup_lng: params['pickup_lng'] ?? this.bookingInitialForm.get('pickup_lng')?.value,
      dest_full: params['dest_full'] ?? this.bookingInitialForm.get('dest_full')?.value,
      dest_lat: params['dest_lat'] ?? this.bookingInitialForm.get('dest_lat')?.value,
      dest_lng: params['dest_lng'] ?? this.bookingInitialForm.get('dest_lng')?.value,
      is_from_popular_routes: params['is_from_popular_routes'] === '1' || params['is_from_popular_routes'] === 1,
      is_switched_route: params['is_switched_route'] ?? this.bookingInitialForm.get('is_switched_route')?.value,
    });
  }

  applyDistanceParams(params: Params): void {
    const distance = params['distance'];
    const drivingDuration = params['driving_duration'];
    this.bookingCarTypeSelectionForm.patchValue({
      distance: typeof distance === 'string' ? Number(distance) || 0 : distance ?? this.bookingCarTypeSelectionForm.get('distance')?.value,
      driving_duration: typeof drivingDuration === 'string' ? Number(drivingDuration) || 0 : drivingDuration ?? this.bookingCarTypeSelectionForm.get('driving_duration')?.value,
    });
    if (params['airport_coefficient']) {
      const coefficient = typeof params['airport_coefficient'] === 'string'
        ? Number(params['airport_coefficient']) || 1
        : params['airport_coefficient'];
      this.bookingInitialForm.get('airport_coefficient')?.setValue(coefficient);
      this.airportCoefficient.set(coefficient);
    }
  }

  applyStepTwoParams(params: Params): void {
    this.bookingCarTypeSelectionForm.patchValue({
      car_type: params['car_type'] ?? this.bookingCarTypeSelectionForm.get('car_type')?.value,
      amount: typeof params['amount'] === 'string' ? Number(params['amount']) || 0 : params['amount'] ?? this.bookingCarTypeSelectionForm.get('amount')?.value,
      currency_code: params['currency_code'] ?? this.bookingCarTypeSelectionForm.get('currency_code')?.value,
    });
  }
}
