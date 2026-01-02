import { firstValueFrom } from 'rxjs';

import { PaymentMethod } from '../../../payment/models/payment.models';
import { PaymentService } from '../../../payment/services/payment.service';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';

const normalizeIsNakit = (value: Reservation['is_nakit']): boolean | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === '1' || value === 'true') {
    return true;
  }
  if (value === '0' || value === 'false') {
    return false;
  }
  return null;
};

const methodToIsNakit = (method: PaymentMethod): boolean => method === 'CASH';

export const syncReservationIsNakit = async (params: {
  bookingRef: string;
  method: PaymentMethod;
  paymentService: PaymentService;
  reservationService: ReservationService;
}): Promise<void> => {
  const { bookingRef, method, paymentService, reservationService } = params;
  if (!bookingRef) {
    return;
  }
  const summary = await firstValueFrom(paymentService.fetchBookingSummary(bookingRef));
  if (!summary?.id) {
    return;
  }
  const reservation = await firstValueFrom(reservationService.getAdmin(summary.id));
  const nextValue = methodToIsNakit(method);
  const currentValue = normalizeIsNakit(reservation.is_nakit);
  if (currentValue === nextValue) {
    return;
  }
  await firstValueFrom(
    reservationService.updateAdmin(summary.id, {
      ...reservation,
      is_nakit: nextValue,
    }),
  );
};
