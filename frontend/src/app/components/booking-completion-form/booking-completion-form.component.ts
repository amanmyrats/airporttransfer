import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { MessageModule } from 'primeng/message';
import { CarTypeService } from '../../services/car-type.service';
import { CurrencyService } from '../../services/currency.service';

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
  carTypeService = inject(CarTypeService);
  currencyService = inject(CurrencyService);

  stepFromUrl: number | null = null;

  previousStep = output<any>();

  isSaving = false;
  hasSubmitted = false;

  // Mock data for reservation details (these would typically come from a service or state)
  selectedCar = this.carTypeService.getCarTypeByCode(
    this.bookingService.bookingCarTypeSelectionForm.get('car_type')?.value
  ) 
  price = this.bookingService.bookingCarTypeSelectionForm.get('amount')?.value;
  currency = this.currencyService.getCurrencyByCode(
    this.bookingService.bookingCarTypeSelectionForm.get('currency_code')?.value
  )
  fromLocation = this.bookingService.bookingInitialForm.get('pickup_full')?.value;
  toLocation = this.bookingService.bookingInitialForm.get('dest_full')?.value;
  distance = this.bookingService.bookingCarTypeSelectionForm.get('distance')?.value;
  passengerCount = 333;

  constructor(
    private fb: FormBuilder, 
    private router: Router,  
    private languageService: LanguageService, 
    private route: ActivatedRoute, 
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.stepFromUrl = params['step'];
    });

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
