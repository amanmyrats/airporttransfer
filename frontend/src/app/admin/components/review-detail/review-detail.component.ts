import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputTextarea } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import {
  AdminReview,
  ReviewReply,
} from '../../../account/models/review.models';
import { ReviewsService } from '../../services/reviews.service';

interface ReviewDetailData {
  reviewId: number;
  review?: AdminReview;
  onReviewUpdate?: (review: AdminReview) => void;
}

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    TagModule,
    DividerModule,
    InputTextarea,
    TooltipModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './review-detail.component.html',
  styleUrl: './review-detail.component.scss',
})
export class ReviewDetailComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly reviewsService = inject(ReviewsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  reviewId = 0;
  review: AdminReview | null = null;

  loadingReview = false;
  loadingReplies = false;
  savingReply = false;
  moderationLoading = false;
  flagLoading = false;

  replies: ReviewReply[] = [];

  readonly replyForm = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.minLength(3)]],
  });

  private readonly onReviewUpdate?: (review: AdminReview) => void;

  constructor() {
    const data = (this.config.data ?? {}) as ReviewDetailData;
    if (!data.reviewId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing review',
        detail: 'A review identifier is required.',
      });
      this.ref.close();
      return;
    }

    this.reviewId = data.reviewId;
    this.review = data.review ?? null;
    this.onReviewUpdate = typeof data.onReviewUpdate === 'function' ? data.onReviewUpdate : undefined;
  }

  ngOnInit(): void {
    this.loadReview();
    this.loadReplies();
  }

  loadReview(): void {
    this.loadingReview = true;
    this.reviewsService
      .getAdmin(this.reviewId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: review => {
          this.review = review;
          this.onReviewUpdate?.(review);
          this.loadingReview = false;
        },
        error: error => {
          console.error('Failed to load review details', error);
          this.loadingReview = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Unable to load review',
            detail: 'Please try again later.',
          });
        },
      });
  }

  loadReplies(): void {
    this.loadingReplies = true;
    this.reviewsService
      .listReviewReplies(this.reviewId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.replies = response.results ?? [];
          this.loadingReplies = false;
        },
        error: error => {
          console.error('Failed to load review replies', error);
          this.loadingReplies = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Unable to load replies',
            detail: 'Please refresh and try again.',
          });
        },
      });
  }

  getStatusSeverity(status: string): 'info' | 'success' | 'warn' | 'danger' | 'contrast' | 'secondary' {
    switch (status) {
      case 'published':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
      default:
        return 'info';
    }
  }

  submitReply(): void {
    if (this.replyForm.invalid) {
      this.replyForm.markAllAsTouched();
      return;
    }
    const body = this.replyForm.value.body?.trim();
    if (!body) {
      return;
    }
    this.savingReply = true;
    this.reviewsService
      .createReviewReply({
        review: this.reviewId,
        body,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: reply => {
          this.replies = [reply, ...this.replies];
          this.replyForm.reset({ body: '' });
          this.savingReply = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Reply posted',
            detail: 'Your response is now visible internally.',
          });
        },
        error: error => {
          console.error('Failed to create reply', error);
          this.savingReply = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Unable to post reply',
            detail: 'Please try again.',
          });
        },
      });
  }

  confirmDeleteReply(reply: ReviewReply): void {
    this.confirmationService.confirm({
      header: 'Delete reply',
      message: 'Are you sure you want to delete this reply?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => this.deleteReply(reply),
    });
  }

  publishReview(): void {
    if (this.review?.status === 'published' || this.moderationLoading) {
      return;
    }
    this.moderationLoading = true;
    this.reviewsService
      .publishAdminReview(this.reviewId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.review = updated;
          this.onReviewUpdate?.(updated);
          this.moderationLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Review published',
            detail: 'This review is now visible on the website.',
          });
        },
        error: error => {
          console.error('Failed to publish review', error);
          this.moderationLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Publish failed',
            detail: 'Please try again later.',
          });
        },
      });
  }

  rejectReview(): void {
    if (this.review?.status === 'rejected' || this.moderationLoading) {
      return;
    }
    this.confirmationService.confirm({
      header: 'Reject review',
      message: 'Rejecting hides the review from public pages. Continue?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.moderationLoading = true;
        this.reviewsService
          .rejectAdminReview(this.reviewId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: updated => {
              this.review = updated;
              this.onReviewUpdate?.(updated);
              this.moderationLoading = false;
              this.messageService.add({
                severity: 'info',
                summary: 'Review rejected',
                detail: 'The review has been removed from public view.',
              });
            },
            error: error => {
              console.error('Failed to reject review', error);
              this.moderationLoading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Reject failed',
                detail: 'Please try again.',
              });
            },
          });
      },
    });
  }

  toggleFlag(): void {
    if (this.flagLoading) {
      return;
    }
    this.flagLoading = true;
    const action$ = this.review?.is_flagged
      ? this.reviewsService.unflagAdminReview(this.reviewId)
      : this.reviewsService.flagAdminReview(this.reviewId);

    action$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.review = updated;
          this.onReviewUpdate?.(updated);
          this.flagLoading = false;
          this.messageService.add({
            severity: updated.is_flagged ? 'warn' : 'success',
            summary: updated.is_flagged ? 'Review flagged' : 'Flag removed',
            detail: updated.is_flagged
              ? 'Marked for follow-up.'
              : 'This review is no longer flagged.',
          });
        },
        error: error => {
          console.error('Failed to toggle flag', error);
          this.flagLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Flag update failed',
            detail: 'Please try again.',
          });
        },
      });
  }

  navigateToReservation(): void {
    const reservationNumber = this.review?.reservation_obj?.number;
    if (!reservationNumber) {
      return;
    }
    this.router.navigate(['/admin/reservations'], {
      queryParams: { search: reservationNumber },
    });
    this.closeDialog();
  }

  closeDialog(): void {
    this.ref.close({
      updatedReview: this.review ?? undefined,
    });
  }

  trackReply(_index: number, reply: ReviewReply): number {
    return reply.id;
  }

  private deleteReply(reply: ReviewReply): void {
    this.reviewsService
      .deleteReviewReply(reply.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.replies = this.replies.filter(item => item.id !== reply.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Reply deleted',
            detail: 'The reply has been removed.',
          });
        },
        error: error => {
          console.error('Failed to delete reply', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Deletion failed',
            detail: 'Please try again.',
          });
        },
      });
  }
}
