import { Component, Input } from '@angular/core';
import { Reservation } from '../../models/reservation.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-reservation-pdf',
    imports: [
      CommonModule, 
    ],
    templateUrl: './reservation-pdf.component.html',
    styleUrl: './reservation-pdf.component.scss'
})
export class ReservationPdfComponent {
  @Input() reservation!: Reservation;
}
