import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

import { ReviewsService } from '../../../services/client/reviews.service';
import { LanguageService } from '../../../services/language.service';
import { MyReview, ReviewStatus, UpdateReviewPayload } from '../../models/review.models';

const TITLE_MAX_LENGTH = 120;
const COMMENT_MAX_LENGTH = 4000;
const EDIT_WINDOW_MS = 15 * 60 * 1000;

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Pending review',
  published: 'Published',
  rejected: 'Rejected',
};

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    ToastModule,
    TagModule,
  ],
  providers: [MessageService],
  templateUrl: './review-detail.component.html',
  styleUrl: './review-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDetailComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly messages = inject(MessageService);

  private readonly destroy$ = new Subject<void>();

  readonly review = this.reviewsService.currentReview;
  readonly loading = this.reviewsService.currentReviewLoading;

  readonly form = this.fb.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    title: ['', [Validators.maxLength(TITLE_MAX_LENGTH)]],
    comment: ['', [Validators.maxLength(COMMENT_MAX_LENGTH)]],
  });

  readonly isEditable = computed(() => {
    const value = this.review();
    if (!value) {
      return false;
    }
    const createdAt = new Date(value.created_at).getTime();
    return Date.now() - createdAt <= EDIT_WINDOW_MS;
  });

  readonly commentCharsLeft = computed(() => COMMENT_MAX_LENGTH - (this.form.controls.comment.value?.length ?? 0));
  private readonly currentLang = computed(() => this.languageService.extractLangFromUrl(this.router.url));

  constructor() {
    effect(() => {
      const data = this.review();
      if (!data) {
        return;
      }
      this.form.patchValue(
        {
          rating: data.rating,
          title: data.title ?? '',
          comment: data.comment ?? '',
        },
        { emitEvent: false },
      );
      if (!this.isEditable()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) {
        this.messages.add({ severity: 'error', summary: 'Invalid review', detail: 'Review ID is missing.' });
        return;
      }
      this.reviewsService.getMine(id).subscribe({
        error: () => {
          this.messages.add({ severity: 'error', summary: 'Not found', detail: 'Review could not be loaded.' });
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.reviewsService.clearCurrent();
  }

  statusLabel(status: ReviewStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  reservationLabel(review: MyReview | null): string {
    if (!review) {
      return '';
    }
    const summary = review.reservation_obj;
    if (!summary) {
      return `Reservation #${review.reservation_id}`;
    }
    const pickup = summary.pickup ?? 'Pickup';
    const destination = summary.destination ?? 'Destination';
    return `${pickup} → ${destination}`;
  }

  submit(): void {
    const review = this.review();
    if (!review) {
      return;
    }
    if (!this.isEditable()) {
      this.messages.add({ severity: 'warn', summary: 'Edit window closed', detail: 'Reviews can only be edited within 15 minutes.' });
      return;
    }
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UpdateReviewPayload = {
      rating: this.form.controls.rating.value,
      title: this.form.controls.title.value?.trim() || undefined,
      comment: this.form.controls.comment.value?.trim() || undefined,
    };

    this.reviewsService.update(review.id, payload).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Review updated', detail: 'Thanks for keeping your feedback current.' });
        this.reviewsService.listMine().subscribe();
      },
      error: (error) => {
        const detail = error?.error?.detail || 'Could not update your review.';
        this.messages.add({ severity: 'error', summary: 'Update failed', detail });
      },
    });
  }

  backToList(): void {
    this.router.navigate(this.languageService.commandsWithLang(this.currentLang(), 'account', 'reviews')).catch(() => {});
  }

  titleMaxLength(): number {
    return TITLE_MAX_LENGTH;
  }

  commentMaxLength(): number {
    return COMMENT_MAX_LENGTH;
  }
}
