import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PaymentDto, PaymentIntentDto, PaymentMethod, ReservationSummary } from '../../../../payment/models/payment.models';
import { PaymentAdminService } from '../../services/payment-admin.service';
import { formatMinor, majorToMinor } from '../../../../payment/utils/money.util';
import { PaymentService } from '../../../../payment/services/payment.service';
import { FilterSearchComponent } from '../../../components/filter-search/filter-search.component';
import { CommonService } from '../../../../services/common.service';
import { isOfflineMethod } from '../../../../payment/utils/payment-utils';

type PaymentIntentFilters = {
  status?: string;
  method?: PaymentMethod | null;
  booking_ref?: string;
};

type SettlementContext = {
  reservation: ReservationSummary;
  payments: PaymentDto[];
  relatedIntents: PaymentIntentDto[];
  totalMinor: number;
  paidMinor: number;
  dueMinor: number;
  currency: string;
};

@Component({
  selector: 'app-payment-intents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    FilterSearchComponent,
  ],
  templateUrl: './payment-intents.component.html',
  styleUrls: ['./payment-intents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})

export class PaymentIntentsComponent {
  @ViewChild(FilterSearchComponent) filterSearch?: FilterSearchComponent;

  private readonly service = inject(PaymentAdminService);
  private readonly paymentService = inject(PaymentService);
  private readonly commonService = inject(CommonService);
  private readonly messages = inject(MessageService);

  readonly intents = signal<PaymentIntentDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly settlingIntent = signal<string | null>(null);
  readonly decliningIntent = signal<string | null>(null);
  settlementDialogVisible = false;
  readonly selectedIntent = signal<PaymentIntentDto | null>(null);
  readonly settlementContext = signal<SettlementContext | null>(null);
  readonly settlementContextLoading = signal(false);
  readonly settlementContextError = signal<string | null>(null);

  private filters: PaymentIntentFilters = {};
  readonly filterRows = 25;

  readonly statusOptions = [
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Processing', value: 'processing' },
    { label: 'Failed', value: 'failed' },
    { label: 'Requires Action', value: 'requires_action' },
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
      const intents = await firstValueFrom(
        this.service.listIntents({
          status: this.filters.status ?? undefined,
          method: this.filters.method ?? undefined,
          booking_ref: this.filters.booking_ref ?? undefined,
        }),
      );
      this.intents.set(intents ?? []);
      await this.loadBookingSummaries(intents ?? []);
      this.computeAggregateSummary(intents ?? []);
    } catch (error) {
      console.error('Failed to load payment intents', error);
      this.error.set('Unable to load payment intents.');
    } finally {
      this.loading.set(false);
    }
  }

  formattedAmount(intent: PaymentIntentDto): string {
    return formatMinor(intent.amount_minor, intent.currency);
  }

  readonly formatCurrency = formatMinor;

  aggregateSummary = signal<string | null>(null);
  readonly bookingSummaries = signal<Record<string, string>>({});

  async viewBookingSummary(bookingRef: string): Promise<void> {
    if (this.filterSearch) {
      this.filterSearch.filterSearchForm.patchValue({ search: bookingRef });
      this.filterSearch.onFilterChange();
    } else {
      this.filters = { ...this.filters, booking_ref: bookingRef };
      await this.load();
    }
  }

  private computeAggregateSummary(intents: PaymentIntentDto[]): void {
    if (!intents.length) {
      this.aggregateSummary.set(null);
      return;
    }
    const total = intents.reduce((sum, intent) => sum + intent.amount_minor, 0);
    const paid = intents.reduce((sum, intent) => sum + (intent.paid_minor ?? 0), 0);
    const due = Math.max(total - paid, 0);
    const currency = intents[0].currency;
    this.aggregateSummary.set(
      `Total ${formatMinor(total, currency)} • Paid ${formatMinor(paid, currency)} • Due ${formatMinor(
        due,
        currency,
      )}`,
    );
  }

  private async loadBookingSummaries(intents: PaymentIntentDto[]): Promise<void> {
    const unique = Array.from(new Set(intents.map(intent => intent.booking_ref)));
    const summaries: Record<string, string> = {};
    if (!unique.length) {
      this.bookingSummaries.set({});
      return;
    }
    await Promise.all(
      unique.map(async ref => {
        summaries[ref] = await this.fetchBookingSummary(ref);
      }),
    );
    this.bookingSummaries.set(summaries);
  }

  private async fetchBookingSummary(reference: string): Promise<string> {
    try {
      const [reservation, payments] = await Promise.all([
        firstValueFrom(this.paymentService.fetchBookingSummary(reference)),
        firstValueFrom(this.service.listPayments({ booking_ref: reference })),
      ]);
      const currency = reservation.currency_code;
      const totalMinor = majorToMinor(Number(reservation.amount), currency);
      const paidMinor = payments
        .filter(payment => payment.status === 'succeeded')
        .reduce((sum, payment) => sum + payment.amount_minor, 0);
      const dueMinor = Math.max(totalMinor - paidMinor, 0);
      return `Reservation total ${formatMinor(totalMinor, currency)} • Paid ${formatMinor(
        paidMinor,
        currency,
      )} • Due ${formatMinor(dueMinor, currency)}`;
    } catch (error) {
      console.warn('Unable to load booking summary for', reference, error);
      return 'Booking summary unavailable';
    }
  }

  viewReceipt(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  openSettlementDialog(intent: PaymentIntentDto): void {
    this.selectedIntent.set(intent);
    this.settlementContext.set(null);
    this.settlementContextError.set(null);
    this.settlementContextLoading.set(true);
    this.settlementDialogVisible = true;
    void this.refreshSelectedIntent(intent.public_id);
    void this.loadSettlementContext(intent);
  }

  closeSettlementDialog(): void {
    this.settlementDialogVisible = false;
    this.selectedIntent.set(null);
    this.settlementContext.set(null);
    this.settlementContextError.set(null);
    this.settlementContextLoading.set(false);
  }

  private async loadSettlementContext(intent: PaymentIntentDto): Promise<void> {
    this.settlementContextLoading.set(true);
    this.settlementContextError.set(null);
    try {
      const [reservation, payments, relatedIntents] = await Promise.all([
        firstValueFrom(this.paymentService.fetchBookingSummary(intent.booking_ref)),
        firstValueFrom(this.service.listPayments({ booking_ref: intent.booking_ref })),
        firstValueFrom(this.service.listIntents({ booking_ref: intent.booking_ref })),
      ]);
      const currency = reservation.currency_code || intent.currency;
      const reservationAmount = Number(reservation.amount);
      const totalMinor = Number.isFinite(reservationAmount)
        ? majorToMinor(reservationAmount, currency)
        : intent.amount_minor;
      const paidMinor = payments
        .filter(payment => payment.status === 'succeeded')
        .reduce((sum, payment) => sum + payment.amount_minor, 0);
      const dueMinor = Math.max(totalMinor - paidMinor, 0);
      this.settlementContext.set({
        reservation,
        payments,
        relatedIntents: relatedIntents ?? [],
        totalMinor,
        paidMinor,
        dueMinor,
        currency,
      });
    } catch (error) {
      console.error('Unable to load settlement context', error);
      this.settlementContextError.set('Unable to load booking details. Please try again.');
    } finally {
      this.settlementContextLoading.set(false);
    }
  }

  private async refreshSelectedIntent(publicId: string): Promise<void> {
    try {
      const intentDetail = await firstValueFrom(this.paymentService.getIntent(publicId));
      this.selectedIntent.set(intentDetail);
    } catch (error) {
      console.warn('Unable to refresh intent detail', error);
    }
  }

  private readonly settleAllowedStatuses: Array<PaymentIntentDto['status']> = ['processing'];

  canSettleIntent(intent: PaymentIntentDto): boolean {
    const hasOutstanding = this.resolveDueMinor(intent) > 0;
    const statusAllowsSettle = this.settleAllowedStatuses.includes(intent.status);
    return isOfflineMethod(intent.method) && statusAllowsSettle && hasOutstanding;
  }

  canDeclineIntent(intent: PaymentIntentDto): boolean {
    if (!isOfflineMethod(intent.method)) {
      return false;
    }
    return !['succeeded', 'failed', 'canceled'].includes(intent.status);
  }

  private resolveDueMinor(intent: PaymentIntentDto): number {
    if (intent.due_minor != null) {
      return intent.due_minor;
    }
    const paid = intent.paid_minor
      ?? intent.payments
        .filter(payment => payment.status === 'succeeded')
        .reduce((sum, payment) => sum + payment.amount_minor, 0);
    return Math.max(intent.amount_minor - paid, 0);
  }

  async settleIntent(intent: PaymentIntentDto): Promise<void> {
    if (!this.canSettleIntent(intent) || this.settlingIntent() === intent.public_id) {
      return;
    }
    const amountMinor = this.resolveDueMinor(intent);
    if (!amountMinor) {
      return;
    }
    const confirmationMessage = `Mark ${formatMinor(amountMinor, intent.currency)} as paid for booking ${intent.booking_ref}?`;
    if (typeof window !== 'undefined' && !window.confirm(confirmationMessage)) {
      return;
    }
    this.settlingIntent.set(intent.public_id);
    try {
      await firstValueFrom(
        this.service.settleOffline(intent.public_id, {
          amount_minor: amountMinor,
          note: intent.offline_receipts?.length
            ? `Approved ${intent.offline_receipts.length} receipt(s) via admin`
            : undefined,
        }),
      );
      this.messages.add({
        severity: 'success',
        summary: 'Payment settled',
        detail: `${intent.booking_ref} marked as paid (${formatMinor(amountMinor, intent.currency)}).`,
      });
      this.closeSettlementDialog();
      await this.load();
    } catch (error) {
      console.error('Failed to settle intent', error);
      this.messages.add({
        severity: 'error',
        summary: 'Settlement failed',
        detail: 'Unable to record this payment. Please try again.',
      });
    } finally {
      this.settlingIntent.set(null);
    }
  }

  async declineIntent(intent: PaymentIntentDto): Promise<void> {
    if (!this.canDeclineIntent(intent) || this.decliningIntent() === intent.public_id) {
      return;
    }
    const confirmationMessage = `Decline payment intent for booking ${intent.booking_ref}?`;
    if (typeof window !== 'undefined' && !window.confirm(confirmationMessage)) {
      return;
    }
    this.decliningIntent.set(intent.public_id);
    try {
      await firstValueFrom(this.service.declineIntent(intent.public_id));
      this.messages.add({
        severity: 'warn',
        summary: 'Intent declined',
        detail: `${intent.booking_ref} marked as declined.`,
      });
      this.closeSettlementDialog();
      await this.load();
    } catch (error) {
      console.error('Failed to decline intent', error);
      this.messages.add({
        severity: 'error',
        summary: 'Decline failed',
        detail: 'Unable to decline this payment intent. Please try again.',
      });
    } finally {
      this.decliningIntent.set(null);
    }
  }

  onFilterSearch(queryString: string): void {
    this.filters = this.extractFilters(queryString);
    void this.load();
  }

  private extractFilters(queryString: string): PaymentIntentFilters {
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
