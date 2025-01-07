import { Component } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ReservationFormComponent } from '../../components/reservation-form/reservation-form.component';
import { VehicleListComponent } from '../../components/vehicle-list/vehicle-list.component';
import { ReservationCompletionComponent } from '../../components/reservation-completion/reservation-completion.component';

@Component({
  selector: 'app-reservation',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    ReservationFormComponent, VehicleListComponent, 
    ReservationCompletionComponent, 
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent {

}
