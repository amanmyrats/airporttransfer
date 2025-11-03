import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateReviewPayload,
  MyReview,
  PaginatedResponse,
  PublicReview,
  UpdateReviewPayload,
} from '../../account/models/review.models';

interface PaginationMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBase.replace(/\/$/, '');

  readonly myReviews = signal<MyReview[]>([]);
  readonly myReviewsMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly myReviewsLoading = signal(false);

  readonly currentReview = signal<MyReview | null>(null);
  readonly currentReviewLoading = signal(false);

  readonly publicReviews = signal<PublicReview[]>([]);
  readonly publicReviewsMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly publicReviewsLoading = signal(false);

  listMine(params?: Record<string, unknown>): Observable<PaginatedResponse<MyReview>> {
    this.myReviewsLoading.set(true);
    return this.http
      .get<PaginatedResponse<MyReview>>(`${this.apiBase}/me/reviews/`, {
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
    return this.http.get<MyReview>(`${this.apiBase}/me/reviews/${id}/`).pipe(
      tap(review => {
        this.currentReview.set(review);
        this.upsertReview(review);
      }),
      finalize(() => this.currentReviewLoading.set(false)),
    );
  }

  create(payload: CreateReviewPayload): Observable<MyReview> {
    this.currentReviewLoading.set(true);
    return this.http.post<MyReview>(`${this.apiBase}/me/reviews/`, payload).pipe(
      tap(review => {
        this.currentReview.set(review);
        this.upsertReview(review, true);
      }),
      finalize(() => this.currentReviewLoading.set(false)),
    );
  }

  update(id: number, payload: UpdateReviewPayload): Observable<MyReview> {
    this.currentReviewLoading.set(true);
    return this.http.patch<MyReview>(`${this.apiBase}/me/reviews/${id}/`, payload).pipe(
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
      .get<PaginatedResponse<PublicReview>>(`${this.apiBase}/public/reviews/`, {
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

  clearCurrent(): void {
    this.currentReview.set(null);
    this.currentReviewLoading.set(false);
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
