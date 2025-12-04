import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PaymentIntentStore } from '../../services/payment-intent.store';
import { PaymentIntentDto } from '../../models/payment.models';

@Component({
  selector: 'app-checkout-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-result.component.html',
  styleUrls: ['./checkout-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutResultComponent implements OnInit {
  private readonly store = inject(PaymentIntentStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly intent = this.store.intent;
  protected readonly booking = this.store.booking;
  protected readonly formattedTotal = this.store.formattedTotal;

  async ngOnInit(): Promise<void> {
    const intentId = this.route.snapshot.queryParamMap.get('intent');
    if (!this.intent() && intentId) {
      await this.store.loadIntent(intentId);
    }
    if (!this.intent()) {
      await this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  protected statusLabel(intent: PaymentIntentDto): string {
    switch (intent.status) {
      case 'succeeded':
        return 'Payment confirmed';
      case 'processing':
        return 'Payment under review';
      case 'requires_payment_method':
        return 'Action needed';
      case 'failed':
      case 'canceled':
        return 'Payment failed';
      default:
        return 'Payment update';
    }
  }

  protected statusCopy(intent: PaymentIntentDto): string {
    switch (intent.status) {
      case 'succeeded':
        return 'Your reservation is now paid. A receipt has been sent to your email.';
      case 'processing':
        return 'We are verifying your transfer. You will receive an email once it is confirmed.';
      case 'requires_payment_method':
        return 'Your bank asked us to retry the charge. Please go back and try another method.';
      case 'failed':
      case 'canceled':
        return 'The payment could not be completed. You can return to checkout to try again.';
      default:
        return 'We will keep you posted as the payment progresses.';
    }
  }

  protected receiptUrl(): string | null {
    const intent = this.intent();
    if (!intent) {
      return null;
    }
    const receipt = intent.payments.find(payment => !!payment.receipt_url);
    return receipt?.receipt_url ?? null;
  }
}
