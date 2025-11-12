from __future__ import annotations

from typing import Any, Mapping, MutableMapping

from django.db import transaction
from django.utils import timezone

from .enums import (
    IntentStatus,
    LedgerEntryKind,
    PaymentMethod,
    PaymentStatus,
    ProviderSlug,
    RefundStatus,
)
from .models import (
    BankTransferInstruction,
    LedgerEntry,
    OfflineReceipt,
    Payment,
    PaymentIntent,
    PaymentProviderAccount,
    Refund,
)
from .providers import get_provider
from .providers.base import ProviderCustomer


class PaymentError(Exception):
    """Raised when payment orchestration fails."""


def _snapshot_intent(intent: PaymentIntent) -> dict[str, Any]:
    return {
        "public_id": str(intent.public_id),
        "booking_ref": intent.booking_ref,
        "amount_minor": intent.amount_minor,
        "currency": intent.currency,
        "status": intent.status,
        "method": intent.method,
        "provider": intent.provider,
        "provider_intent_id": intent.provider_intent_id,
        "metadata": intent.metadata,
    }


def _snapshot_payment(payment: Payment | None) -> dict[str, Any] | None:
    if not payment:
        return None
    return {
        "id": payment.id,
        "provider_payment_id": payment.provider_payment_id,
        "amount_minor": payment.amount_minor,
        "currency": payment.currency,
        "status": payment.status,
        "card_brand": payment.card_brand,
        "last4": payment.last4,
    }


def _snapshot_refund(refund: Refund | None) -> dict[str, Any] | None:
    if not refund:
        return None
    return {
        "id": refund.id,
        "provider_refund_id": refund.provider_refund_id,
        "amount_minor": refund.amount_minor,
        "status": refund.status,
    }


def _log_ledger(
    *,
    kind: LedgerEntryKind,
    intent: PaymentIntent,
    delta_minor: int,
    payment: Payment | None = None,
    refund: Refund | None = None,
) -> LedgerEntry:
    snapshot: MutableMapping[str, Any] = {
        "intent": _snapshot_intent(intent),
    }
    if payment:
        snapshot["payment"] = _snapshot_payment(payment)
    if refund:
        snapshot["refund"] = _snapshot_refund(refund)

    return LedgerEntry.objects.create(
        kind=kind.value,
        booking_ref=intent.booking_ref,
        intent=intent,
        payment=payment,
        refund=refund,
        delta_minor=delta_minor,
        currency=intent.currency,
        snapshot=snapshot,
    )


def _resolve_provider_account(provider: str) -> PaymentProviderAccount | None:
    return (
        PaymentProviderAccount.objects.filter(
            provider=provider, is_active=True
        ).order_by("-created_at")
    ).first()


@transaction.atomic
def create_payment_intent(
    *,
    booking_ref: str,
    amount_minor: int,
    currency: str,
    method: str | PaymentMethod,
    return_url: str | None,
    customer: Mapping[str, Any] | None,
    capture_method: str = PaymentIntent.CAPTURE_METHOD_AUTOMATIC,
    idempotency_key: str,
    provider: str | None = None,
    metadata: Mapping[str, Any] | None = None,
    offline_instructions: Mapping[str, Any] | None = None,
) -> PaymentIntent:
    method_enum = PaymentMethod(method)
    metadata = metadata or {}
    provider_slug = provider or (
        ProviderSlug.STRIPE.value if method_enum.is_card else ProviderSlug.OFFLINE.value
    )

    try:
        intent = (
            PaymentIntent.objects.select_for_update()
            .get(idempotency_key=idempotency_key)
        )
        return intent
    except PaymentIntent.DoesNotExist:
        pass

    provider_account = _resolve_provider_account(provider_slug)
    intent_status = (
        IntentStatus.REQUIRES_ACTION
        if method_enum.is_offline
        else IntentStatus.REQUIRES_PAYMENT_METHOD
    )

    intent = PaymentIntent(
        booking_ref=booking_ref,
        amount_minor=amount_minor,
        currency=currency.upper(),
        method=method_enum.value,
        status=intent_status.value,
        provider=provider_slug,
        provider_account=provider_account,
        idempotency_key=idempotency_key,
        customer_email=(customer or {}).get("email"),
        customer_name=(customer or {}).get("name"),
        capture_method=capture_method,
        return_url=return_url,
        metadata=dict(metadata),
    )
    intent.full_clean()

    if method_enum.is_card:
        provider_impl = get_provider(provider_slug)
        customer_dto = ProviderCustomer(
            email=intent.customer_email,
            name=intent.customer_name,
        )
        create_result = provider_impl.create_intent(
            amount_minor=amount_minor,
            currency=intent.currency,
            capture_method=capture_method,
            customer=customer_dto,
            return_url=return_url,
            metadata=intent.metadata,
            idempotency_key=idempotency_key,
        )
        intent.provider_intent_id = create_result.intent_id
        intent.client_secret = create_result.client_secret
        intent.status = create_result.status.value
        intent.last_synced_at = timezone.now()

    intent.save()

    if method_enum in {PaymentMethod.BANK_TRANSFER, PaymentMethod.RUB_PHONE_TRANSFER} and offline_instructions:
        BankTransferInstruction.objects.update_or_create(
            payment_intent=intent,
            defaults={
                "iban": offline_instructions.get("iban", ""),
                "phone_number": offline_instructions.get("phone_number", ""),
                "account_name": offline_instructions.get("account_name", ""),
                "bank_name": offline_instructions.get("bank_name", ""),
                "reference_text": offline_instructions.get(
                    "reference_text", booking_ref
                ),
                "expires_at": offline_instructions.get("expires_at"),
            },
        )

    _log_ledger(
        kind=LedgerEntryKind.INTENT_CREATED,
        intent=intent,
        delta_minor=0,
    )
    return intent


@transaction.atomic
def confirm_payment_intent(
    *,
    public_id: str,
    payment_method_payload: Mapping[str, Any] | None = None,
) -> PaymentIntent:
    intent = (
        PaymentIntent.objects.select_for_update(of=("self",))
        .select_related("provider_account")
        .get(public_id=public_id)
    )
    method = PaymentMethod(intent.method)

    if method.is_offline:
        intent.status = IntentStatus.PROCESSING.value
        intent.save(update_fields=["status", "updated_at"])
        intent.refresh_status_from_payments()
        _log_ledger(
            kind=LedgerEntryKind.INTENT_UPDATED,
            intent=intent,
            delta_minor=0,
        )
        return intent

    provider_impl = get_provider(intent.provider)
    confirm_result = provider_impl.confirm_intent(
        intent.provider_intent_id, payment_method_payload
    )
    intent.status = confirm_result.intent_status.value
    intent.client_secret = confirm_result.client_secret or intent.client_secret
    intent.last_synced_at = timezone.now()
    intent.save(update_fields=["status", "client_secret", "last_synced_at", "updated_at"])

    payment: Payment | None = None
    previous_status: str | None = None
    if confirm_result.payment_id and confirm_result.payment_status:
        existing_payment = Payment.objects.filter(
            provider_payment_id=confirm_result.payment_id
        ).first()
        previous_status = existing_payment.status if existing_payment else None
        payment, _ = Payment.objects.update_or_create(
            provider_payment_id=confirm_result.payment_id,
            defaults={
                "payment_intent": intent,
                "amount_minor": intent.amount_minor,
                "currency": intent.currency,
                "status": confirm_result.payment_status.value,
                "captured_at": timezone.now()
                if confirm_result.payment_status is PaymentStatus.SUCCEEDED
                else None,
                "refundable_minor": intent.amount_minor,
            },
        )
        if confirm_result.payment_status is PaymentStatus.SUCCEEDED and previous_status != PaymentStatus.SUCCEEDED.value:
            _log_ledger(
                kind=LedgerEntryKind.PAYMENT_SUCCEEDED,
                intent=intent,
                payment=payment,
                delta_minor=payment.amount_minor,
            )
        elif confirm_result.payment_status is PaymentStatus.FAILED and previous_status != PaymentStatus.FAILED.value:
            _log_ledger(
                kind=LedgerEntryKind.PAYMENT_FAILED,
                intent=intent,
                payment=payment,
                delta_minor=0,
            )

    _log_ledger(
        kind=LedgerEntryKind.INTENT_UPDATED,
        intent=intent,
        payment=payment,
        delta_minor=0,
    )
    intent.refresh_status_from_payments()
    return intent


@transaction.atomic
def sync_intent_from_provider(
    *,
    provider: str,
    provider_intent_id: str,
) -> PaymentIntent:
    intent = (
        PaymentIntent.objects.select_for_update(of=("self",))
        .select_related("provider_account")
        .get(provider=provider, provider_intent_id=provider_intent_id)
    )
    provider_impl = get_provider(provider)
    details = provider_impl.retrieve_intent(provider_intent_id)

    intent.status = details.status.value
    intent.client_secret = details.client_secret or intent.client_secret
    intent.last_synced_at = timezone.now()
    intent.save(update_fields=["status", "client_secret", "last_synced_at", "updated_at"])

    payment: Payment | None = None
    previous_status: str | None = None
    if details.latest_payment_id:
        existing_payment = Payment.objects.filter(
            provider_payment_id=details.latest_payment_id
        ).first()
        previous_status = existing_payment.status if existing_payment else None
        payment_defaults = {
            "payment_intent": intent,
            "amount_minor": details.amount_minor,
            "currency": details.currency,
            "status": details.latest_payment_status.value
            if details.latest_payment_status
            else PaymentStatus.PROCESSING.value,
            "captured_at": timezone.now()
            if details.latest_payment_status is PaymentStatus.SUCCEEDED
            else None,
            "refundable_minor": details.amount_minor,
        }
        payment, _ = Payment.objects.update_or_create(
            provider_payment_id=details.latest_payment_id,
            defaults=payment_defaults,
        )
        if (
            details.latest_payment_status is PaymentStatus.SUCCEEDED
            and previous_status != PaymentStatus.SUCCEEDED.value
        ):
            _log_ledger(
                kind=LedgerEntryKind.PAYMENT_SUCCEEDED,
                intent=intent,
                payment=payment,
                delta_minor=payment.amount_minor,
            )
        elif (
            details.latest_payment_status is PaymentStatus.FAILED
            and previous_status != PaymentStatus.FAILED.value
        ):
            _log_ledger(
                kind=LedgerEntryKind.PAYMENT_FAILED,
                intent=intent,
                payment=payment,
                delta_minor=0,
            )

    _log_ledger(
        kind=LedgerEntryKind.INTENT_UPDATED,
        intent=intent,
        payment=payment,
        delta_minor=0,
    )
    intent.refresh_status_from_payments()
    return intent


@transaction.atomic
def record_offline_receipt(
    *,
    public_id: str,
    evidence_file,
    note: str | None,
    submitted_by,
) -> OfflineReceipt:
    intent = (
        PaymentIntent.objects.select_for_update()
        .get(public_id=public_id)
    )
    if not PaymentMethod(intent.method).is_offline:
        raise PaymentError("Offline receipts are allowed only for offline methods.")
    receipt = OfflineReceipt.objects.create(
        payment_intent=intent,
        evidence_file=evidence_file,
        note=note,
        submitted_by=submitted_by,
    )
    _log_ledger(
        kind=LedgerEntryKind.OFFLINE_RECEIPT_SUBMITTED,
        intent=intent,
        delta_minor=0,
    )
    return receipt


@transaction.atomic
def record_offline_settlement(
    *,
    public_id: str,
    amount_minor: int,
    receipt: OfflineReceipt | None = None,
    note: str | None = None,
) -> Payment:
    intent = (
        PaymentIntent.objects.select_for_update()
        .get(public_id=public_id)
    )
    method = PaymentMethod(intent.method)
    if not method.is_offline:
        raise PaymentError("Offline settlement is only valid for offline methods.")

    payment = Payment.objects.create(
        payment_intent=intent,
        provider_payment_id=f"offline-{intent.public_id}-{int(timezone.now().timestamp())}",
        amount_minor=amount_minor,
        currency=intent.currency,
        status=PaymentStatus.SUCCEEDED.value,
        captured_at=timezone.now(),
        refundable_minor=amount_minor,
        metadata={"note": note} if note else {},
    )

    intent.refresh_status_from_payments()

    _log_ledger(
        kind=LedgerEntryKind.PAYMENT_SUCCEEDED,
        intent=intent,
        payment=payment,
        delta_minor=amount_minor,
    )
    return payment


@transaction.atomic
def decline_offline_intent(
    *,
    public_id: str,
    reason: str | None = None,
) -> PaymentIntent:
    intent = (
        PaymentIntent.objects.select_for_update()
        .get(public_id=public_id)
    )
    method = PaymentMethod(intent.method)
    if not method.is_offline:
        raise PaymentError("Decline is only supported for offline payment methods.")

    metadata = dict(intent.metadata or {})
    if reason:
        metadata["decline_reason"] = reason
    intent.metadata = metadata
    intent.status = IntentStatus.FAILED.value
    intent.updated_at = timezone.now()
    intent.save(update_fields=["status", "metadata", "updated_at"])

    _log_ledger(
        kind=LedgerEntryKind.INTENT_UPDATED,
        intent=intent,
        delta_minor=0,
    )
    return intent


@transaction.atomic
def issue_refund(
    *,
    payment_id: int,
    amount_minor: int | None,
    reason: str | None = None,
    idempotency_key: str | None = None,
) -> Refund:
    payment = (
        Payment.objects.select_for_update()
        .select_related("payment_intent")
        .get(id=payment_id)
    )
    intent = payment.payment_intent
    method = PaymentMethod(intent.method)

    if amount_minor is None:
        amount_minor = payment.refundable_minor
    if amount_minor <= 0:
        raise PaymentError("Refund amount must be greater than zero.")
    if amount_minor > payment.refundable_minor:
        raise PaymentError("Refund amount exceeds refundable balance.")

    if method.is_offline or intent.provider == ProviderSlug.OFFLINE.value:
        refund = Refund.objects.create(
            payment=payment,
            amount_minor=amount_minor,
            provider_refund_id=f"offline-refund-{intent.public_id}-{int(timezone.now().timestamp())}",
            status=RefundStatus.SUCCEEDED.value,
            reason=reason,
        )
        payment.refundable_minor -= amount_minor
        payment.status = (
            PaymentStatus.REFUNDED.value
            if payment.refundable_minor == 0
            else PaymentStatus.PARTIALLY_REFUNDED.value
        )
        payment.save(update_fields=["refundable_minor", "status", "updated_at"])
    else:
        provider_impl = get_provider(intent.provider)
        refund_result = provider_impl.refund(
            payment.provider_payment_id,
            amount_minor=amount_minor,
            idempotency_key=idempotency_key,
        )
        refund = Refund.objects.create(
            payment=payment,
            amount_minor=refund_result.amount_minor,
            provider_refund_id=refund_result.refund_id,
            status=refund_result.status.value,
            reason=reason,
            metadata={"provider_payload": refund_result.raw},
        )
        if refund_result.status is RefundStatus.SUCCEEDED:
            payment.refundable_minor -= refund_result.amount_minor
            payment.status = (
                PaymentStatus.REFUNDED.value
                if payment.refundable_minor == 0
                else PaymentStatus.PARTIALLY_REFUNDED.value
            )
            payment.save(update_fields=["refundable_minor", "status", "updated_at"])

    if refund.status == RefundStatus.SUCCEEDED.value:
        ledger_kind = LedgerEntryKind.REFUND_SUCCEEDED
    elif refund.status == RefundStatus.FAILED.value:
        ledger_kind = LedgerEntryKind.REFUND_FAILED
    else:
        ledger_kind = LedgerEntryKind.REFUND_REQUESTED

    _log_ledger(
        kind=ledger_kind,
        intent=intent,
        payment=payment,
        refund=refund,
        delta_minor=-amount_minor,
    )
    return refund
