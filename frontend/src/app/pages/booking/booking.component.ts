import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { VehicleListComponent } from '../../components/vehicle-list/vehicle-list.component';
import { BookingFormComponent } from '../../components/booking-form/booking-form.component';
import { BookingCompletionComponent } from '../../components/booking-completion/booking-completion.component';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';

@Component({
  selector: 'app-booking',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    BookingFormComponent, VehicleListComponent, 
    BookingCompletionComponent, 
    ButtonModule, StepperModule, 
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent {

}
