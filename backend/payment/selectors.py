from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

from django.conf import settings
from django.core.cache import cache
from django.db.models import QuerySet

from .enums import PaymentMethod, ProviderSlug
from .models import (
    PaymentBankAccount,
    PaymentIntent,
    PaymentProviderAccount,
    BANK_ACCOUNT_CURRENCY_CACHE_KEY,
    BANK_ACCOUNT_CURRENCY_CACHE_TIMEOUT,
)


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
        .prefetch_related("offline_receipts", "payments", "ledger_entries", "bank_transfer_instruction__bank_accounts")
        .get(public_id=public_id)
    )


def list_offline_pending(days: int | None = None) -> QuerySet[PaymentIntent]:
    queryset = (
        PaymentIntent.objects.pending_offline()
        .select_related("bank_transfer_instruction")
        .prefetch_related("offline_receipts", "payments", "ledger_entries", "bank_transfer_instruction__bank_accounts")
    )
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


def _active_bank_account_currency_map() -> dict[str, tuple[str, ...]]:
    cached = cache.get(BANK_ACCOUNT_CURRENCY_CACHE_KEY)
    if cached is not None:
        return {method: tuple(currencies) for method, currencies in cached.items()}
    mapping = PaymentBankAccount.objects.active_currency_map()
    cache.set(BANK_ACCOUNT_CURRENCY_CACHE_KEY, mapping, BANK_ACCOUNT_CURRENCY_CACHE_TIMEOUT)
    return mapping


def list_available_methods() -> list[AvailableMethod]:
    enabled: list[AvailableMethod] = []
    bank_account_currency_map = _active_bank_account_currency_map()
    bank_required_methods = {PaymentMethod.BANK_TRANSFER, PaymentMethod.RUB_PHONE_TRANSFER}

    offline_methods = getattr(
        settings,
        "PAYMENT_OFFLINE_CHANNELS",
        [m.value for m in PaymentMethod if m.is_offline],
    )
    default_currencies = ("EUR", "USD", "TRY", "GBP", "RUB")
    for method_value in offline_methods:
        method = PaymentMethod(method_value)
        provider_currencies = tuple(_provider_currencies(ProviderSlug.OFFLINE.value)) or default_currencies
        method_currencies = tuple(
            currency for currency in provider_currencies if method.supports_currency(currency)
        ) or default_currencies
        if method in bank_required_methods:
            active_currencies = bank_account_currency_map.get(method.value, ())
            method_currencies = tuple(currency for currency in method_currencies if currency in active_currencies)
            if not method_currencies:
                continue
        enabled.append(
            AvailableMethod(
                method=method,
                currencies=method_currencies,
                provider=ProviderSlug.OFFLINE.value,
                metadata={},
            )
        )

    if getattr(settings, "PAYMENT_ENABLE_CARD", False):
        provider_currencies = tuple(_provider_currencies(ProviderSlug.STRIPE.value)) or default_currencies
        enabled.append(
            AvailableMethod(
                method=PaymentMethod.CARD,
                currencies=provider_currencies,
                provider=ProviderSlug.STRIPE.value,
                metadata={
                    "publishable_key": getattr(
                        settings, "PAYMENT_STRIPE_PUBLISHABLE_KEY", None
                    )
                },
            )
        )

    return enabled
