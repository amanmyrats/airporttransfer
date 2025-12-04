import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment as env } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { ReservationChangeRequest } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ChangeRequestService {
  private readonly http = inject(HttpClient);
  private readonly adminApiBase = `${env.baseUrl}${env.apiV1}admin/change-requests/`;

  listAdmin(
    params?: Record<string, unknown>,
  ): Observable<PaginatedResponse<ReservationChangeRequest>> {
    return this.http
      .get<PaginatedResponse<ReservationChangeRequest> | ReservationChangeRequest[]>(this.adminApiBase, {
        params: this.buildParams(params),
      })
      .pipe(map(response => this.normalizeResponse(response)));
  }

  listByReservation(
    reservationId: number,
    params?: Record<string, unknown>,
  ): Observable<PaginatedResponse<ReservationChangeRequest>> {
    const mergedParams = { ...(params ?? {}), reservation: reservationId };
    return this.listAdmin(mergedParams);
  }

  approve(
    id: number,
    payload: { note?: string } = {},
  ): Observable<ReservationChangeRequest> {
    return this.http.post<ReservationChangeRequest>(
      `${this.adminApiBase}${id}/approve/`,
      payload,
    );
  }

  decline(
    id: number,
    payload: { note?: string } = {},
  ): Observable<ReservationChangeRequest> {
    return this.http.post<ReservationChangeRequest>(
      `${this.adminApiBase}${id}/decline/`,
      payload,
    );
  }

  private normalizeResponse(
    response: PaginatedResponse<ReservationChangeRequest> | ReservationChangeRequest[],
  ): PaginatedResponse<ReservationChangeRequest> {
    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: undefined,
        previous: undefined,
        results: response,
      };
    }
    return response;
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
}
