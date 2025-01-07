import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reservation-form',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  bookingForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
  ) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      passengerCount: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      returnTrip: [false],
      returnDate: [''],
      returnTime: [''],
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
    if (this.bookingForm.valid) {
      console.log('Booking Details:', this.bookingForm.value);
      // Handle booking submission logic here
    }
  }
}
