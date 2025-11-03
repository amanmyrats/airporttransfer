import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs/operators';

import { ReviewsService } from '../../../services/client/reviews.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reviewsService = inject(ReviewsService);
  private readonly languageService = inject(LanguageService);

  readonly reservationId = signal('');
  readonly canReview = computed(() => {
    const id = Number(this.reservationId());
    if (!id) {
      return false;
    }
    return !this.reviewsService.myReviews().some(review => review.reservation_id === id);
  });

  constructor() {
    this.route.paramMap.pipe(take(1)).subscribe(params => {
      this.reservationId.set(params.get('id') ?? '');
    });

    if (this.reviewsService.myReviews().length === 0) {
      this.reviewsService.listMine().subscribe();
    }
  }

  reviewLink(): any[] {
    const id = this.reservationId();
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    return this.languageService.commandsWithLang(lang, 'account', 'reviews', 'new', id);
  }

  listLink(): any[] {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    return this.languageService.commandsWithLang(lang, 'account', 'reservations');
  }
}
