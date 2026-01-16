import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment as env } from '../../../../environments/environment';
import {
  PaymentBankAccount,
  PaymentBankAccountFilters,
  PaymentBankAccountPayload,
} from '../models/bank-account.model';
import { PaginatedResponse } from '../../../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${env.apiBase}/payments/bank-accounts`;

  list(filters?: PaymentBankAccountFilters & { page?: number; page_size?: number }): Observable<PaginatedResponse<PaymentBankAccount>> {
    const params = new HttpParams({
      fromObject: {
        ...(filters?.method ? { method: filters.method } : {}),
        ...(filters?.currency ? { currency: filters.currency } : {}),
        ...(typeof filters?.is_active === 'boolean' ? { is_active: String(filters.is_active) } : {}),
        ...(filters?.page ? { page: String(filters.page) } : {}),
        ...(filters?.page_size ? { page_size: String(filters.page_size) } : {}),
      },
    });
    return this.http.get<PaginatedResponse<PaymentBankAccount>>(`${this.baseUrl}/`, { params });
  }

  create(payload: PaymentBankAccountPayload): Observable<PaymentBankAccount> {
    return this.http.post<PaymentBankAccount>(`${this.baseUrl}/`, payload);
  }

  update(id: number, payload: PaymentBankAccountPayload): Observable<PaymentBankAccount> {
    return this.http.patch<PaymentBankAccount>(`${this.baseUrl}/${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }
}
