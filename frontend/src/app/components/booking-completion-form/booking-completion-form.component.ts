import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-booking-completion-form',
  imports: [
    CommonModule, 
    FormsModule, ReactiveFormsModule, 
    ButtonModule, MessageModule, 
  ],
  templateUrl: './booking-completion-form.component.html',
  styleUrl: './booking-completion-form.component.scss'
})
export class BookingCompletionFormComponent implements OnInit {
  bookingService = inject(BookingService);

  stepsInfo = input<any>();
  previousStep = output<any>();

  isSaving = false;
  hasSubmitted = false;

  // Mock data for reservation details (these would typically come from a service or state)
  selectedCar = {
    name: 'Mercedes Vito',
    price: 50, 
    currency_code: 'EUR', 
    image: 'assets/images/vito.jpg'
  };
  fromLocation = 'Antalya Airport';
  toLocation = 'Lara Beach';
  distance = 20; // in km
  passengerCount = 3;

  constructor(
    private fb: FormBuilder, 
    private router: Router,  
    private languageService: LanguageService, 
  ) {
    effect(() => {
      console.log('Steps Info in completion:', this.stepsInfo());
    });
  }

  ngOnInit(): void {

    // Ensure the return fields are updated based on the "returnTrip" checkbox
    this.toggleReturnFields();
  }

  // Toggle the validators for return trip fields
  toggleReturnFields(): void {
    const returnDateControl = this.bookingService.bookingCompletionForm.get('returnDate');
    const returnTimeControl = this.bookingService.bookingCompletionForm.get('returnTime');
    const isReturnTrip = this.bookingService.bookingCompletionForm.get('returnTrip')?.value;

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
    this.hasSubmitted = true;
    console.log('Booking Completion Form:', this.bookingService.bookingCompletionForm.value);
    console.log(this.bookingService.bookingCompletionForm.value);
    // add 2 other forms into this.bookingService.bookingCompletionForm
    this.bookingService.mergeForms();
    console.log('Merged form:', this.bookingService.bookingForm.value);
    if (this.bookingService.bookingForm.valid) {
      this.isSaving = true;
      console.log('Form is valid');
      this.bookingService.createBooking(
        this.bookingService.bookingForm.value).subscribe({
          next: (response) => {
            console.log('Reservation created successfully:', response);
            this.isSaving = false;
            this.router.navigate([`${this.languageService.currentLang().code}/booking/received`]);
          },
          error: (error) => {
            console.error('Error creating reservation:', error);
            this.isSaving = false;
          }
        });
      // Send data to a backend API or navigate to a confirmation page
    } else {
      console.log('Form is invalid');
    }
  }

  goToPreviousStep(): void {
    this.previousStep.emit(this.bookingService.bookingCompletionForm.value);
  }
}
