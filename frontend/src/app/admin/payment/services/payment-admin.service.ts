import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment as env } from '../../../../environments/environment';
import {
  OfflineSettlementPayload,
  PaymentDto,
  PaymentIntentDto,
  PendingSettlementIntent,
} from '../../../payment/models/payment.models';
import { PaginatedResponse } from '../../../models/paginated-response.model';

export interface RefundIssuePayload {
  payment_id: number;
  amount_minor?: number | null;
  reason?: string | null;
}

export interface RefundIssueResponse {
  refund: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${env.apiBase}/payments`;

  settleOffline(publicId: string, payload: OfflineSettlementPayload): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(`${this.baseUrl}/intents/${publicId}/settle-offline/`, payload);
  }

  declineIntent(publicId: string, payload?: { reason?: string | null }): Observable<PaymentIntentDto> {
    return this.http.post<PaymentIntentDto>(`${this.baseUrl}/intents/${publicId}/decline-offline/`, payload ?? {});
  }

  issueRefund(payload: RefundIssuePayload): Observable<RefundIssueResponse> {
    return this.http.post<RefundIssueResponse>(`${this.baseUrl}/refunds/`, payload);
  }

  listPendingSettlementIntents(limit?: number): Observable<PendingSettlementIntent[]> {
    let params = new HttpParams();
    if (typeof limit === 'number' && Number.isFinite(limit)) {
      params = params.set('limit', String(limit));
    }
    const options: { params?: HttpParams } = {};
    if (params.keys().length) {
      options.params = params;
    }
    return this.http.get<PendingSettlementIntent[]>(`${this.baseUrl}/intents/pending-settlement/`, options);
  }

  listPendingIntents(days?: number): Observable<PaymentIntentDto[]> {
    const url = days
      ? `${this.baseUrl}/intents/?days=${days}`
      : `${this.baseUrl}/intents/`;
    return this.http.get<PaymentIntentDto[]>(url);
  }

  listIntents(filters?: {
    status?: string;
    method?: string;
    booking_ref?: string;
    page?: number;
    page_size?: number;
  }): Observable<PaginatedResponse<PaymentIntentDto>> {
    const params = new HttpParams({
      fromObject: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.method ? { method: filters.method } : {}),
        ...(filters?.booking_ref ? { booking_ref: filters.booking_ref } : {}),
        ...(filters?.page ? { page: String(filters.page) } : {}),
        ...(filters?.page_size ? { page_size: String(filters.page_size) } : {}),
      },
    });
    return this.http.get<PaginatedResponse<PaymentIntentDto>>(`${this.baseUrl}/intents/all/`, { params });
  }

  listIntentsByBooking(bookingRef: string): Observable<PaymentIntentDto[]> {
    return this.http.get<PaymentIntentDto[]>(`${this.baseUrl}/intents/history/${bookingRef}/`);
  }

  listPayments(filters?: { status?: string; method?: string; booking_ref?: string }): Observable<PaymentDto[]> {
    const params = new HttpParams({
      fromObject: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.method ? { method: filters.method } : {}),
        ...(filters?.booking_ref ? { booking_ref: filters.booking_ref } : {}),
      },
    });
    return this.http.get<PaymentDto[]>(`${this.baseUrl}/payments/`, { params });
  }
}
