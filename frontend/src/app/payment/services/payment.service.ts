import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment as env } from '../../../environments/environment';
import {
  ConfirmPaymentIntentPayload,
  CreatePaymentIntentPayload,
  OfflineReceipt,
  OfflineReceiptPayload,
  PaymentIntentDto,
  PaymentMethod,
  PaymentMethodDto,
  ReservationSummary,
} from '../models/payment.models';

interface PaymentMethodResponse {
  method: PaymentMethod;
  currencies: string[];
  provider: string;
  metadata: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${env.apiBase}/payments`;
  private readonly transferUrl = `${env.apiBase}/transfer`;

  getMethods(): Observable<PaymentMethodDto[]> {
    return this.http.get<PaymentMethodResponse[]>(`${this.baseUrl}/methods/`).pipe(
      map(methods => methods.map(responseToDto)),
    );
  }

  createIntent(payload: CreatePaymentIntentPayload): Observable<PaymentIntentDto> {
    return this.http.post<PaymentIntentDto>(`${this.baseUrl}/intents/`, payload);
  }

  getIntent(publicId: string): Observable<PaymentIntentDto> {
    return this.http.get<PaymentIntentDto>(`${this.baseUrl}/intents/${publicId}/`);
  }

  getIntentByBooking(bookingRef: string): Observable<PaymentIntentDto> {
    return this.http.get<PaymentIntentDto>(`${this.baseUrl}/intents/by-booking/${bookingRef}/`);
  }

  getIntentHistory(bookingRef: string): Observable<PaymentIntentDto[]> {
    return this.http.get<PaymentIntentDto[]>(`${this.baseUrl}/intents/history/${bookingRef}/`);
  }

  confirm(publicId: string, payload?: ConfirmPaymentIntentPayload): Observable<PaymentIntentDto> {
    return this.http.post<PaymentIntentDto>(`${this.baseUrl}/intents/${publicId}/confirm/`, payload ?? {});
  }

  uploadOfflineReceipt(publicId: string, payload: OfflineReceiptPayload): Observable<OfflineReceipt> {
    const formData = new FormData();
    formData.append('evidence_file', payload.evidence_file);
    if (payload.note) {
      formData.append('note', payload.note);
    }
    return this.http.post<OfflineReceipt>(`${this.baseUrl}/intents/${publicId}/offline-receipt/`, formData);
  }

  fetchBookingSummary(bookingRef: string): Observable<ReservationSummary> {
    return this.http.get<ReservationSummary>(`${this.transferUrl}/reservations/number/${bookingRef}/`);
  }
}

const responseToDto = (method: PaymentMethodResponse): PaymentMethodDto => ({
  code: method.method,
  label: labelFor(method.method),
  supportedCurrencies: method.currencies,
  provider: method.provider,
  metadata: method.metadata,
});

const labelFor = (method: PaymentMethod): string => {
  switch (method) {
    case 'CARD':
      return 'Credit or Debit Card';
    case 'BANK_TRANSFER':
      return 'Bank Transfer';
    case 'CASH':
      return 'Cash on Arrival';
    case 'RUB_PHONE_TRANSFER':
      return 'Pay in Rubles (phone transfer)';
    default:
      return method;
  }
};
