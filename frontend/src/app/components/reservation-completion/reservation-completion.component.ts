import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reservation-completion',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: './reservation-completion.component.html',
  styleUrl: './reservation-completion.component.scss'
})
export class ReservationCompletionComponent implements OnInit {
  reservationForm!: FormGroup;

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
    this.reservationForm = this.fb.group({
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
    const returnDateControl = this.reservationForm.get('returnDate');
    const returnTimeControl = this.reservationForm.get('returnTime');
    const isReturnTrip = this.reservationForm.get('returnTrip')?.value;

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
    if (this.reservationForm.valid) {
      const reservationData = {
        ...this.reservationForm.value,
        selectedCar: this.selectedCar,
        fromLocation: this.fromLocation,
        toLocation: this.toLocation,
        distance: this.distance,
        price: this.selectedCar.price * (this.reservationForm.get('returnTrip')?.value ? 2 : 1)
      };

      console.log('Reservation Data:', reservationData);
      // Send data to a backend API or navigate to a confirmation page
    } else {
      console.log('Form is invalid');
    }
  }
}
