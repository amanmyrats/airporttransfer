from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Protocol

from django.http import HttpRequest

from ..enums import IntentStatus, PaymentStatus, RefundStatus


@dataclass(slots=True, kw_only=True)
class ProviderCustomer:
    email: str | None = None
    name: str | None = None


@dataclass(slots=True, kw_only=True)
class CreateIntentResult:
    intent_id: str
    status: IntentStatus
    client_secret: str | None = None
    raw: Mapping[str, Any] | None = None


@dataclass(slots=True, kw_only=True)
class ConfirmIntentResult:
    intent_status: IntentStatus
    payment_id: str | None = None
    payment_status: PaymentStatus | None = None
    client_secret: str | None = None
    requires_action: bool = False
    raw: Mapping[str, Any] | None = None


@dataclass(slots=True, kw_only=True)
class ProviderIntentDetails:
    intent_id: str
    status: IntentStatus
    amount_minor: int
    currency: str
    latest_payment_id: str | None = None
    latest_payment_status: PaymentStatus | None = None
    client_secret: str | None = None
    raw: Mapping[str, Any] | None = None


@dataclass(slots=True, kw_only=True)
class RefundResult:
    refund_id: str
    status: RefundStatus
    amount_minor: int
    raw: Mapping[str, Any] | None = None


@dataclass(slots=True, kw_only=True)
class ProviderEvent:
    type: str
    intent_id: str | None = None
    payment_id: str | None = None
    refund_id: str | None = None
    payload: Mapping[str, Any] | None = None


class BaseProvider(Protocol):
    """Payments provider abstraction."""

    slug: str

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
        ...

    def confirm_intent(
        self,
        provider_intent_id: str,
        payment_method_payload: Mapping[str, Any] | None = None,
    ) -> ConfirmIntentResult:
        ...

    def retrieve_intent(self, provider_intent_id: str) -> ProviderIntentDetails:
        ...

    def refund(
        self,
        provider_payment_id: str,
        amount_minor: int | None = None,
        idempotency_key: str | None = None,
    ) -> RefundResult:
        ...

    def webhook_is_valid(self, request: HttpRequest) -> bool:
        ...

    def parse_webhook_event(self, request: HttpRequest) -> ProviderEvent:
        ...

