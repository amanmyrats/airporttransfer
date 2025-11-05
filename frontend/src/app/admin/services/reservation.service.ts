import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { environment as env } from '../../../environments/environment';
import { saveAs } from 'file-saver';
import { PaginatedResponse } from '../../models/paginated-response.model';
import {
  CancelChangeRequestPayload,
  CreateChangeRequestPayload,
  MyReservation,
  Reservation,
  ReservationChangeRequest,
} from '../models/reservation.model';

interface PaginationMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

@Injectable({
  providedIn: 'root', 
})
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly accountApiBase = env.apiBase.replace(/\/$/, '');
  private readonly adminApiBase = `${env.baseUrl}${env.apiV1}`;
  private readonly adminEndpoint = 'transfer/reservations/';

  readonly myReservations = signal<MyReservation[]>([]);
  readonly myReservationsMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly myReservationsLoading = signal(false);

  readonly currentReservation = signal<MyReservation | null>(null);
  readonly currentReservationLoading = signal(false);

  // Backwards compatibility with existing consumers that rely on these names.
  readonly reservation = this.currentReservation;
  readonly reservationLoading = this.currentReservationLoading;

  readonly adminReservations = signal<Reservation[]>([]);
  readonly adminReservationsMeta = signal<PaginationMeta>({ count: 0, next: null, previous: null });
  readonly adminReservationsLoading = signal(false);

  readonly currentAdminReservation = signal<Reservation | null>(null);
  readonly currentAdminReservationLoading = signal(false);

  readonly changeRequests = signal<ReservationChangeRequest[]>([]);
  readonly changeRequestsLoading = signal(false);

  queryMine(params?: Record<string, unknown>): Observable<PaginatedResponse<MyReservation>> {
    return this.http.get<PaginatedResponse<MyReservation>>(
      `${this.accountApiBase}/me/reservations/`,
      {
        params: this.buildParams(params),
      },
    );
  }

  listMine(params?: Record<string, unknown>): Observable<PaginatedResponse<MyReservation>> {
    this.myReservationsLoading.set(true);
    return this.queryMine(params).pipe(
      tap(response => {
        const items = response.results ?? [];
        this.myReservations.set(items);
        this.myReservationsMeta.set({
          count: response.count ?? items.length,
          next: response.next ?? null,
          previous: response.previous ?? null,
        });
      }),
      finalize(() => this.myReservationsLoading.set(false)),
    );
  }

  getMine(id: number): Observable<MyReservation> {
    this.currentReservationLoading.set(true);
    return this.http.get<MyReservation>(`${this.accountApiBase}/me/reservations/${id}/`).pipe(
      tap(reservation => {
        this.currentReservation.set(reservation);
        this.upsertMyReservation(reservation);
      }),
      finalize(() => this.currentReservationLoading.set(false)),
    );
  }

  listAdmin(params?: Record<string, unknown>): Observable<PaginatedResponse<Reservation>> {
    this.adminReservationsLoading.set(true);
    return this.http
      .get<PaginatedResponse<Reservation>>(`${this.adminApiBase}${this.adminEndpoint}`, {
        params: this.buildParams(params),
      })
      .pipe(
        tap(response => {
          const items = response.results ?? [];
          this.adminReservations.set(items);
          this.adminReservationsMeta.set({
            count: response.count ?? items.length,
            next: response.next ?? null,
            previous: response.previous ?? null,
          });
        }),
        finalize(() => this.adminReservationsLoading.set(false)),
      );
  }

  getAdmin(id: number | string): Observable<Reservation> {
    const reservationId = String(id);
    this.currentAdminReservationLoading.set(true);
    return this.http
      .get<Reservation>(`${this.adminApiBase}${this.adminEndpoint}${reservationId}/`)
      .pipe(
        tap(reservation => {
          this.currentAdminReservation.set(reservation);
          this.upsertAdminReservation(reservation);
        }),
        finalize(() => this.currentAdminReservationLoading.set(false)),
      );
  }

  createAdmin(reservation: Reservation): Observable<Reservation> {
    this.currentAdminReservationLoading.set(true);
    return this.http
      .post<Reservation>(`${this.adminApiBase}${this.adminEndpoint}`, reservation)
      .pipe(
        tap(created => {
          this.currentAdminReservation.set(created);
          this.upsertAdminReservation(created, true);
        }),
        finalize(() => this.currentAdminReservationLoading.set(false)),
      );
  }

  updateAdmin(id: number | string, reservation: Reservation): Observable<Reservation> {
    const reservationId = String(id);
    this.currentAdminReservationLoading.set(true);
    return this.http
      .put<Reservation>(`${this.adminApiBase}${this.adminEndpoint}${reservationId}/`, reservation)
      .pipe(
        tap(updated => {
          this.currentAdminReservation.set(updated);
          this.upsertAdminReservation(updated);
        }),
        finalize(() => this.currentAdminReservationLoading.set(false)),
      );
  }

  deleteAdmin(id: number | string): Observable<void> {
    const reservationId = String(id);
    this.currentAdminReservationLoading.set(true);
    return this.http.delete<void>(`${this.adminApiBase}${this.adminEndpoint}${reservationId}/`).pipe(
      tap(() => {
        if (this.currentAdminReservation()?.id === reservationId) {
          this.currentAdminReservation.set(null);
        }
        this.removeAdminReservation(reservationId);
      }),
      finalize(() => this.currentAdminReservationLoading.set(false)),
    );
  }

  updateAdminStatus(id: number | string, reservation: Reservation): Observable<Reservation> {
    const reservationId = String(id);
    this.currentAdminReservationLoading.set(true);
    return this.http
      .put<Reservation>(
        `${this.adminApiBase}${this.adminEndpoint}${reservationId}/update_status/`,
        reservation,
      )
      .pipe(
        tap(updated => {
          this.currentAdminReservation.set(updated);
          this.upsertAdminReservation(updated);
        }),
        finalize(() => this.currentAdminReservationLoading.set(false)),
      );
  }

  getReservations(queryString: string): Observable<PaginatedResponse<Reservation>> {
    return this.listAdmin(this.parseQueryString(queryString));
  }

  getReservation(id: number): Observable<Reservation> {
    return this.getAdmin(id);
  }

  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.createAdmin(reservation);
  }

  updateReservation(id: string, reservation: Reservation): Observable<Reservation> {
    return this.updateAdmin(id, reservation);
  }

  deleteReservation(id: string): Observable<void> {
    return this.deleteAdmin(id);
  }

  getStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${env.baseUrl}${env.apiV1}transfer/statuschoices/`);
  }

  getChangeRequestStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${env.baseUrl}${env.apiV1}transfer/change-request-statuschoices/`);
  }

  updateStatus(id: string, reservation: Reservation): Observable<Reservation> {
    return this.updateAdminStatus(id, reservation);
  }

  getMyReservation(id: number): Observable<MyReservation> {
    return this.getMine(id);
  }

  listMyChangeRequests(reservationId: number): Observable<ReservationChangeRequest[]> {
    this.changeRequestsLoading.set(true);
    return this.http
      .get<ReservationChangeRequest[]>(`${this.accountApiBase}/me/reservations/${reservationId}/change-requests/`)
      .pipe(
        tap(items => this.changeRequests.set(items ?? [])),
        finalize(() => this.changeRequestsLoading.set(false)),
      );
  }

  createMyChangeRequest(
    reservationId: number,
    payload: CreateChangeRequestPayload,
  ): Observable<ReservationChangeRequest> {
    this.changeRequestsLoading.set(true);
    return this.http
      .post<ReservationChangeRequest>(
        `${this.accountApiBase}/me/reservations/${reservationId}/change-requests/`,
        payload,
      )
      .pipe(
        tap(changeRequest => {
          this.upsertChangeRequest(changeRequest);
        }),
        finalize(() => this.changeRequestsLoading.set(false)),
      );
  }

  cancelMyChangeRequest(id: number, payload: CancelChangeRequestPayload = {}): Observable<ReservationChangeRequest> {
    this.changeRequestsLoading.set(true);
    return this.http
      .post<ReservationChangeRequest>(`${this.accountApiBase}/me/change-requests/${id}/cancel/`, payload)
      .pipe(
        tap(changeRequest => {
          this.upsertChangeRequest(changeRequest);
        }),
        finalize(() => this.changeRequestsLoading.set(false)),
      );
  }

  export(queryString: string, format?: string): Observable<any> {
    const options = {
      responseType: 'blob' as 'json',
      observe: 'response' as 'body',
    };

    return this.http.get(`${env.baseUrl}${env.apiV1}${this.adminEndpoint}export/${queryString}`, options);
  }

  handleExport(queryString: string): void {
    this.export(queryString).subscribe({
      next: (response: any) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        console.log("contentDisposition:");
        console.log(contentDisposition);
        const fileName = this.getFileNameFromHeader(contentDisposition);
        const blob = new Blob([response.body], { type: response.body.type });

        saveAs(blob, fileName);
      },
      error: (error: any) => {
        console.error('Export error:', error);
      }
    }
    )
  }

  getFileNameFromHeader(contentDisposition: string): string {
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+?)"/);
      console.log("matches:");
      console.log(matches);
      console.log("matches && matches[1]");
      console.log(matches && matches[1]);
      return matches && matches[1] ? matches[1] : 'reservasyonlar.csv'; // Default file name
    }
    return 'reservasyonlar.csv'; // Fallback name
  }

  private getFileExtension(format: string): string {
    switch (format.toLowerCase()) {
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
      case 'xlsx':
        return 'xlsx';
      default:
        return 'txt';
    }
  }

  private upsertChangeRequest(changeRequest: ReservationChangeRequest): void {
    this.changeRequests.update(items => {
      const filtered = items.filter(item => item.id !== changeRequest.id);
      return [changeRequest, ...filtered];
    });
  }

  private upsertMyReservation(reservation: MyReservation, incrementIfNew = false): void {
    const alreadyExists = this.myReservations().some(item => item.id === reservation.id);
    this.myReservations.update(items => {
      const filtered = items.filter(item => item.id !== reservation.id);
      return [reservation, ...filtered];
    });
    if (incrementIfNew && !alreadyExists) {
      this.myReservationsMeta.update(meta => ({
        ...meta,
        count: meta.count + 1,
      }));
    }
  }

  private upsertAdminReservation(reservation: Reservation, incrementIfNew = false): void {
    if (!reservation.id) {
      return;
    }
    const alreadyExists = this.adminReservations().some(item => item.id === reservation.id);
    this.adminReservations.update(items => {
      const filtered = items.filter(item => item.id !== reservation.id);
      return [reservation, ...filtered];
    });
    if (incrementIfNew && !alreadyExists) {
      this.adminReservationsMeta.update(meta => ({
        ...meta,
        count: meta.count + 1,
      }));
    }
  }

  private removeAdminReservation(id: string): void {
    this.adminReservations.update(items => items.filter(item => item.id !== id));
    this.adminReservationsMeta.update(meta => ({
      ...meta,
      count: Math.max(0, meta.count - 1),
    }));
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
          if (item !== undefined && item !== null && item !== '') {
            httpParams = httpParams.append(key, String(item));
          }
        });
        return;
      }
      httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }

  private parseQueryString(queryString: string): Record<string, string | string[]> | undefined {
    if (!queryString) {
      return undefined;
    }
    const trimmed = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    if (!trimmed) {
      return {};
    }
    const params = new URLSearchParams(trimmed);
    const result: Record<string, string | string[]> = {};
    params.forEach((value, key) => {
      if (result[key] === undefined) {
        result[key] = value;
      } else if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    });
    return result;
  }
}
