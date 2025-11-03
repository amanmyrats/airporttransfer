import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentIntentStore } from '../../services/payment-intent.store';
import { intentIsFinal } from '../../utils/payment-utils';

@Component({
  selector: 'app-three-ds-return',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-ds-return.component.html',
  styleUrls: ['./three-ds-return.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeDsReturnComponent implements OnInit, OnDestroy {
  readonly status = signal<'pending' | 'success' | 'failed'>('pending');
  readonly message = signal('Checking payment status…');

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: PaymentIntentStore,
  ) {}

  async ngOnInit(): Promise<void> {
    const intentId = this.route.snapshot.queryParamMap.get('intent');
    if (intentId) {
      await this.store.loadIntent(intentId);
    }
    this.pollUntilFinal();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async goBack() {
    const bookingRef = this.route.parent?.snapshot.paramMap.get('bookingRef');
    await this.router.navigate(['/checkout', bookingRef]);
  }

  private pollUntilFinal() {
    this.intervalId = setInterval(async () => {
      const intent = await this.store.refreshIntent();
      if (!intent) {
        return;
      }
      if (intent.status === 'succeeded') {
        this.status.set('success');
        this.message.set('Payment confirmed. Thank you!');
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      } else if (intent.status === 'failed' || intent.status === 'canceled') {
        this.status.set('failed');
        this.message.set('Payment could not be completed. Please try again.');
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }
    }, 4000);
  }
}

