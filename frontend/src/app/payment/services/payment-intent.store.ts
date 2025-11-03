import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  CheckoutStep,
  ConfirmPaymentIntentPayload,
  CreatePaymentIntentPayload,
  PaymentIntent,
  PaymentIntentState,
  PaymentMethod,
  ReservationSummary,
} from '../models/payment.models';
import { PaymentService } from './payment.service';
import { isCardMethod, toMinorUnits } from '../utils/payment-utils';

const initialState: PaymentIntentState = {
  booking: null,
  intent: null,
  methods: [],
  selectedMethod: null,
  isLoading: false,
  error: null,
  step: 'method',
};

@Injectable({ providedIn: 'root' })
export class PaymentIntentStore {
  private paymentService = inject(PaymentService);
  private readonly state = signal<PaymentIntentState>(initialState);

  readonly booking = computed(() => this.state().booking);
  readonly intent = computed(() => this.state().intent);
  readonly methods = computed(() => this.state().methods);
  readonly selectedMethod = computed(() => this.state().selectedMethod);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly step = computed(() => this.state().step);

  reset(): void {
    this.state.set(initialState);
  }

  async bootstrap(bookingRef: string): Promise<boolean> {
    try {
      this.patch({ isLoading: true, error: null });
      const [booking, methods] = await Promise.all([
        firstValueFrom(this.paymentService.fetchBookingSummary(bookingRef)),
        firstValueFrom(this.paymentService.listMethods()),
      ]);
      this.patch({
        booking: normalizeBooking(booking),
        methods,
        isLoading: false,
        selectedMethod: null,
        intent: null,
        step: 'method',
      });
      return true;
    } catch (error) {
      console.error('Failed to bootstrap payment store', error);
      this.patch({ isLoading: false, error: 'Unable to load booking details.' });
      return false;
    }
  }

  setMethod(method: PaymentMethod): void {
    this.patch({ selectedMethod: method, error: null });
  }

  async createIntent(): Promise<PaymentIntent | null> {
    const state = this.state();
    if (!state.booking || !state.selectedMethod) {
      return null;
    }
    const payload: CreatePaymentIntentPayload = {
      booking_ref: state.booking.number,
      amount_minor: toMinorUnits(Number(state.booking.amount), state.booking.currency_code),
      currency: state.booking.currency_code,
      method: state.selectedMethod,
      customer: {
        email: state.booking.passenger_email,
        name: state.booking.passenger_name ?? undefined,
      },
      idempotency_key: `${state.booking.number}-${state.booking.currency_code}-${state.booking.amount}`,
      return_url: undefined,
    };

    try {
      this.patch({ isLoading: true, error: null, step: isCardMethod(state.selectedMethod) ? 'processing' : 'details' });
      const intent = await firstValueFrom(this.paymentService.createIntent(payload));
      this.patch({ intent, isLoading: false, step: isCardMethod(state.selectedMethod) ? 'processing' : 'details' });
      return intent;
    } catch (error) {
      console.error('createIntent failed', error);
      this.patch({ isLoading: false, error: 'Unable to create payment intent.' });
      return null;
    }
  }

  async refreshIntent(): Promise<PaymentIntent | null> {
    const intent = this.state().intent;
    if (!intent) {
      return null;
    }
    try {
      const refreshed = await firstValueFrom(this.paymentService.getIntent(intent.public_id));
      this.patch({ intent: refreshed });
      return refreshed;
    } catch (error) {
      console.error('refreshIntent failed', error);
      this.patch({ error: 'Failed to refresh payment intent.' });
      return null;
    }
  }

  async loadIntent(publicId: string): Promise<PaymentIntent | null> {
    try {
      this.patch({ isLoading: true, error: null });
      const intent = await firstValueFrom(this.paymentService.getIntent(publicId));
      this.patch({
        intent,
        selectedMethod: intent.method,
        isLoading: false,
        step: intent.status === 'succeeded' ? 'result' : 'processing',
      });
      return intent;
    } catch (error) {
      console.error('loadIntent failed', error);
      this.patch({ isLoading: false, error: 'Unable to load payment intent.' });
      return null;
    }
  }

  async confirmCardIntent(payload: ConfirmPaymentIntentPayload): Promise<PaymentIntent | null> {
    const intent = this.state().intent;
    if (!intent) {
      return null;
    }
    try {
      this.patch({ isLoading: true, error: null });
      const confirmed = await firstValueFrom(
        this.paymentService.confirmIntent(intent.public_id, payload)
      );
      this.patch({ intent: confirmed, isLoading: false });
      return confirmed;
    } catch (error) {
      console.error('confirmCardIntent failed', error);
      this.patch({ isLoading: false, error: 'Failed to confirm payment.' });
      return null;
    }
  }

  async uploadOfflineReceipt(file: File, note?: string | null): Promise<boolean> {
    const intent = this.state().intent;
    if (!intent) {
      return false;
    }
    try {
      this.patch({ isLoading: true, error: null });
      await firstValueFrom(
        this.paymentService.uploadOfflineReceipt(intent.public_id, {
          evidence_file: file,
          note: note ?? undefined,
        })
      );
      await this.refreshIntent();
      this.patch({ isLoading: false });
      return true;
    } catch (error) {
      console.error('uploadOfflineReceipt failed', error);
      this.patch({ isLoading: false, error: 'Failed to upload receipt.' });
      return false;
    }
  }

  markStep(step: CheckoutStep): void {
    this.patch({ step });
  }

  private patch(patch: Partial<PaymentIntentState>): void {
    this.state.update(state => ({ ...state, ...patch }));
  }
}

const normalizeBooking = (booking: ReservationSummary): ReservationSummary => ({
  ...booking,
  amount: typeof booking.amount === 'string' ? parseFloat(booking.amount) : booking.amount,
});
