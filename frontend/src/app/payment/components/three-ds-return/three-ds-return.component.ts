import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentIntentStore } from '../../services/payment-intent.store';

@Component({
  selector: 'app-three-ds-return',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-ds-return.component.html',
  styleUrls: ['./three-ds-return.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeDsReturnComponent implements OnInit {
  readonly status = signal<'pending' | 'success' | 'failed'>('pending');
  readonly message = signal('Checking payment status…');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: PaymentIntentStore,
  ) {}

  async ngOnInit(): Promise<void> {
    const bookingRef = this.route.parent?.snapshot.paramMap.get('bookingRef');
    const intentId =
      this.route.snapshot.queryParamMap.get('intent') ?? this.store.intent()?.public_id ?? null;

    if (!intentId) {
      this.status.set('failed');
      this.message.set('Missing payment reference.');
      return;
    }

    await this.store.loadIntent(intentId);
    const intent = await this.store.pollUntilTerminal(intentId);
    if (!intent) {
      this.status.set('failed');
      this.message.set('Unable to confirm payment at this time.');
      return;
    }

    if (intent.status === 'succeeded') {
      this.status.set('success');
      this.message.set('Payment confirmed. Thank you!');
    } else {
      this.status.set('failed');
      this.message.set('Payment could not be completed. Please try again.');
    }

    if (bookingRef) {
      await this.router.navigate(['../result'], {
        relativeTo: this.route,
        queryParams: { intent: intent.public_id },
      });
    }
  }

  async goBack() {
    const bookingRef = this.route.parent?.snapshot.paramMap.get('bookingRef');
    await this.router.navigate(['/checkout', bookingRef]);
  }
}
