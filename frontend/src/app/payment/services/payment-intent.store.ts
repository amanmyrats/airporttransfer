import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  CheckoutStep,
  ConfirmPaymentIntentPayload,
  CreatePaymentIntentPayload,
  PaymentIntentDto,
  PaymentIntentState,
  PaymentMethod,
  PaymentMethodDto,
  ReservationSummary,
} from '../models/payment.models';
import { PaymentService } from './payment.service';
import { CurrencyService } from '../../services/currency.service';
import { isCardMethod } from '../utils/payment-utils';
import { formatMinor, majorToMinor, minorToMajor } from '../utils/money.util';
import { THREE_DS_HANDLERS, ThreeDSHandler } from './three-ds.handlers';

const initialState: PaymentIntentState = {
  booking: null,
  intent: null,
  methods: [],
  selectedMethod: null,
  isLoading: false,
  error: null,
  step: 'method',
  intentHistory: [],
};

const TERMINAL_STATUSES: Array<PaymentIntentDto['status']> = ['succeeded', 'failed', 'canceled'];

@Injectable({ providedIn: 'root' })
export class PaymentIntentStore {
  private readonly paymentService = inject(PaymentService);
  private readonly currencyService = inject(CurrencyService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly handlers = inject(THREE_DS_HANDLERS, { optional: true }) ?? [];
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly state = signal<PaymentIntentState>(initialState);
  private pollHandle: ReturnType<typeof setTimeout> | null = null;

  readonly booking = computed(() => this.state().booking);
  readonly intent = computed(() => this.state().intent);
  readonly methods = computed(() => this.state().methods);
  readonly selectedMethod = computed(() => this.state().selectedMethod);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly step = computed(() => this.state().step);
  readonly intentHistory = computed(() => this.state().intentHistory);
  readonly formattedTotal = computed(() => {
    const booking = this.state().booking;
    const currency = booking?.currency_code ?? this.state().intent?.currency ?? null;
    if (!booking || !currency) {
      return '';
    }
    const amountMinor = majorToMinor(Number(booking.amount), booking.currency_code);
    return formatMinor(amountMinor, currency);
  });

  readonly dueMinor = computed(() => {
    const intent = this.state().intent;
    if (intent && typeof intent.due_minor === 'number') {
      return intent.due_minor;
    }
    const booking = this.state().booking;
    if (!booking) {
      return null;
    }
    return majorToMinor(Number(booking.amount), booking.currency_code);
  });

  readonly paidMinor = computed(() => this.state().intent?.paid_minor ?? 0);

  reset(): void {
    this.clearPoll();
    this.state.set(initialState);
  }

  async bootstrap(bookingRef: string): Promise<boolean> {
    try {
      this.patch({ isLoading: true, error: null });
      const [booking, methods, existingIntent, history] = await Promise.all([
        firstValueFrom(this.paymentService.fetchBookingSummary(bookingRef)),
        firstValueFrom(this.paymentService.getMethods()),
        firstValueFrom(this.paymentService.getIntentByBooking(bookingRef)).catch(() => null),
        firstValueFrom(this.paymentService.getIntentHistory(bookingRef)).catch(() => []),
      ]);
      const normalized = normalizeBooking(booking);
      this.patch({
        booking: normalized,
        methods: this.filterMethods(methods, normalized.currency_code),
        isLoading: false,
        selectedMethod: null,
        intent: existingIntent,
        intentHistory: history,
        step: this.resolveInitialStep(existingIntent),
      });
      return true;
    } catch (error) {
      console.error('Failed to bootstrap payment store', error);
      this.patch({ isLoading: false, error: 'Unable to load booking details.' });
      return false;
    }
  }

  async loadMethods(): Promise<void> {
    try {
      this.patch({ isLoading: true, error: null });
      const methods = await firstValueFrom(this.paymentService.getMethods());
      const currency = this.state().booking?.currency_code ?? null;
      this.patch({
        methods: this.filterMethods(methods, currency),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load payment methods', error);
      this.patch({
        isLoading: false,
        error: 'Unable to load payment methods.',
      });
    }
  }

  setMethod(method: PaymentMethod): void {
    this.patch({ selectedMethod: method, error: null });
  }

  async createOrResume(
    bookingRef: string,
    amountMinor: number,
    currency: string,
    method: PaymentMethod,
    returnUrl?: string,
    customer?: { email?: string | null; name?: string | null },
    metadata?: Record<string, unknown>,
  ): Promise<PaymentIntentDto | null> {
    const booking = this.state().booking;
    // console.log('this.state():', this.state());
    // console.log('Creating or resuming payment intent with method:', method);
    if (!booking) {
      this.patch({ error: 'Booking details are missing.' });
      return null;
    }
    // const existingIntent = this.state().intent;
    // find existing intent for the same method from this.state().intentHistory
    const existingIntent = this.state().intentHistory.find(intent => intent.method === method) ?? null;
    // console.log('Existing intent from history for method', method, ':', existingIntent);
    const intentForMethod = existingIntent?.method === method ? existingIntent : null;
    // console.log('Existing intent:', existingIntent);
    const hasOpenIntent = !!intentForMethod && !TERMINAL_STATUSES.includes(intentForMethod.status);
    // console.log('Has open intent:', hasOpenIntent);
    const isRetry = !!intentForMethod && TERMINAL_STATUSES.includes(intentForMethod.status);
    // console.log('Is retry:', isRetry);
    const resumableIntent = hasOpenIntent ? intentForMethod : null;
    const paymentDetails = this.resolvePaymentDetails(method, booking, resumableIntent);
    // console.log('Resolved payment details:', paymentDetails);
    if (!paymentDetails) {
      this.patch({ error: 'Unable to prepare payment amount for this method.' });
      return null;
    }
    if (paymentDetails.amountMinor <= 0) {
      this.patch({ error: null, step: 'result' });
      return existingIntent;
    }
    const metadataPayload = {
      ...(metadata ?? {}),
      ...(paymentDetails.metadata ?? {}),
    };
    const retryToken = isRetry ? this.generateRetryToken() : null;

    const payload: CreatePaymentIntentPayload = {
      booking_ref: bookingRef,
      amount_minor: paymentDetails.amountMinor,
      currency: paymentDetails.currency,
      method,
      customer,
      idempotency_key: this.buildIdempotencyKey( 
        bookingRef,
        paymentDetails.amountMinor,
        paymentDetails.currency,
        method,
        intentForMethod,
        retryToken,
      ),
      return_url: returnUrl,
      metadata: Object.keys(metadataPayload).length ? metadataPayload : undefined,
    };
    console.log('CreatePaymentIntentPayload:', payload);
    try {
      this.patch({
        isLoading: true,
        error: null,
        selectedMethod: method,
        step: isCardMethod(method) ? 'processing' : 'details',
      });
      const intent = await firstValueFrom(this.paymentService.createIntent(payload));
      console.log('Payment intent created:', intent);
      this.patch({ intent, isLoading: false });
      await this.handlePostIntent(intent);
      await this.refreshIntentHistory();
      return intent;
    } catch (error) {
      console.error('createOrResume failed', error);
      this.patch({
        isLoading: false,
        error: 'Unable to create payment intent. Please try again.',
      });
      return null;
    }
  }

  async confirm(publicId: string, payload?: ConfirmPaymentIntentPayload): Promise<PaymentIntentDto | null> {
    if (!publicId) {
      return null;
    }
    try {
      this.patch({ isLoading: true, error: null });
      const intent = await firstValueFrom(this.paymentService.confirm(publicId, payload));
      this.patch({ intent, isLoading: false });
      await this.handlePostIntent(intent);
      await this.refreshIntentHistory();
      return intent;
    } catch (error) {
      console.error('confirm failed', error);
      this.patch({ isLoading: false, error: 'Failed to confirm payment.' });
      return null;
    }
  }

  async refreshIntent(): Promise<PaymentIntentDto | null> {
    const intent = this.state().intent;
    if (!intent) {
      return null;
    }
    const refreshed = await this.loadIntent(intent.public_id);
    if (refreshed) {
      await this.handlePostIntent(refreshed);
    }
    return refreshed;
  }

  async loadIntent(publicId: string): Promise<PaymentIntentDto | null> {
    if (!publicId) {
      return null;
    }
    try {
      this.patch({ isLoading: true, error: null });
      const intent = await firstValueFrom(this.paymentService.getIntent(publicId));
      this.patch({
        intent,
        selectedMethod: intent.method,
        isLoading: false,
        step: TERMINAL_STATUSES.includes(intent.status) ? 'result' : 'processing',
      });
      await this.refreshIntentHistory();
      return intent;
    } catch (error) {
      console.error('loadIntent failed', error);
      this.patch({ isLoading: false, error: 'Unable to load payment intent.' });
      return null;
    }
  }

  async pollUntilTerminal(publicId: string): Promise<PaymentIntentDto | null> {
    if (!publicId) {
      return null;
    }
    if (!this.isBrowser) {
      return this.loadIntent(publicId);
    }
    this.clearPoll();
    this.patch({ step: 'processing' });

    return new Promise(resolve => {
      const poll = async (attempt = 0) => {
        try {
          const intent = await firstValueFrom(this.paymentService.getIntent(publicId));
          this.patch({ intent });
          if (TERMINAL_STATUSES.includes(intent.status)) {
            this.patch({ step: 'result' });
            await this.refreshIntentHistory();
            this.clearPoll();
            resolve(intent);
            return;
          }
          const delay = Math.min(12000, 2000 + attempt * 1500);
          this.pollHandle = setTimeout(() => void poll(attempt + 1), delay);
        } catch (error) {
          console.error('pollUntilTerminal failed', error);
          this.patch({ error: 'Unable to verify payment status.' });
          this.clearPoll();
          resolve(null);
        }
      };
      void poll();
    });
  }

  useIntent(intent: PaymentIntentDto): void {
    const nonCardOffline = !isCardMethod(intent.method);
    const nextStep = nonCardOffline
      ? intent.due_minor === 0
        ? 'result'
        : 'details'
      : this.resolveInitialStep(intent);
    this.patch({
      intent,
      selectedMethod: intent.method,
      step: nextStep,
    });
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
        }),
      );
      await this.loadIntent(intent.public_id);
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

  private async handlePostIntent(intent: PaymentIntentDto): Promise<void> {
    if (TERMINAL_STATUSES.includes(intent.status)) {
      this.patch({ step: 'result' });
      return;
    }
    if ((intent.due_minor ?? null) === 0) {
      this.patch({ step: 'result' });
      return;
    }
    if (isCardMethod(intent.method) && intent.status === 'requires_action') {
      await this.handleThreeDs(intent);
    } else if (intent.status === 'processing' && !isCardMethod(intent.method)) {
      this.patch({ step: 'processing' });
    }
  }

  private async handleThreeDs(intent: PaymentIntentDto): Promise<void> {
    if (!this.isBrowser || !intent.client_secret) {
      return;
    }
    const handler = this.resolveHandler(intent.provider);
    if (!handler) {
      this.patch({
        error: '3-D Secure authentication is required, but no handler is available.',
      });
      return;
    }
    try {
      const result = await handler.confirm(intent.client_secret, {
        intent,
        metadata: intent.metadata,
      });
      if (result === 'failed' || result === 'requires_payment_method') {
        this.patch({ error: 'Authentication failed. Please try another card.' });
        return;
      }
      await this.pollUntilTerminal(intent.public_id);
    } catch (error) {
      console.error('3DS handler failed', error);
      this.patch({ error: 'Authentication could not be completed.' });
    }
  }

  private resolveHandler(provider: string): ThreeDSHandler | null {
    return this.handlers.find(handler => handler.canHandle(provider)) ?? null;
  }

  private async refreshIntentHistory(): Promise<void> {
    const booking = this.state().booking;
    if (!booking?.number) {
      return;
    }
    try {
      const history = await firstValueFrom(this.paymentService.getIntentHistory(booking.number));
      this.patch({ intentHistory: history });
    } catch (error) {
      console.error('Failed to load payment intent history', error);
    }
  }

  private resolveInitialStep(intent: PaymentIntentDto | null): CheckoutStep {
    if (!intent) {
      return 'method';
    }
    const dueMinor =
      typeof intent.due_minor === 'number'
        ? intent.due_minor
        : Math.max(intent.amount_minor - (intent.paid_minor ?? 0), 0);
    if (dueMinor > 0) {
      return 'method';
    }
    const isTerminal = TERMINAL_STATUSES.includes(intent.status);
    if (isTerminal || dueMinor === 0) {
      return 'result';
    }
    if (isCardMethod(intent.method) && intent.status !== 'requires_payment_method') {
      return 'processing';
    }
    return 'method';
  }

  private clearPoll(): void {
    if (this.pollHandle) {
      clearTimeout(this.pollHandle);
      this.pollHandle = null;
    }
  }

  private buildIdempotencyKey(
    bookingRef: string,
    amountMinor: number,
    currency: string,
    method: PaymentMethod,
    existingIntent?: PaymentIntentDto | null,
    retryToken?: string | null,
  ): string {
    const base = `${bookingRef}-${amountMinor}-${currency}-${method}`;
    // console.log('Building idempotency key with base:', base);
    // console.log('retryToken:', retryToken);
    // console.log('bookingRef, amountMinor, currency, method:', bookingRef, amountMinor, currency, method);
    // console.log('TERMINAL_STATUSES:', TERMINAL_STATUSES);
    // console.log('existingIntent:', existingIntent);
    // console.log('Existing intent status:', existingIntent?.status);
    // console.log('Is existing intent in terminal status:', existingIntent ? TERMINAL_STATUSES.includes(existingIntent.status) : 'N/A');
    if (existingIntent && TERMINAL_STATUSES.includes(existingIntent.status)) {
      // console.log('Returning: ', `${base}-retry-${existingIntent.public_id}`);
      return `${base}-retry-${existingIntent.public_id}`;
    }
    if (retryToken) {
      // console.log('Returning with retryToken:', `${base}-retry-${retryToken}`);
      return `${base}-retry-${retryToken}`;
    }
    // console.log('Returning base idempotency key:', base);
    return base;
  }

  private generateRetryToken(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private filterMethods(methods: PaymentMethodDto[], currency: string | null): PaymentMethodDto[] {
    if (!currency) {
      return methods;
    }
    const normalizedCurrency = currency.toUpperCase();
    return methods.filter(method => {
      if (method.code === 'CASH') {
        return normalizedCurrency !== 'RUB';
      }
      if (!method.supportedCurrencies?.length) {
        return true;
      }
      return method.supportedCurrencies.includes(currency);
    });
  }

  private resolvePaymentDetails(
    method: PaymentMethod,
    booking: ReservationSummary,
    existingIntent: PaymentIntentDto | null,
  ): { amountMinor: number; currency: string; metadata?: Record<string, unknown> } | null {
    const dueFromIntent = existingIntent?.due_minor ?? null;
    const baseCurrency = booking.currency_code;
    const metadata: Record<string, unknown> = {};

    let amountMinor: number;
    let currency: string = baseCurrency;

    if (dueFromIntent != null && dueFromIntent > 0) {
      amountMinor = dueFromIntent;
      currency = existingIntent?.currency ?? baseCurrency;
    } else {
      const baseAmount = Number(booking.amount);
      if (Number.isNaN(baseAmount)) {
        return null;
      }
      amountMinor = majorToMinor(baseAmount, baseCurrency);
    }

    if (method === 'RUB_PHONE_TRANSFER' && currency !== 'RUB') {
      const fromCurrency = this.currencyService.getCurrencyByCode(currency);
      const rubCurrency = this.currencyService.getCurrencyByCode('RUB');
      if (!fromCurrency || !rubCurrency) {
        console.error('Missing currency configuration for RUB conversion.');
        return null;
      }
      const amountMajor = minorToMajor(amountMinor, currency);
      const rubAmount = this.currencyService.convert(amountMajor, fromCurrency, rubCurrency);
      currency = 'RUB';
      amountMinor = majorToMinor(rubAmount, 'RUB');
      metadata['original_currency'] = existingIntent?.currency ?? booking.currency_code;
      metadata['converted_currency'] = 'RUB';
      metadata['converted_amount'] = rubAmount;
    }

    metadata['due_minor'] = amountMinor;

    return { amountMinor, currency, metadata };
  }

  private patch(patch: Partial<PaymentIntentState>): void {
    this.state.update(state => ({ ...state, ...patch }));
  }
}

const normalizeBooking = (booking: ReservationSummary): ReservationSummary => ({
  ...booking,
  amount: typeof booking.amount === 'string' ? parseFloat(booking.amount) : booking.amount,
});
