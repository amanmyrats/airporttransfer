from __future__ import annotations

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .enums import IntentStatus, PaymentStatus, RefundStatus
from .models import Payment, PaymentIntent, Refund


@receiver(post_save, sender=PaymentIntent)
def handle_intent_status_change(sender, instance: PaymentIntent, created: bool, **kwargs):
    if instance.status != IntentStatus.SUCCEEDED.value:
        return
    from transfer.models import Reservation

    Reservation.objects.filter(number=instance.booking_ref).update(
        payment_status="paid"
    )


@receiver(post_save, sender=Refund)
def handle_refund_status(sender, instance: Refund, created: bool, **kwargs):
    if instance.status != RefundStatus.SUCCEEDED.value:
        return
    from transfer.models import Reservation

    payment_status = (
        "refunded"
        if instance.payment.status == PaymentStatus.REFUNDED.value
        else "partial_refund"
    )
    Reservation.objects.filter(
        number=instance.payment.payment_intent.booking_ref
    ).update(payment_status=payment_status)
