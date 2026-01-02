import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute } from '@angular/router';

import { PaymentAdminService } from '../../services/payment-admin.service';
import { PaymentDto, PaymentMethod } from '../../../../payment/models/payment.models';
import { formatMinor } from '../../../../payment/utils/money.util';
import { PaymentService } from '../../../../payment/services/payment.service';
import { ReservationService } from '../../../services/reservation.service';
import { syncReservationIsNakit } from '../../utils/reservation-payment.util';

@Component({
  selector: 'app-offline-settlement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextarea,
    ButtonModule,
  ],
  templateUrl: './offline-settlement.component.html',
  styleUrls: ['./offline-settlement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineSettlementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PaymentAdminService);
  private readonly paymentService = inject(PaymentService);
  private readonly reservationService = inject(ReservationService);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.group({
    publicId: ['', Validators.required],
    amountMinor: [null as number | null, [Validators.required, Validators.min(1)]],
    note: [''],
    previewCurrency: ['EUR'],
  });

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<PaymentDto | null>(null);

  readonly amountPreview = computed(() => {
    const amount = this.form.value.amountMinor;
    const currency = this.form.value.previewCurrency || 'EUR';
    if (amount == null) {
      return '';
    }
    return formatMinor(amount, currency);
  });

  readonly currencyOptions = ['EUR', 'USD', 'GBP', 'TRY', 'RUB'];

  constructor() {
    const publicId = this.route.snapshot.queryParamMap.get('public_id');
    const amountMinor = this.route.snapshot.queryParamMap.get('amount_minor');
    if (publicId) {
      this.form.patchValue({ publicId });
    }
    if (amountMinor) {
      const parsed = Number(amountMinor);
      if (!Number.isNaN(parsed)) {
        this.form.patchValue({ amountMinor: parsed });
      }
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const { publicId, amountMinor, note } = this.form.value;
    if (!publicId || amountMinor == null) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    try {
      const payment = await firstValueFrom(
        this.service.settleOffline(publicId.trim(), {
          amount_minor: amountMinor,
          note: note ?? undefined,
        }),
      );
      this.result.set(payment);
      await this.syncReservationPaymentMethod(publicId.trim(), payment);
    } catch (error) {
      console.error('settleOffline failed', error);
      this.error.set('Unable to settle this intent. Please verify the identifier and try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async pastePublicId(): Promise<void> {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      this.form.patchValue({ publicId: text.trim() });
    } catch (err) {
      console.warn('Clipboard read failed', err);
    }
  }

  private async syncReservationPaymentMethod(publicId: string, payment: PaymentDto): Promise<void> {
    try {
      const intent = payment.intent ?? (await this.fetchIntentMeta(publicId));
      if (!intent) {
        return;
      }
      await syncReservationIsNakit({
        bookingRef: intent.booking_ref,
        method: intent.method,
        paymentService: this.paymentService,
        reservationService: this.reservationService,
      });
    } catch (error) {
      console.warn('Unable to update reservation cash flag', error);
    }
  }

  private async fetchIntentMeta(
    publicId: string,
  ): Promise<{ booking_ref: string; method: PaymentMethod } | null> {
    try {
      const intent = await firstValueFrom(this.paymentService.getIntent(publicId));
      return { booking_ref: intent.booking_ref, method: intent.method };
    } catch (error) {
      console.warn('Unable to load intent for cash flag sync', error);
      return null;
    }
  }
}
