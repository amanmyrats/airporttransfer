import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BankTransferInstruction } from '../../models/payment.models';
import { formatMinorUnits } from '../../utils/payment-utils';

@Component({
  selector: 'app-offline-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-instructions.component.html',
  styleUrls: ['./offline-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineInstructionsComponent {
  @Input() instruction: BankTransferInstruction | null = null;
  @Input() amountMinor = 0;
  @Input() currency = 'EUR';
  @Input() bookingRef = '';

  protected formatAmount(): string {
    return formatMinorUnits(this.amountMinor, this.currency);
  }
}

