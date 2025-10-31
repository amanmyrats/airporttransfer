import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetailComponent {
  reservationId = '';

  constructor(private readonly route: ActivatedRoute) {
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      this.reservationId = params.get('id') ?? '';
    });
  }
}
