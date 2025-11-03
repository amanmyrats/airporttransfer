import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment as env } from '../../../environments/environment';
import {
  ConfirmPaymentIntentPayload,
  CreatePaymentIntentPayload,
  OfflineReceipt,
  OfflineReceiptPayload,
  OfflineSettlementPayload,
  PaymentIntent,
  PaymentMethodDescriptor,
  ReservationSummary,
} from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${env.apiBase}/payments`;
  private readonly transferUrl = `${env.apiBase}/transfer`;

  listMethods(): Observable<PaymentMethodDescriptor[]> {
    return this.http.get<PaymentMethodDescriptor[]>(`${this.baseUrl}/methods/`);
  }

  createIntent(payload: CreatePaymentIntentPayload): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.baseUrl}/intents/`, payload);
  }

  getIntent(publicId: string): Observable<PaymentIntent> {
    return this.http.get<PaymentIntent>(`${this.baseUrl}/intents/${publicId}/`);
  }

  confirmIntent(publicId: string, payload: ConfirmPaymentIntentPayload): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(`${this.baseUrl}/intents/${publicId}/confirm/`, payload);
  }

  uploadOfflineReceipt(publicId: string, payload: OfflineReceiptPayload): Observable<OfflineReceipt> {
    const formData = new FormData();
    formData.append('evidence_file', payload.evidence_file);
    if (payload.note) {
      formData.append('note', payload.note);
    }
    return this.http.post<OfflineReceipt>(`${this.baseUrl}/intents/${publicId}/offline-receipt/`, formData);
  }

  settleOffline(publicId: string, payload: OfflineSettlementPayload) {
    return this.http.post(`${this.baseUrl}/intents/${publicId}/settle-offline/`, payload);
  }

  fetchBookingSummary(bookingRef: string): Observable<ReservationSummary> {
    return this.http.get<ReservationSummary>(`${this.transferUrl}/reservations/number/${bookingRef}/`);
  }
}
