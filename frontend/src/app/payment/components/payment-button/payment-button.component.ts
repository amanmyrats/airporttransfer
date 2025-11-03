import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-button.component.html',
  styleUrls: ['./payment-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentButtonComponent implements OnChanges, OnDestroy {
  @Input() clientSecret: string | null = null;
  @Input() publishableKey: string | null = null;
  @Input() returnUrl: string | null = null;
  @Input() bookingRef: string | null = null;
  @Input() intentId: string | null = null;
  @Output() statusChange = new EventEmitter<'succeeded' | 'requires_action' | 'failed'>();

  processing = false;
  message: string | null = null;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['clientSecret'] || changes['publishableKey']) && this.isBrowser) {
      void this.setupElements();
    }
  }

  ngOnDestroy(): void {
    if (this.elements) {
      this.paymentElement?.destroy();
    }
  }

  async confirm(): Promise<void> {
    if (!this.stripe || !this.elements || this.processing) {
      return;
    }
    this.processing = true;
    this.message = null;
    const result = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url:
          this.returnUrl ?? this.buildReturnUrl(),
      },
      redirect: 'if_required',
    });
    this.processing = false;

    if (result.error) {
      this.message = result.error.message ?? 'Payment failed. Please try again.';
      this.statusChange.emit('failed');
      return;
    }

    const status = result.paymentIntent?.status;
    if (status === 'succeeded') {
      this.statusChange.emit('succeeded');
      this.message = 'Payment succeeded!';
    } else if (status === 'requires_action') {
      this.statusChange.emit('requires_action');
      this.message = 'Additional authentication required.';
    } else {
      this.statusChange.emit('failed');
      this.message = 'Payment processing. Please wait.';
    }
  }

  private async setupElements() {
    if (!this.clientSecret || !this.publishableKey) {
      return;
    }
    this.stripe = await loadStripe(this.publishableKey);
    if (!this.stripe) {
      this.message = 'Unable to initialise Stripe.';
      return;
    }
    this.elements = this.stripe.elements({
      clientSecret: this.clientSecret,
      appearance: { theme: 'stripe' },
    });
    this.paymentElement?.destroy();
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  private buildReturnUrl(): string | undefined {
    if (typeof window === 'undefined' || !this.bookingRef || !this.intentId) {
      return undefined;
    }
    const url = new URL(window.location.href);
    url.pathname = `/checkout/${this.bookingRef}/3ds-return`;
    url.searchParams.set('intent', this.intentId);
    return url.toString();
  }
}
