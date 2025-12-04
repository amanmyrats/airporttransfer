import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';

import {
  PaymentAdminService,
  RefundIssuePayload,
  RefundIssueResponse,
} from '../../../payment/services/payment-admin.service';

@Component({
  selector: 'app-refund-issue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextarea, ButtonModule],
  templateUrl: './refund-issue.component.html',
  styleUrls: ['./refund-issue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefundIssueComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PaymentAdminService);

  readonly form = this.fb.group({
    paymentId: [null as number | null, [Validators.required, Validators.min(1)]],
    amountMinor: [null as number | null, [Validators.min(1)]],
    reason: [''],
  });

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly response = signal<RefundIssueResponse | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      return;
    }
    const payload: RefundIssuePayload = {
      payment_id: Number(this.form.value.paymentId),
      amount_minor: this.form.value.amountMinor ?? undefined,
      reason: this.form.value.reason ?? undefined,
    };
    this.submitting.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.service.issueRefund(payload));
      this.response.set(result);
    } catch (error) {
      console.error('issueRefund failed', error);
      this.error.set('Unable to create refund. Please confirm the payment ID and try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
