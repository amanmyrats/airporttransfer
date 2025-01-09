import { Component, Input } from '@angular/core';
import { Reservation } from '../../models/reservation.model';

@Component({
    selector: 'app-reservation-pdf',
    imports: [],
    templateUrl: './reservation-pdf.component.html',
    styleUrl: './reservation-pdf.component.scss'
})
export class ReservationPdfComponent {
  @Input() reservation!: Reservation;
}
