import { PaymentBankAccount as PaymentBankAccountDto, PaymentMethod } from '../../../payment/models/payment.models';

export type PaymentBankAccount = PaymentBankAccountDto;

export interface PaymentBankAccountPayload {
  label: string;
  method: PaymentMethod;
  currency: string;
  account_name: string;
  bank_name?: string | null;
  iban?: string | null;
  account_number?: string | null;
  swift_code?: string | null;
  branch_code?: string | null;
  phone_number?: string | null;
  reference_hint?: string | null;
  metadata?: Record<string, unknown> | null;
  priority?: number;
  is_active?: boolean;
}

export interface PaymentBankAccountFilters {
  method?: PaymentMethod | null;
  currency?: string | null;
  is_active?: boolean | null;
}
