import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-booking-completion',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: './booking-completion.component.html',
  styleUrl: './booking-completion.component.scss'
})
export class BookingCompletionComponent implements OnInit {
  bookingCompletionForm!: FormGroup;

  // Mock data for reservation details (these would typically come from a service or state)
  selectedCar = {
    name: 'Mercedes Vito',
    price: 50,
    image: 'assets/images/vito.jpg'
  };
  fromLocation = 'Antalya Airport';
  toLocation = 'Lara Beach';
  distance = 20; // in km
  passengerCount = 3;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  // Initialize the form
  initForm(): void {
    this.bookingCompletionForm = this.fb.group({
      transferDate: ['', Validators.required],
      transferTime: ['', Validators.required],
      flightNumber: ['', Validators.required],
      returnTrip: [false],
      returnDate: [''],
      returnTime: [''],
      greeter: [false],
      childSeat: [false],
      extraLuggage: [false],
      note: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      additionalPhone: ['']
    });

    // Ensure the return fields are updated based on the "returnTrip" checkbox
    this.toggleReturnFields();
  }

  // Toggle the validators for return trip fields
  toggleReturnFields(): void {
    const returnDateControl = this.bookingCompletionForm.get('returnDate');
    const returnTimeControl = this.bookingCompletionForm.get('returnTime');
    const isReturnTrip = this.bookingCompletionForm.get('returnTrip')?.value;

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

  // Handle form submission
  onSubmit(): void {
    if (this.bookingCompletionForm.valid) {
      const reservationData = {
        ...this.bookingCompletionForm.value,
        selectedCar: this.selectedCar,
        fromLocation: this.fromLocation,
        toLocation: this.toLocation,
        distance: this.distance,
        price: this.selectedCar.price * (this.bookingCompletionForm.get('returnTrip')?.value ? 2 : 1)
      };

      console.log('Reservation Data:', reservationData);
      // Send data to a backend API or navigate to a confirmation page
    } else {
      console.log('Form is invalid');
    }
  }
}
