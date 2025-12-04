from django.core.exceptions import ValidationError
from django.test import TestCase

from payment.enums import IntentStatus, LedgerEntryKind, PaymentMethod, PaymentStatus, RefundStatus
from payment.models import LedgerEntry, Payment, PaymentIntent, Refund
from transfer.models import Reservation


class PaymentModelTests(TestCase):
    def setUp(self):
        self.reservation = Reservation.objects.create(
            number='RES-001',
            amount=100,
            currency_code='EUR',
            passenger_name='Test Passenger',
        )

    def test_payment_intent_validates_currency(self):
        intent = PaymentIntent(
            booking_ref=self.reservation.number,
            amount_minor=10000,
            currency='JPY',
            method=PaymentMethod.BANK_TRANSFER.value,
            status=IntentStatus.REQUIRES_ACTION.value,
            provider='offline',
            idempotency_key='test-key',
        )
        with self.assertRaises(ValidationError):
            intent.full_clean()

    def test_ledger_entry_is_immutable(self):
        intent = PaymentIntent.objects.create(
            booking_ref=self.reservation.number,
            amount_minor=10000,
            currency='EUR',
            method=PaymentMethod.CARD.value,
            status=IntentStatus.PROCESSING.value,
            provider='stripe',
            idempotency_key='immutability-test',
        )
        entry = LedgerEntry.objects.create(
            kind=LedgerEntryKind.INTENT_CREATED.value,
            booking_ref=intent.booking_ref,
            intent=intent,
            delta_minor=0,
            currency=intent.currency,
            snapshot={},
        )
        with self.assertRaises(ValidationError):
            entry.save()

    def test_signals_update_reservation_payment_status(self):
        intent = PaymentIntent.objects.create(
            booking_ref=self.reservation.number,
            amount_minor=10000,
            currency='EUR',
            method=PaymentMethod.CARD.value,
            status=IntentStatus.PROCESSING.value,
            provider='stripe',
            idempotency_key='signal-test',
        )
        Payment.objects.create(
            payment_intent=intent,
            provider_payment_id='pi_123',
            amount_minor=10000,
            currency='EUR',
            status=PaymentStatus.SUCCEEDED.value,
        )
        intent.status = IntentStatus.SUCCEEDED.value
        intent.save(update_fields=['status', 'updated_at'])

        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.payment_status, 'paid')

        refund = Refund.objects.create(
            payment=intent.payments.first(),
            amount_minor=5000,
            provider_refund_id='re_123',
            status=RefundStatus.SUCCEEDED.value,
        )
        refund.save()
        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.payment_status, 'partial_refund')

