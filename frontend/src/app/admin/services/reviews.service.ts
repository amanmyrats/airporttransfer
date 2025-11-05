import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment as env } from '../../../environments/environment';
import {
  AdminReview,
  CreateAdminReviewPayload,
  CreateReviewPayload,
  CreateReviewReplyPayload,
  MyReview,
  PaginatedResponse,
  PublicReview,
  ReviewReply,
  UpdateAdminReviewPayload,
  UpdateReviewPayload,
  UpdateReviewReplyPayload,
} from '../../account/models/review.models';

interface PaginationMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly accountApiBase = env.apiBase.replace(/\/$/, '');
  private readonly adminApiBase = `${env.baseUrl}${env.apiV1}`;

  readonly myReviews = signal<MyReview[]>([]);
  readonly myReviewsMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly myReviewsLoading = signal(false);

  readonly currentReview = signal<MyReview | null>(null);
  readonly currentReviewLoading = signal(false);

  readonly publicReviews = signal<PublicReview[]>([]);
  readonly publicReviewsMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly publicReviewsLoading = signal(false);

  readonly adminReviews = signal<AdminReview[]>([]);
  readonly adminReviewsMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly adminReviewsLoading = signal(false);

  readonly currentAdminReview = signal<AdminReview | null>(null);
  readonly currentAdminReviewLoading = signal(false);

  readonly reviewReplies = signal<ReviewReply[]>([]);
  readonly reviewRepliesMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly reviewRepliesLoading = signal(false);

  readonly currentReviewReply = signal<ReviewReply | null>(null);
  readonly currentReviewReplyLoading = signal(false);

  listMine(params?: Record<string, unknown>): Observable<PaginatedResponse<MyReview>> {
    this.myReviewsLoading.set(true);
    return this.http
      .get<PaginatedResponse<MyReview>>(`${this.accountApiBase}/me/reviews/`, {
        params: this.buildParams(params),
      })
      .pipe(
        tap(response => {
          this.myReviews.set(response.results ?? []);
          this.myReviewsMeta.set({
            count: response.count ?? response.results.length,
            next: response.next,
            previous: response.previous,
          });
        }),
        finalize(() => this.myReviewsLoading.set(false)),
      );
  }

  getMine(id: number): Observable<MyReview> {
    this.currentReviewLoading.set(true);
    return this.http.get<MyReview>(`${this.accountApiBase}/me/reviews/${id}/`).pipe(
      tap(review => {
        this.currentReview.set(review);
        this.upsertReview(review);
      }),
      finalize(() => this.currentReviewLoading.set(false)),
    );
  }

  create(payload: CreateReviewPayload): Observable<MyReview> {
    this.currentReviewLoading.set(true);
    return this.http.post<MyReview>(`${this.accountApiBase}/me/reviews/`, payload).pipe(
      tap(review => {
        this.currentReview.set(review);
        this.upsertReview(review, true);
      }),
      finalize(() => this.currentReviewLoading.set(false)),
    );
  }

  update(id: number, payload: UpdateReviewPayload): Observable<MyReview> {
    this.currentReviewLoading.set(true);
    return this.http.patch<MyReview>(`${this.accountApiBase}/me/reviews/${id}/`, payload).pipe(
      tap(review => {
        this.currentReview.set(review);
        this.upsertReview(review, false);
      }),
      finalize(() => this.currentReviewLoading.set(false)),
    );
  }

  listPublic(params?: Record<string, unknown>): Observable<PaginatedResponse<PublicReview>> {
    this.publicReviewsLoading.set(true);
    return this.http
      .get<PaginatedResponse<PublicReview>>(`${this.accountApiBase}/public/reviews/`, {
        params: this.buildParams(params),
      })
      .pipe(
        tap(response => {
          this.publicReviews.set(response.results ?? []);
          this.publicReviewsMeta.set({
            count: response.count ?? response.results.length,
            next: response.next,
            previous: response.previous,
          });
        }),
        finalize(() => this.publicReviewsLoading.set(false)),
      );
  }

  listAdmin(params?: Record<string, unknown>): Observable<PaginatedResponse<AdminReview>> {
    this.adminReviewsLoading.set(true);
    return this.http
      .get<PaginatedResponse<AdminReview>>(`${this.adminApiBase}reviews/`, {
        params: this.buildParams(params),
      })
      .pipe(
        tap(response => {
          this.adminReviews.set(response.results ?? []);
          this.adminReviewsMeta.set({
            count: response.count ?? response.results.length,
            next: response.next,
            previous: response.previous,
          });
        }),
        finalize(() => this.adminReviewsLoading.set(false)),
      );
  }

  getAdmin(id: number): Observable<AdminReview> {
    this.currentAdminReviewLoading.set(true);
    return this.http.get<AdminReview>(`${this.adminApiBase}reviews/${id}/`).pipe(
      tap(review => {
        this.currentAdminReview.set(review);
        this.upsertAdminReview(review);
      }),
      finalize(() => this.currentAdminReviewLoading.set(false)),
    );
  }

  createAdmin(payload: CreateAdminReviewPayload): Observable<AdminReview> {
    this.currentAdminReviewLoading.set(true);
    return this.http.post<AdminReview>(`${this.adminApiBase}reviews/`, payload).pipe(
      tap(review => {
        this.currentAdminReview.set(review);
        this.upsertAdminReview(review, true);
      }),
      finalize(() => this.currentAdminReviewLoading.set(false)),
    );
  }

  updateAdmin(id: number, payload: UpdateAdminReviewPayload): Observable<AdminReview> {
    this.currentAdminReviewLoading.set(true);
    return this.http.patch<AdminReview>(`${this.adminApiBase}reviews/${id}/`, payload).pipe(
      tap(review => {
        this.currentAdminReview.set(review);
        this.upsertAdminReview(review);
      }),
      finalize(() => this.currentAdminReviewLoading.set(false)),
    );
  }

  deleteAdmin(id: number): Observable<void> {
    this.currentAdminReviewLoading.set(true);
    return this.http.delete<void>(`${this.adminApiBase}reviews/${id}/`).pipe(
      tap(() => {
        if (this.currentAdminReview()?.id === id) {
          this.currentAdminReview.set(null);
        }
        this.removeAdminReview(id);
      }),
      finalize(() => this.currentAdminReviewLoading.set(false)),
    );
  }

  publishAdminReview(id: number): Observable<AdminReview> {
    return this.moderateAdminReview(id, 'publish');
  }

  rejectAdminReview(id: number): Observable<AdminReview> {
    return this.moderateAdminReview(id, 'reject');
  }

  flagAdminReview(id: number): Observable<AdminReview> {
    return this.moderateAdminReview(id, 'flag');
  }

  unflagAdminReview(id: number): Observable<AdminReview> {
    return this.moderateAdminReview(id, 'unflag');
  }

  listReviewReplies(reviewId: number, params?: Record<string, unknown>): Observable<PaginatedResponse<ReviewReply>> {
    this.reviewRepliesLoading.set(true);
    const mergedParams = { ...(params ?? {}), review: reviewId };
    return this.http
      .get<PaginatedResponse<ReviewReply>>(`${this.adminApiBase}review-replies/`, {
        params: this.buildParams(mergedParams),
      })
      .pipe(
        tap(response => {
          this.reviewReplies.set(response.results ?? []);
          this.reviewRepliesMeta.set({
            count: response.count ?? response.results.length,
            next: response.next,
            previous: response.previous,
          });
        }),
        finalize(() => this.reviewRepliesLoading.set(false)),
      );
  }

  createReviewReply(payload: CreateReviewReplyPayload): Observable<ReviewReply> {
    this.currentReviewReplyLoading.set(true);
    return this.http.post<ReviewReply>(`${this.adminApiBase}review-replies/`, payload).pipe(
      tap(reply => {
        this.currentReviewReply.set(reply);
        this.upsertReviewReply(reply, true);
      }),
      finalize(() => this.currentReviewReplyLoading.set(false)),
    );
  }

  updateReviewReply(id: number, payload: UpdateReviewReplyPayload): Observable<ReviewReply> {
    this.currentReviewReplyLoading.set(true);
    return this.http.patch<ReviewReply>(`${this.adminApiBase}review-replies/${id}/`, payload).pipe(
      tap(reply => {
        this.currentReviewReply.set(reply);
        this.upsertReviewReply(reply);
      }),
      finalize(() => this.currentReviewReplyLoading.set(false)),
    );
  }

  deleteReviewReply(id: number): Observable<void> {
    this.currentReviewReplyLoading.set(true);
    return this.http.delete<void>(`${this.adminApiBase}review-replies/${id}/`).pipe(
      tap(() => {
        if (this.currentReviewReply()?.id === id) {
          this.currentReviewReply.set(null);
        }
        this.reviewReplies.update(items => items.filter(item => item.id !== id));
        this.reviewRepliesMeta.update(meta => ({
          ...meta,
          count: Math.max(0, meta.count - 1),
        }));
      }),
      finalize(() => this.currentReviewReplyLoading.set(false)),
    );
  }

  getReviewReply(id: number): Observable<ReviewReply> {
    this.currentReviewReplyLoading.set(true);
    return this.http.get<ReviewReply>(`${this.adminApiBase}review-replies/${id}/`).pipe(
      tap(reply => {
        this.currentReviewReply.set(reply);
        this.upsertReviewReply(reply);
      }),
      finalize(() => this.currentReviewReplyLoading.set(false)),
    );
  }

  clearCurrent(): void {
    this.currentReview.set(null);
    this.currentReviewLoading.set(false);
  }

  clearCurrentAdmin(): void {
    this.currentAdminReview.set(null);
    this.currentAdminReviewLoading.set(false);
  }

  clearCurrentReply(): void {
    this.currentReviewReply.set(null);
    this.currentReviewReplyLoading.set(false);
  }

  private moderateAdminReview(id: number, action: 'publish' | 'reject' | 'flag' | 'unflag'): Observable<AdminReview> {
    this.currentAdminReviewLoading.set(true);
    return this.http.post<AdminReview>(`${this.adminApiBase}reviews/${id}/${action}/`, {}).pipe(
      tap(review => {
        this.currentAdminReview.set(review);
        this.upsertAdminReview(review);
      }),
      finalize(() => this.currentAdminReviewLoading.set(false)),
    );
  }

  private upsertReview(review: MyReview, incrementIfNew = false): void {
    const alreadyExists = this.myReviews().some(item => item.id === review.id);
    this.myReviews.update(items => {
      const filtered = items.filter(item => item.id !== review.id);
      return [review, ...filtered];
    });
    if (incrementIfNew && !alreadyExists) {
      this.myReviewsMeta.update(meta => ({
        ...meta,
        count: meta.count + 1,
      }));
    }
  }

  private upsertAdminReview(review: AdminReview, incrementIfNew = false): void {
    const alreadyExists = this.adminReviews().some(item => item.id === review.id);
    this.adminReviews.update(items => {
      const filtered = items.filter(item => item.id !== review.id);
      return [review, ...filtered];
    });
    if (incrementIfNew && !alreadyExists) {
      this.adminReviewsMeta.update(meta => ({
        ...meta,
        count: meta.count + 1,
      }));
    }
  }

  private removeAdminReview(id: number): void {
    this.adminReviews.update(items => items.filter(item => item.id !== id));
    this.adminReviewsMeta.update(meta => ({
      ...meta,
      count: Math.max(0, meta.count - 1),
    }));
  }

  private upsertReviewReply(reply: ReviewReply, incrementIfNew = false): void {
    const alreadyExists = this.reviewReplies().some(item => item.id === reply.id);
    this.reviewReplies.update(items => {
      const filtered = items.filter(item => item.id !== reply.id);
      return [reply, ...filtered];
    });
    if (incrementIfNew && !alreadyExists) {
      this.reviewRepliesMeta.update(meta => ({
        ...meta,
        count: meta.count + 1,
      }));
    }
  }

  private buildParams(params?: Record<string, unknown>): HttpParams {
    if (!params) {
      return new HttpParams();
    }
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null) {
            httpParams = httpParams.append(key, String(item));
          }
        });
        return;
      }
      httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }
}
