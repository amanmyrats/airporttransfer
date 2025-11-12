export type ReservationStatus =
  | 'draft'
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'inoperation'
  | 'completed'
  | 'cancelled'
  | 'cancelled_by_user'
  | 'cancelled_by_operator'
  | 'no_show'
  | 'noshow';

export type ChangeRequestStatus =
  | 'pending_review'
  | 'auto_approved'
  | 'awaiting_user_payment'
  | 'approved_applied'
  | 'declined'
  | 'expired'
  | 'cancelled';

export class Reservation {
  id?: string;
  number?: string | null;
  amount?: string | null;
  currency_code?: string | null;
  reservation_date?: string | null;
  car_type?: string | null;
  transfer_type?: string | null;
  direction_type?: string | null;
  transfer_date?: string | null;
  transfer_time?: string | null;
  transfer_date_time?: string | null;
  flight_number?: string | null;
  flight_date?: string | null;
  flight_time?: string | null;
  flight_date_time?: string | null;
  passenger_name?: string | null;
  passenger_phone?: string | null;
  passenger_email?: string | null;
  passenger_count?: number | string | null;
  passenger_count_child?: number | string | null;
  note?: string | null;
  is_round_trip?: boolean | null;
  pickup_short?: string | null;
  pickup_full?: string | null;
  dest_short?: string | null;
  dest_full?: string | null;
  pickup_lat?: string | null;
  pickup_lon?: string | null;
  dest_lat?: string | null;
  dest_lon?: string | null;
  status?: ReservationStatus;
  latest_change_request_status?: ChangeRequestStatus | null;
  has_change_request?: boolean | null;
  need_child_seat?: boolean | string | null;
  child_seat_count?: number | string | null;
  greet_with_flower?: boolean | string | null;
  greet_with_champagne?: boolean | string | null;
  created_at?: string | null;
  updated_at?: string | null;

  constructor(init?: Partial<Reservation>) {
    Object.assign(this, init);
  }
}

export interface MyReservation {
  id: number;
  number: string | null;
  status: ReservationStatus;
  reservation_date: string | null;
  transfer_date: string | null;
  transfer_time: string | null;
  flight_number: string | null;
  flight_date: string | null;
  flight_time: string | null;
  passenger_name: string | null;
  passenger_email: string | null;
  passenger_phone: string | null;
  passenger_count: number;
  passenger_count_child: number;
  note: string | null;
  pickup_short: string | null;
  pickup_full: string | null;
  dest_short: string | null;
  dest_full: string | null;
  need_child_seat: boolean;
  child_seat_count: number;
  greet_with_champagne: boolean;
  greet_with_flower: boolean;
  payment_status: string | null;
  has_review: boolean;
  can_review: boolean;
  created_at: string;
  updated_at: string;
}

export type DuePaymentReservation = Pick<
  MyReservation,
  | 'id'
  | 'number'
  | 'status'
  | 'payment_status'
  | 'transfer_date'
  | 'transfer_time'
  | 'pickup_short'
  | 'pickup_full'
  | 'dest_short'
  | 'dest_full'
> & {
  due_minor: number | null;
  due_currency: string | null;
};

export interface ReservationPassengerEntry {
  id: number;
  full_name: string;
  is_child: boolean;
  order: number;
}

export interface ReservationPassengerInput {
  full_name: string;
  is_child: boolean;
  order: number;
}

export interface ReservationChangeSet {
  transfer_date?: string | null;
  transfer_time?: string | null;
  flight_date?: string | null;
  flight_time?: string | null;
  flight_number?: string | null;
  passenger_count?: number | null;
  passenger_count_child?: number | null;
  need_child_seat?: boolean;
  child_seat_count?: number | null;
  note?: string | null;
}

export interface ReservationChangeRequest {
  id: number;
  reservation: number;
  reservation_number: string | null;
  reservation_status: ReservationStatus;
  status: ChangeRequestStatus;
  proposed_changes: Record<string, unknown>;
  applied_changes: Record<string, unknown>;
  pricing_delta: string;
  cutoff_ok: boolean;
  requires_manual_review: boolean;
  reason_code: string | null;
  idempotency_key: string | null;
  expires_at: string | null;
  created_by: number;
  decided_by: number | null;
  decided_at: string | null;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateChangeRequestPayload {
  reason_code?: string | null;
  idempotency_key?: string | null;
  changes: ReservationChangeSet;
}

export interface CancelChangeRequestPayload {
  reason?: string;
}
