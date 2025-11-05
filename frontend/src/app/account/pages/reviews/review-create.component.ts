import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { RatingModule } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';

import { ReviewsService } from '../../../admin/services/reviews.service';
import { LanguageService } from '../../../services/language.service';
import { CreateReviewPayload } from '../../models/review.models';

const TITLE_MAX_LENGTH = 120;
const COMMENT_MAX_LENGTH = 4000;

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    RatingModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './review-create.component.html',
  styleUrl: './review-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCreateComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly messages = inject(MessageService);

  private readonly destroy$ = new Subject<void>();

  private readonly currentLang = computed(() => this.languageService.extractLangFromUrl(this.router.url));

  readonly reservationId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly form = this.fb.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    title: ['', [Validators.maxLength(TITLE_MAX_LENGTH)]],
    comment: ['', [Validators.maxLength(COMMENT_MAX_LENGTH)]],
  });

  readonly commentCharsLeft = computed(() => COMMENT_MAX_LENGTH - (this.form.controls.comment.value?.length ?? 0));

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const value = Number(params.get('reservationId'));
      this.reservationId.set(Number.isFinite(value) ? value : null);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.reviewsService.clearCurrent();
  }

  submit(): void {
    const reservation = this.reservationId();
    if (!reservation) {
      this.messages.add({ severity: 'error', summary: 'Missing reservation', detail: 'Reservation is required.' });
      return;
    }

    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateReviewPayload = {
      reservation,
      rating: this.form.controls.rating.value,
      title: this.form.controls.title.value?.trim() || undefined,
      comment: this.form.controls.comment.value?.trim() || undefined,
    };

    this.setSubmittingState(true);
    this.reviewsService.create(payload).subscribe({
      next: () => {
        this.setSubmittingState(false);
        this.messages.add({ severity: 'success', summary: 'Review submitted', detail: 'Thanks for sharing your experience!' });
        this.reviewsService.listMine().subscribe();
        this.router
          .navigate(this.languageService.commandsWithLang(this.currentLang(), 'account', 'reviews'))
          .catch(() => {});
      },
      error: (error) => {
        this.setSubmittingState(false);
        this.messages.add({
          severity: 'error',
          summary: 'Submission failed',
          detail: this.resolveErrorMessage(error),
        });
      },
    });
  }

  cancel(): void {
    this.router.navigate(this.languageService.commandsWithLang(this.currentLang(), 'account', 'reviews')).catch(() => {});
  }

  titleMaxLength(): number {
    return TITLE_MAX_LENGTH;
  }

  commentMaxLength(): number {
    return COMMENT_MAX_LENGTH;
  }

  private setSubmittingState(isSubmitting: boolean): void {
    this.submitting.set(isSubmitting);
    if (isSubmitting) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  private resolveErrorMessage(error: unknown): string {
    const fallback = 'Could not save your review.';
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const response = (error as HttpErrorResponse).error ?? error;

    if (!response) {
      return fallback;
    }

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response.detail === 'string') {
      return response.detail;
    }

    for (const value of Object.values(response)) {
      if (!value) {
        continue;
      }

      if (Array.isArray(value) && value.length) {
        const message = value.find(item => typeof item === 'string');
        if (message) {
          return message;
        }
      }

      if (typeof value === 'string') {
        return value;
      }
    }

    return fallback;
  }
}
