import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ReviewsService } from '../../services/reviews.service';
import { AdminReview, PaginatedResponse } from '../../../account/models/review.models';
import { SharedPaginatorComponent } from '../../components/shared-paginator/shared-paginator.component';
import { environment as env } from '../../../../environments/environment';
import { LazyLoadParams } from '../../../interfaces/custom-lazy-load-event';
import { ReviewDetailComponent } from '../../components/review-detail/review-detail.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    SharedPaginatorComponent,
  ],
  providers: [MessageService, ConfirmationService, DialogService],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.scss',
})
export class ReviewListComponent implements OnInit {
  readonly defaultOrdering = '-created_at';

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusOptions = [
    { label: 'All statuses', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Published', value: 'published' },
    { label: 'Rejected', value: 'rejected' },
  ];

  readonly flaggedOptions = [
    { label: 'All reviews', value: '' },
    { label: 'Flagged only', value: 'true' },
    { label: 'Not flagged', value: 'false' },
  ];

  readonly orderingOptions = [
    { label: 'Newest first', value: '-created_at' },
    { label: 'Oldest first', value: 'created_at' },
    { label: 'Highest rating', value: '-rating' },
    { label: 'Lowest rating', value: 'rating' },
  ];

  readonly pageSizeOptions = [10, 20, 50, 100];

  readonly filterForm = this.fb.nonNullable.group({
    search: [''],
    status: [''],
    is_flagged: [''],
    min_rating: [''],
    max_rating: [''],
    ordering: [this.defaultOrdering],
  });

  showDetailedFilters = false;

  reviews: AdminReview[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = env.pagination.defaultPageSize;
  processingReviewIds = new Set<number>();
  detailRef: DynamicDialogRef | null = null;
  currentDialogReviewId: number | null = null;
  pendingDialogReviewId: number | null = null;
  private suppressQuerySync = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly reviewsService: ReviewsService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.applyQueryParams(params));
  }

  onSubmitFilters(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onResetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      is_flagged: '',
      min_rating: '',
      max_rating: '',
      ordering: this.defaultOrdering,
    });
    this.currentPage = 1;
    this.pageSize = env.pagination.defaultPageSize;
    this.updateQueryParams();
  }

  handlePageChange(event: LazyLoadParams): void {
    if (typeof event.first !== 'number' || typeof event.rows !== 'number') {
      return;
    }
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.updateQueryParams();
  }

  handleOrderingChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  isProcessing(id: number): boolean {
    return this.processingReviewIds.has(id);
  }

  openReviewDetails(review: AdminReview): void {
    this.pendingDialogReviewId = review.id;
    this.showReviewDialog(review.id, review);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.route.snapshot.queryParams,
        review_id: review.id,
      },
      queryParamsHandling: 'merge',
    });
  }

  private applyQueryParams(params: ParamMap): void {
    const page = Math.max(parseInt(params.get('page') ?? '1', 10), 1);
    const pageSize = Math.max(parseInt(params.get('page_size') ?? `${env.pagination.defaultPageSize}`, 10), 1);
    const ordering = params.get('ordering') || this.defaultOrdering;
    const reviewIdParam = params.get('review_id');
    const parsedReviewId = reviewIdParam ? Number(reviewIdParam) : NaN;
    this.pendingDialogReviewId = Number.isNaN(parsedReviewId) ? null : parsedReviewId;

    const nextFormValue = {
      search: params.get('search') ?? '',
      status: params.get('status') ?? '',
      is_flagged: params.get('is_flagged') ?? '',
      min_rating: params.get('min_rating') ?? '',
      max_rating: params.get('max_rating') ?? '',
      ordering,
    };

    this.currentPage = page;
    this.pageSize = pageSize;
    this.filterForm.patchValue(nextFormValue, { emitEvent: false });
    this.fetchReviews();
  }

  publishReview(review: AdminReview): void {
    if (this.isProcessing(review.id)) {
      return;
    }
    this.setProcessing(review.id, true);
    this.reviewsService
      .publishAdminReview(review.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.replaceReview(updated);
          this.messageService.add({
            severity: 'success',
            summary: 'Review published',
            detail: `Review #${updated.id} is now public.`,
          });
          this.setProcessing(review.id, false);
        },
        error: error => {
          console.error('Failed to publish review', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Publish failed',
            detail: 'We could not publish this review. Please try again.',
          });
          this.setProcessing(review.id, false);
        },
      });
  }

  confirmRejectReview(review: AdminReview): void {
    if (this.isProcessing(review.id)) {
      return;
    }
    this.confirmationService.confirm({
      header: 'Reject review',
      message: 'Are you sure you want to reject this review? The passenger will no longer see it publicly.',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => this.rejectReview(review),
    });
  }

  toggleFlagReview(review: AdminReview): void {
    if (this.isProcessing(review.id)) {
      return;
    }
    this.setProcessing(review.id, true);

    const action$ = review.is_flagged
      ? this.reviewsService.unflagAdminReview(review.id)
      : this.reviewsService.flagAdminReview(review.id);

    action$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.replaceReview(updated);
          this.messageService.add({
            severity: updated.is_flagged ? 'warn' : 'success',
            summary: updated.is_flagged ? 'Review flagged' : 'Review unflagged',
            detail: updated.is_flagged
              ? 'Marked for further follow-up.'
              : 'Removed from flagged reviews.',
          });
          this.setProcessing(review.id, false);
        },
        error: error => {
          console.error('Failed to toggle review flag', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Unable to update flag',
            detail: 'Please retry in a few moments.',
          });
          this.setProcessing(review.id, false);
        },
      });
  }

  private rejectReview(review: AdminReview): void {
    this.setProcessing(review.id, true);
    this.reviewsService
      .rejectAdminReview(review.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.replaceReview(updated);
          this.messageService.add({
            severity: 'info',
            summary: 'Review rejected',
            detail: `Review #${updated.id} is no longer public.`,
          });
          this.setProcessing(review.id, false);
        },
        error: error => {
          console.error('Failed to reject review', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Reject failed',
            detail: 'We could not reject this review. Please try again.',
          });
          this.setProcessing(review.id, false);
        },
      });
  }

  private buildQueryParams(): Record<string, string | number> {
    const { search, status, is_flagged, min_rating, max_rating, ordering } = this.filterForm.value;
    const query: Record<string, string | number> = {
      page: this.currentPage,
      page_size: this.pageSize,
    };

    if (ordering) {
      query['ordering'] = ordering;
    }
    if (search?.trim()) {
      query['search'] = search.trim();
    }
    if (status) {
      query['status'] = status;
    }
    if (is_flagged) {
      query['is_flagged'] = is_flagged;
    }
    if (min_rating) {
      query['min_rating'] = min_rating;
    }
    if (max_rating) {
      query['max_rating'] = max_rating;
    }
    return query;
  }

  private updateQueryParams(): void {
    const queryParams = this.buildQueryParams();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  private fetchReviews(): void {
    const { search, status, is_flagged, min_rating, max_rating, ordering } = this.filterForm.value;
    const payload: Record<string, string | number> = {
      page: this.currentPage,
      page_size: this.pageSize,
    };

    if (ordering) {
      payload['ordering'] = ordering;
    }
    if (search?.trim()) {
      payload['search'] = search.trim();
    }
    if (status) {
      payload['status'] = status;
    }
    if (is_flagged) {
      payload['is_flagged'] = is_flagged;
    }
    if (min_rating) {
      payload['min_rating'] = min_rating;
    }
    if (max_rating) {
      payload['max_rating'] = max_rating;
    }

    this.loading = true;
    this.reviewsService
      .listAdmin(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: PaginatedResponse<AdminReview>) => {
          this.reviews = response.results ?? [];
          this.totalRecords = response.count ?? this.reviews.length;
          this.loading = false;
          this.checkPendingDetailDialog();
        },
        error: error => {
          console.error('Failed to load reviews', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Unable to load reviews',
            detail: 'Please try again in a few moments.',
          });
          this.checkPendingDetailDialog();
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

  private replaceReview(updated: AdminReview): void {
    this.reviews = this.reviews.map(item => (item.id === updated.id ? updated : item));
  }

  private setProcessing(id: number, processing: boolean): void {
    if (processing) {
      this.processingReviewIds.add(id);
    } else {
      this.processingReviewIds.delete(id);
    }
  }

  private showReviewDialog(reviewId: number, initialReview?: AdminReview): void {
    if (this.currentDialogReviewId === reviewId && this.detailRef) {
      return;
    }
    if (this.detailRef) {
      this.suppressQuerySync = true;
      this.detailRef.close();
    }
    this.currentDialogReviewId = reviewId;
    this.detailRef = this.dialogService.open(ReviewDetailComponent, {
      header: `Review #${reviewId}`,
      width: '55rem',
      styleClass: 'review-detail-dialog',
      closable: true,
      dismissableMask: true,
      baseZIndex: 11000,
      data: {
        reviewId,
        review: initialReview,
        onReviewUpdate: (updated: AdminReview) => this.replaceReview(updated),
      },
    });

    this.detailRef.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.detailRef = null;
        this.currentDialogReviewId = null;
        const shouldSync = !this.suppressQuerySync;
        this.suppressQuerySync = false;
        this.pendingDialogReviewId = null;
        if (shouldSync && this.route.snapshot.queryParamMap.has('review_id')) {
          this.removeReviewIdFromQuery();
        }
        const updatedReview = (result as { updatedReview?: AdminReview } | undefined)?.updatedReview;
        if (updatedReview) {
          this.replaceReview(updatedReview);
        }
      });
  }

  private closeDetailDialogSilently(): void {
    if (!this.detailRef) {
      return;
    }
    this.suppressQuerySync = true;
    this.detailRef.close();
  }

  private removeReviewIdFromQuery(): void {
    const queryParams = this.buildQueryParams();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  private checkPendingDetailDialog(): void {
    if (this.pendingDialogReviewId === null) {
      if (this.detailRef) {
        this.closeDetailDialogSilently();
      }
      return;
    }

    if (this.currentDialogReviewId === this.pendingDialogReviewId && this.detailRef) {
      return;
    }

    const initialReview = this.reviews.find(review => review.id === this.pendingDialogReviewId) ?? undefined;
    this.showReviewDialog(this.pendingDialogReviewId, initialReview);
  }

  toggleDetailedFilters(): void {
    this.showDetailedFilters = !this.showDetailedFilters;
  }
}
