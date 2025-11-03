import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { PaymentMethod, PaymentMethodDescriptor } from '../../models/payment.models';

@Component({
  selector: 'app-payment-method-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-select.component.html',
  styleUrls: ['./payment-method-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodSelectComponent {
  @Input({ required: true }) methods: PaymentMethodDescriptor[] = [];
  @Input() selected: PaymentMethod | null = null;
  @Output() methodSelected = new EventEmitter<PaymentMethod>();

  protected trackByMethod = (_: number, item: PaymentMethodDescriptor) => item.method;

  onSelect(method: PaymentMethod) {
    this.methodSelected.emit(method);
  }

  protected labelFor(method: PaymentMethod): string {
    switch (method) {
      case 'CARD':
        return 'Pay with Card';
      case 'BANK_TRANSFER':
        return 'Bank Transfer';
      case 'CASH':
        return 'Cash on Delivery';
      case 'RUB_PHONE_TRANSFER':
        return 'Russian Phone Transfer';
      default:
        return method;
    }
  }
}
