import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { BookingInitialFormComponent } from '../../components/booking-initial-form/booking-initial-form.component';
import { BookingCompletionFormComponent } from '../../components/booking-completion-form/booking-completion-form.component';
import { BookingCarTypeSelectionFormComponent } from '../../components/booking-car-type-selection-form/booking-car-type-selection-form.component';

@Component({
  selector: 'app-booking',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    ButtonModule, StepperModule, 
    BookingInitialFormComponent, 
    BookingCarTypeSelectionFormComponent, 
    BookingCompletionFormComponent, 
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  activeStep: number = 1;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  goToStep(event: any, fromStep: number, toStep: number): void {
    console.log('Navigating fromStep:', fromStep);
    console.log('Navigating toStep:', toStep);
    console.log('Event:', event);
    this.activeStep = toStep;
  }

}
