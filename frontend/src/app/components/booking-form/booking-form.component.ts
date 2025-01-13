import { CommonModule } from '@angular/common';
import { Component, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking-form',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit {
  searchVehicle = output<any>();
  bookingForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
  ) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      from: '',
      to: '',
      // date: '',
      // time: '',
      // passengerCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      // returnTrip: [false],
      // returnDate: [''],
      // returnTime: [''],
    });

    this.toggleReturnTrip(); // Ensure return fields are updated on initialization

  }

  toggleReturnTrip(): void {
    const returnDateControl = this.bookingForm.get('returnDate');
    const returnTimeControl = this.bookingForm.get('returnTime');
    const isReturnTrip = this.bookingForm.get('returnTrip')?.value;

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
    console.log('Booking Form:', this.bookingForm.value);
    if (this.bookingForm.valid) {
      console.log('Booking Details:', this.bookingForm.value);
      // Handle booking submission logic here
    }
    this.searchVehicle.emit(this.bookingForm.value);
  }
}
