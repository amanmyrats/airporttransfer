import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';

import { PaymentDto, PaymentMethod } from '../../../../payment/models/payment.models';
import { PaymentAdminService } from '../../services/payment-admin.service';
import { formatMinor } from '../../../../payment/utils/money.util';
import { FilterSearchComponent } from '../../../components/filter-search/filter-search.component';
import { CommonService } from '../../../../services/common.service';

type PaymentFilters = {
  status?: string;
  method?: PaymentMethod | null;
  booking_ref?: string;
};

@Component({
  selector: 'app-payment-transactions',
  standalone: true,
  imports: [CommonModule, TableModule, FilterSearchComponent],
  templateUrl: './payment-transactions.component.html',
  styleUrls: ['./payment-transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentTransactionsComponent {
  private readonly service = inject(PaymentAdminService);
  private readonly commonService = inject(CommonService);

  readonly payments = signal<PaymentDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private filters: PaymentFilters = {};
  readonly filterRows = 25;

  readonly statusOptions = [
    { label: 'All statuses', value: null },
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
    { label: 'Partially Refunded', value: 'partially_refunded' },
  ];

  readonly methodOptions = [
    { label: 'All methods', value: null },
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'Phone Transfer (RU)', value: 'RUB_PHONE_TRANSFER' },
    { label: 'Card', value: 'CARD' },
  ];

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const payments = await firstValueFrom(
        this.service.listPayments({
          status: this.filters.status ?? undefined,
          method: this.filters.method ?? undefined,
          booking_ref: this.filters.booking_ref ?? undefined,
        }),
      );
      this.payments.set(payments ?? []);
    } catch (error) {
      console.error('Failed to load payments', error);
      this.error.set('Unable to load payment records.');
    } finally {
      this.loading.set(false);
    }
  }

  formattedAmount(payment: PaymentDto): string {
    return formatMinor(payment.amount_minor, payment.currency);
  }

  onFilterSearch(queryString: string): void {
    this.filters = this.extractFilters(queryString);
    void this.load();
  }

  private extractFilters(queryString: string): PaymentFilters {
    const params = this.commonService.parseQueryParams(queryString);
    const status = typeof params['status'] === 'string' ? params['status'] : undefined;
    const method = typeof params['method'] === 'string' ? (params['method'] as PaymentMethod) : undefined;
    const bookingRef = typeof params['search'] === 'string' ? params['search'] : undefined;

    return {
      status: status || undefined,
      method: method || undefined,
      booking_ref: bookingRef || undefined,
    };
  }
}
