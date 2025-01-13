import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { GmapsAutocompleteDirective } from '../../directives/gmaps-autocomplete.directive';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'app-booking-initial-form',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
    GmapsAutocompleteDirective, 
  ],
  templateUrl: './booking-initial-form.component.html',
  styleUrl: './booking-initial-form.component.scss'
})
export class BookingInitialFormComponent implements OnInit {
  bookingService = inject(BookingService);
  stepsInfo = input<any>();
  searchVehicle = output<any>();

  constructor(
    private fb: FormBuilder, 
    private googleMapsService: GoogleMapsService, 
  ) {
    
    effect(() => {
      console.log('Steps Info in booking form:', this.stepsInfo());
    });
  }

  ngOnInit(): void {
    this.toggleReturnTrip(); // Ensure return fields are updated on initialization
  }

  toggleReturnTrip(): void {
    const returnDateControl = this.bookingService.bookingInitialForm.get('returnDate');
    const returnTimeControl = this.bookingService.bookingInitialForm.get('returnTime');
    const isReturnTrip = this.bookingService.bookingInitialForm.get('returnTrip')?.value;

    if (isReturnTrip) {
      returnDateControl?.setValidators(Validators.required);
      returnTimeControl?.setValidators(Validators.required);
    } else {
      returnDateControl?.clearValidators();
      returnTimeControl?.clearValidators();
    }

    returnDateControl?.updateValueAndValidity();
    returnTimeControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    console.log('Booking Form:', this.bookingService.bookingInitialForm.value);
    const pickupLat: number = this.bookingService.bookingInitialForm.get('pickup_lat')?.value;
    const pickupLng: number = this.bookingService.bookingInitialForm.get('pickup_lng')?.value;
    const destLat: number = this.bookingService.bookingInitialForm.get('dest_lat')?.value;
    const destLng: number = this.bookingService.bookingInitialForm.get('dest_lng')?.value;
  
    const origin: google.maps.LatLngLiteral = { lat: pickupLat, lng: pickupLng };
    const destination: google.maps.LatLngLiteral = { lat: destLat, lng: destLng };

    this.googleMapsService.calculateDrivingDistanceAndTime(origin, destination
    ).then(result => {
      this.bookingService.bookingCarTypeSelectionForm.get('distance')?.setValue(
        result.distance);
      this.bookingService.bookingCarTypeSelectionForm.get('driving_duration')?.setValue(
        result.duration);
    }).catch(error => {
      console.error('Error calculating distance:', error);
    });

    if (this.bookingService.bookingInitialForm.valid) {
      console.log('Booking Details:', this.bookingService.bookingInitialForm.value);
      // Handle booking submission logic here

      this.searchVehicle.emit(this.bookingService.bookingInitialForm.value);
    } else {
      console.log('bookingInitialForm is invalid');
    }
  }

  onPickupPlaceChanged(place: google.maps.places.PlaceResult): void {
    console.log('Pickup place selected:', place);
    const pickup_full = this.googleMapsService.getFormattedAddress(place);
    const pickup_lat = this.googleMapsService.getLatitude(place);
    const pickup_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      pickup_full: pickup_full, pickup_lat: pickup_lat, pickup_lng: pickup_lng
    });
  }

  onDestPlaceChanged(place: google.maps.places.PlaceResult): void {
    console.log('Destination place selected:', place);
    const dest_full = this.googleMapsService.getFormattedAddress(place);
    const dest_lat = this.googleMapsService.getLatitude(place);
    const dest_lng = this.googleMapsService.getLongitude(place);
    this.bookingService.bookingInitialForm.patchValue({
      dest_full: dest_full, dest_lat: dest_lat, dest_lng: dest_lng
    });
  }

  preventFormSubmit(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the form from submitting
    }
  }
}
