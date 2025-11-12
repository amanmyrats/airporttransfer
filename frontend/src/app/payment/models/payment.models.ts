export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'RUB_PHONE_TRANSFER' | 'CARD';

export type IntentStatus =
  | 'requires_payment_method'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'failed';

export type PaymentStatus = 'succeeded' | 'partially_refunded' | 'refunded' | 'failed';
export type RefundStatus = 'pending' | 'succeeded' | 'failed';

export interface LedgerEntry {
  id: number;
  kind: string;
  delta_minor: number;
  currency: string;
  payment_id: number | null;
  refund_id: number | null;
  created_at: string;
}

export interface BankTransferInstruction {
  iban: string;
  account_name: string;
  bank_name: string;
  reference_text: string;
  expires_at: string | null;
  phone_number?: string | null;
}

export interface OfflineReceipt {
  id: number;
  note: string | null;
  evidence_file: string;
  submitted_by: number | null;
  created_at: string;
}

export interface PaymentDto {
  id: number;
  provider_payment_id: string;
  amount_minor: number;
  currency: string;
  status: PaymentStatus;
  card_brand: string | null;
  last4: string | null;
  receipt_url: string | null;
  captured_at: string | null;
  refundable_minor: number;
  metadata: Record<string, unknown> | null;
  intent?: {
    public_id: string;
    booking_ref: string;
    method: PaymentMethod;
  } | null;
}

export interface PaymentIntentDto {
  public_id: string;
  booking_ref: string;
  amount_minor: number;
  currency: string;
  method: PaymentMethod;
  status: IntentStatus;
  provider: string;
  provider_intent_id: string | null;
  client_secret: string | null;
  customer_email: string | null;
  customer_name: string | null;
  capture_method: 'automatic' | 'manual';
  return_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  payments: PaymentDto[];
  offline_receipts: OfflineReceipt[];
  bank_transfer_instruction: BankTransferInstruction | null;
  ledger_entries: LedgerEntry[];
  paid_minor?: number;
  refunded_minor?: number;
  due_minor?: number;
}

export interface PendingIntentReservationSummary {
  id: number;
  number: string;
  passenger_name: string | null;
  passenger_email: string | null;
  passenger_phone: string | null;
  transfer_date: string | null;
  transfer_time: string | null;
  pickup_short: string | null;
  dest_short: string | null;
  status: string | null;
  payment_status: string | null;
}

export interface PendingSettlementIntent {
  public_id: string;
  booking_ref: string;
  amount_minor: number;
  currency: string;
  method: PaymentMethod;
  status: IntentStatus;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
  updated_at: string;
  paid_minor: number;
  due_minor: number;
  reservation: PendingIntentReservationSummary | null;
}

export interface PaymentMethodDto {
  code: PaymentMethod;
  label: string;
  supportedCurrencies: string[];
  provider: string;
  metadata?: Record<string, unknown> | null;
}

// Backward compatibility aliases (to be removed once callers migrate to the DTO names).
export type PaymentIntent = PaymentIntentDto;
export type PaymentRecord = PaymentDto;
export type PaymentMethodDescriptor = PaymentMethodDto;

export interface CreatePaymentIntentPayload {
  booking_ref: string;
  amount_minor: number;
  currency: string;
  method: PaymentMethod;
  customer?: {
    email?: string | null;
    name?: string | null;
  };
  return_url?: string | null;
  capture_method?: 'automatic' | 'manual';
  idempotency_key: string;
  metadata?: Record<string, unknown>;
}

export interface ConfirmPaymentIntentPayload {
  payment_method_payload?: Record<string, unknown>;
}

export interface OfflineReceiptPayload {
  evidence_file: File;
  note?: string | null;
}

export interface OfflineSettlementPayload {
  amount_minor: number;
  note?: string | null;
}

export interface PaymentIntentState {
  booking: ReservationSummary | null;
  intent: PaymentIntentDto | null;
  methods: PaymentMethodDto[];
  selectedMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;
  step: CheckoutStep;
  intentHistory: PaymentIntentDto[];
}

export type CheckoutStep = 'method' | 'details' | 'processing' | 'result';

export interface ReservationSummary {
  id: number;
  number: string;
  amount: number | string;
  currency_code: string;
  passenger_name: string | null;
  passenger_email: string | null;
  passenger_phone: string | null;
  transfer_date: string | null;
  transfer_time: string | null;
  pickup_full: string | null;
  dest_full: string | null;
  payment_status?: string;
}

export interface PaymentResult {
  status: IntentStatus;
  message: string;
}
