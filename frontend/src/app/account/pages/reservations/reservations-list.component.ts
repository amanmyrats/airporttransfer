import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule],
  templateUrl: './reservations-list.component.html',
  styleUrl: './reservations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsListComponent {
  readonly reservations = [
    { id: 1, title: 'IST → Hotel', status: 'Confirmed', date: '2024-07-01' },
    { id: 2, title: 'AYT → Airport', status: 'Pending', date: '2024-07-12' },
  ];
}
