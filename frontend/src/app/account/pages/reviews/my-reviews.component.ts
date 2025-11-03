import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { ReviewsService } from '../../../services/client/reviews.service';
import { LanguageService } from '../../../services/language.service';
import { MyReview, ReviewStatus } from '../../models/review.models';

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Pending review',
  published: 'Published',
  rejected: 'Rejected',
};

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, DatePipe],
  templateUrl: './my-reviews.component.html',
  styleUrl: './my-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReviewsComponent implements OnInit {
  private readonly reviewsService = inject(ReviewsService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  readonly reviews = this.reviewsService.myReviews;
  readonly loading = this.reviewsService.myReviewsLoading;
  readonly meta = this.reviewsService.myReviewsMeta;

  readonly currentLang = computed(() => this.languageService.extractLangFromUrl(this.router.url));

  ngOnInit(): void {
    this.reviewsService.listMine().subscribe();
  }

  trackByReviewId(_: number, review: MyReview): number {
    return review.id;
  }

  statusLabel(status: ReviewStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  detailLink(review: MyReview): any[] {
    return this.languageService.commandsWithLang(
      this.currentLang(),
      'account',
      'reviews',
      String(review.id),
    );
  }

  reviewReservationLabel(review: MyReview): string {
    const reservation = review.reservation_obj;
    if (!reservation) {
      return `Reservation #${review.reservation_id}`;
    }
    const pickup = reservation.pickup ?? 'Pickup';
    const destination = reservation.destination ?? 'Destination';
    return `${pickup} → ${destination}`;
  }

  refresh(): void {
    if (this.loading()) {
      return;
    }
    this.reviewsService.listMine().subscribe();
  }
}

