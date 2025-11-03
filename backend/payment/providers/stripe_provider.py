from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping

from django.conf import settings
from django.http import HttpRequest

from ..enums import IntentStatus, PaymentStatus, ProviderSlug, RefundStatus
from .base import (
    BaseProvider,
    ConfirmIntentResult,
    CreateIntentResult,
    ProviderCustomer,
    ProviderEvent,
    ProviderIntentDetails,
    RefundResult,
)

try:
    import stripe  # type: ignore
except ModuleNotFoundError as exc:  # pragma: no cover - import guard
    stripe = None
    STRIPE_IMPORT_ERROR = exc
else:
    STRIPE_IMPORT_ERROR = None


INTENT_STATUS_MAP = {
    "requires_payment_method": IntentStatus.REQUIRES_PAYMENT_METHOD,
    "requires_action": IntentStatus.REQUIRES_ACTION,
    "processing": IntentStatus.PROCESSING,
    "succeeded": IntentStatus.SUCCEEDED,
    "requires_capture": IntentStatus.PROCESSING,
    "canceled": IntentStatus.CANCELED,
}

CHARGE_STATUS_MAP = {
    "succeeded": PaymentStatus.SUCCEEDED,
    "pending": PaymentStatus.SUCCEEDED,
    "failed": PaymentStatus.FAILED,
    "canceled": PaymentStatus.FAILED,
    "refunded": PaymentStatus.REFUNDED,
    "partially_refunded": PaymentStatus.PARTIALLY_REFUNDED,
}

REFUND_STATUS_MAP = {
    "pending": RefundStatus.PENDING,
    "succeeded": RefundStatus.SUCCEEDED,
    "failed": RefundStatus.FAILED,
    "canceled": RefundStatus.FAILED,
}


def _assert_stripe_installed() -> None:
    if stripe is None:
        raise RuntimeError(
            "Stripe SDK is required but not installed. "
            "Add `stripe` to requirements.txt and install dependencies."
        ) from STRIPE_IMPORT_ERROR


def _map_intent_status(status: str) -> IntentStatus:
    return INTENT_STATUS_MAP.get(status, IntentStatus.PROCESSING)


def _map_charge_status(status: str | None) -> PaymentStatus | None:
    if not status:
        return None
    return CHARGE_STATUS_MAP.get(status, PaymentStatus.FAILED)


def _map_refund_status(status: str) -> RefundStatus:
    return REFUND_STATUS_MAP.get(status, RefundStatus.PENDING)


def _apply_customer_metadata(params: dict[str, Any], customer: ProviderCustomer) -> None:
    if customer.email:
        params["receipt_email"] = customer.email
    if customer.name:
        metadata = dict(params.get("metadata", {}))
        metadata["customer_name"] = customer.name
        params["metadata"] = metadata


@dataclass(slots=True)
class StripeProvider(BaseProvider):
    """Stripe sandbox/card provider implementation."""

    api_key: str
    webhook_secret: str | None = None
    slug: str = ProviderSlug.STRIPE.value

    def __post_init__(self) -> None:
        _assert_stripe_installed()
        stripe.api_key = self.api_key
        stripe.api_version = getattr(
            settings, "PAYMENT_STRIPE_API_VERSION", "2023-10-16"
        )

    def create_intent(
        self,
        amount_minor: int,
        currency: str,
        capture_method: str,
        customer: ProviderCustomer,
        return_url: str | None,
        metadata: Mapping[str, Any],
        idempotency_key: str,
    ) -> CreateIntentResult:
        params: dict[str, Any] = {
            "amount": amount_minor,
            "currency": currency.lower(),
            "capture_method": capture_method,
            "automatic_payment_methods": {"enabled": True},
            "metadata": dict(metadata),
        }
        _apply_customer_metadata(params, customer)
        if return_url:
            params["return_url"] = return_url
        intent = stripe.PaymentIntent.create(
            **params,
            idempotency_key=idempotency_key,
        )
        status = _map_intent_status(intent.status)
        return CreateIntentResult(
            intent_id=intent.id,
            status=status,
            client_secret=getattr(intent, "client_secret", None),
            raw=intent,
        )

    def confirm_intent(
        self,
        provider_intent_id: str,
        payment_method_payload: Mapping[str, Any] | None = None,
    ) -> ConfirmIntentResult:
        kwargs: dict[str, Any] = {"expand": ["latest_charge"]}
        if payment_method_payload:
            if "payment_method" in payment_method_payload:
                kwargs["payment_method"] = payment_method_payload["payment_method"]
            if "return_url" in payment_method_payload:
                kwargs["return_url"] = payment_method_payload["return_url"]
        intent = stripe.PaymentIntent.confirm(provider_intent_id, **kwargs)
        status = _map_intent_status(intent.status)
        latest_charge = getattr(intent, "latest_charge", None)
        charge_status = (
            _map_charge_status(latest_charge.status) if latest_charge else None
        )
        requires_action = status == IntentStatus.REQUIRES_ACTION
        return ConfirmIntentResult(
            intent_status=status,
            payment_id=getattr(latest_charge, "id", None),
            payment_status=charge_status,
            client_secret=getattr(intent, "client_secret", None),
            requires_action=requires_action,
            raw=intent,
        )

    def retrieve_intent(self, provider_intent_id: str) -> ProviderIntentDetails:
        intent = stripe.PaymentIntent.retrieve(
            provider_intent_id,
            expand=["latest_charge"],
        )
        status = _map_intent_status(intent.status)
        latest_charge = getattr(intent, "latest_charge", None)
        charge_status = (
            _map_charge_status(latest_charge.status) if latest_charge else None
        )
        return ProviderIntentDetails(
            intent_id=intent.id,
            status=status,
            amount_minor=intent.amount,
            currency=intent.currency.upper(),
            latest_payment_id=getattr(latest_charge, "id", None),
            latest_payment_status=charge_status,
            client_secret=getattr(intent, "client_secret", None),
            raw=intent,
        )

    def refund(
        self,
        provider_payment_id: str,
        amount_minor: int | None = None,
        idempotency_key: str | None = None,
    ) -> RefundResult:
        refund = stripe.Refund.create(
            charge=provider_payment_id,
            amount=amount_minor,
            idempotency_key=idempotency_key,
        )
        status = _map_refund_status(refund.status)
        return RefundResult(
            refund_id=refund.id,
            status=status,
            amount_minor=refund.amount,
            raw=refund,
        )

    def webhook_is_valid(self, request: HttpRequest) -> bool:
        if not self.webhook_secret:
            return False
        signature = request.headers.get("Stripe-Signature", "")
        try:
            stripe.WebhookSignature.verify_header(
                request.body.decode("utf-8"),
                signature,
                self.webhook_secret,
            )
        except Exception:  # pragma: no cover - library raises various exceptions
            return False
        return True

    def parse_webhook_event(self, request: HttpRequest) -> ProviderEvent:
        if not self.webhook_secret:
            raise RuntimeError("Stripe webhook secret is not configured.")
        payload_str = request.body.decode("utf-8")
        payload = stripe.Webhook.construct_event(
            payload_str,
            request.headers.get("Stripe-Signature"),
            self.webhook_secret,
        )
        event_type = payload["type"]
        data_object: Mapping[str, Any] = payload["data"]["object"]

        intent_id = data_object.get("id")
        payment_id = None
        refund_id = None

        if "payment_intent" in data_object:
            intent_id = data_object["payment_intent"]
        if "charge" in data_object:
            payment_id = data_object["charge"]
        if data_object.get("object") == "charge":
            payment_id = data_object.get("id")
        if data_object.get("object") == "refund":
            refund_id = data_object.get("id")

        return ProviderEvent(
            type=event_type,
            intent_id=intent_id,
            payment_id=payment_id,
            refund_id=refund_id,
            payload=payload,
        )
