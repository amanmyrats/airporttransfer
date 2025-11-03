from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

from django.conf import settings
from django.db.models import QuerySet

from .enums import PaymentMethod, ProviderSlug
from .models import PaymentIntent, PaymentProviderAccount


@dataclass(frozen=True, slots=True)
class AvailableMethod:
    method: PaymentMethod
    currencies: Sequence[str]
    provider: str
    metadata: dict


def get_payment_intent(public_id: str) -> PaymentIntent:
    return (
        PaymentIntent.objects.select_related(
            "provider_account",
            "bank_transfer_instruction",
        )
        .prefetch_related("offline_receipts", "payments", "ledger_entries")
        .get(public_id=public_id)
    )


def list_offline_pending(days: int | None = None) -> QuerySet[PaymentIntent]:
    queryset = PaymentIntent.objects.pending_offline().select_related(
        "bank_transfer_instruction"
    ).prefetch_related("offline_receipts", "payments", "ledger_entries")
    if days:
        from django.utils import timezone

        cutoff = timezone.now() - timezone.timedelta(days=days)
        queryset = queryset.filter(updated_at__lte=cutoff)
    return queryset


def _provider_currencies(provider_slug: str) -> Sequence[str]:
    account = (
        PaymentProviderAccount.objects.filter(
            provider=provider_slug, is_active=True
        ).order_by("-created_at")
    ).first()
    if account:
        if account.supported_currencies:
            return tuple(curr.upper() for curr in account.supported_currencies)
        return (account.default_currency.upper(),)
    return ()


def list_available_methods() -> list[AvailableMethod]:
    enabled: list[AvailableMethod] = []

    offline_methods = getattr(
        settings,
        "PAYMENT_OFFLINE_CHANNELS",
        [m.value for m in PaymentMethod if m.is_offline],
    )
    for method_value in offline_methods:
        method = PaymentMethod(method_value)
        enabled.append(
            AvailableMethod(
                method=method,
                currencies=tuple(_provider_currencies(ProviderSlug.OFFLINE.value)) or ("EUR", "USD", "TRY"),
                provider=ProviderSlug.OFFLINE.value,
                metadata={},
            )
        )

    if getattr(settings, "PAYMENT_ENABLE_CARD", False):
        enabled.append(
            AvailableMethod(
                method=PaymentMethod.CARD,
                currencies=tuple(_provider_currencies(ProviderSlug.STRIPE.value)) or ("EUR", "USD", "TRY"),
                provider=ProviderSlug.STRIPE.value,
                metadata={
                    "publishable_key": getattr(
                        settings, "PAYMENT_STRIPE_PUBLISHABLE_KEY", None
                    )
                },
            )
        )

    return enabled
