import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PaymentIntentStore } from '../../services/payment-intent.store';
import { PaymentMethod } from '../../models/payment.models';
import { PaymentMethodSelectComponent } from '../../components/payment-method-select/payment-method-select.component';
import { OfflineInstructionsComponent } from '../../components/offline-instructions/offline-instructions.component';
import { UploadReceiptComponent } from '../../components/upload-receipt/upload-receipt.component';
import { PaymentButtonComponent } from '../../components/payment-button/payment-button.component';
import { formatMinorUnits, intentIsFinal, isCardMethod, isOfflineMethod, toMinorUnits } from '../../utils/payment-utils';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, PaymentMethodSelectComponent, OfflineInstructionsComponent, UploadReceiptComponent, PaymentButtonComponent],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent {
  private readonly store = inject(PaymentIntentStore);

  protected readonly booking = this.store.booking;
  protected readonly methods = this.store.methods;
  protected readonly intent = this.store.intent;
  protected readonly isLoading = this.store.isLoading;
  protected readonly selectedMethod = this.store.selectedMethod;
  protected readonly error = this.store.error;

  protected readonly amountFormatted = computed(() => {
    const booking = this.booking();
    if (!booking) {
      return '';
    }
    const minor = toMinorUnits(Number(booking.amount), booking.currency_code);
    return formatMinorUnits(minor, booking.currency_code);
  });

  protected readonly cardPublishableKey = computed(() => {
    const descriptor = this.methods().find(method => method.method === 'CARD');
    const metadata = descriptor?.metadata as Record<string, unknown> | undefined;
    return (metadata?.['publishable_key'] as string) ?? null;
  });

  protected async onMethodSelected(method: PaymentMethod) {
    this.store.setMethod(method);
    await this.store.createIntent();
  }

  protected async onReceiptSubmit(event: { file: File; note?: string | null }) {
    await this.store.uploadOfflineReceipt(event.file, event.note ?? undefined);
  }

  protected async onCardStatusChange(status: 'succeeded' | 'requires_action' | 'failed') {
    if (status === 'succeeded') {
      await this.store.refreshIntent();
    }
  }

  protected isCard = isCardMethod;
  protected isOffline = isOfflineMethod;
  protected intentIsFinal = intentIsFinal;
}
