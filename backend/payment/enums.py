from __future__ import annotations

from enum import StrEnum
from typing import Iterable, Tuple

BANK_SUPPORTED_CURRENCIES: Tuple[str, ...] = ("EUR", "USD", "TRY", "GBP")
RUB_PHONE_CURRENCIES: Tuple[str, ...] = ("RUB",)

class ChoiceEnum(StrEnum):
    """Base class that provides Django-friendly helpers for enums."""

    @classmethod
    def choices(cls) -> Iterable[tuple[str, str]]:
        return tuple((item.value, item.label) for item in cls)  # type: ignore[attr-defined]

    @property
    def label(self) -> str:
        return self.value.replace("_", " ").title()


class PaymentMethod(ChoiceEnum):
    """Supported payment channels."""

    CASH = "CASH"
    BANK_TRANSFER = "BANK_TRANSFER"
    RUB_PHONE_TRANSFER = "RUB_PHONE_TRANSFER"
    CARD = "CARD"

    @classmethod
    def offline_methods(cls) -> tuple["PaymentMethod", ...]:
        return (cls.CASH, cls.BANK_TRANSFER, cls.RUB_PHONE_TRANSFER)

    @classmethod
    def offline_values(cls) -> tuple[str, ...]:
        return tuple(method.value for method in cls.offline_methods())

    @property
    def is_offline(self) -> bool:
        return self in self.__class__.offline_methods()

    @property
    def is_card(self) -> bool:
        return self is self.__class__.CARD

    def supports_currency(self, currency: str) -> bool:
        currency = currency.upper()
        if self is PaymentMethod.CASH:
            return True  # assume cash can be accepted in any quoted currency
        if self is PaymentMethod.BANK_TRANSFER:
            # USDT or other stable-coins should be modelled as a dedicated method later.
            return currency in BANK_SUPPORTED_CURRENCIES
        if self is PaymentMethod.RUB_PHONE_TRANSFER:
            return currency in RUB_PHONE_CURRENCIES
        if self is PaymentMethod.CARD:
            return True
        return False


class IntentStatus(ChoiceEnum):
    REQUIRES_PAYMENT_METHOD = "requires_payment_method"
    REQUIRES_ACTION = "requires_action"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"
    FAILED = "failed"


class PaymentStatus(ChoiceEnum):
    SUCCEEDED = "succeeded"
    PARTIALLY_REFUNDED = "partially_refunded"
    REFUNDED = "refunded"
    FAILED = "failed"


class RefundStatus(ChoiceEnum):
    PENDING = "pending"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class LedgerEntryKind(ChoiceEnum):
    INTENT_CREATED = "intent_created"
    INTENT_UPDATED = "intent_updated"
    PAYMENT_SUCCEEDED = "payment_succeeded"
    PAYMENT_FAILED = "payment_failed"
    REFUND_REQUESTED = "refund_requested"
    REFUND_SUCCEEDED = "refund_succeeded"
    REFUND_FAILED = "refund_failed"
    OFFLINE_RECEIPT_SUBMITTED = "offline_receipt_submitted"


class ProviderSlug(ChoiceEnum):
    OFFLINE = "offline"
    STRIPE = "stripe"
    IYZICO = "iyzico"
    PAYTR = "paytr"
