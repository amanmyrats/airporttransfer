import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation-detail',
  imports: [],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss'
})
export class ReservationDetailComponent implements OnInit {
  @Input() reservation!: Reservation;
  @Input() isForCustomer: boolean = true;

  constructor(
    private config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    this.reservation = this.config.data.reservation;
    if (this.reservation) {
      this.reservation = this.reservation;
    }
  }
}
