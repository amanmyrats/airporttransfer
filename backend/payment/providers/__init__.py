from __future__ import annotations

from functools import lru_cache

from django.conf import settings

from ..enums import ProviderSlug
from .base import BaseProvider
from .iyzico_provider import IyziCoProvider
from .paytr_provider import PayTRProvider
from .stripe_provider import StripeProvider


@lru_cache(maxsize=4)
def get_provider(slug: str) -> BaseProvider:
    slug_enum = ProviderSlug(slug)

    if slug_enum is ProviderSlug.STRIPE:
        secret_key = getattr(settings, "PAYMENT_STRIPE_SECRET_KEY", None)
        if not secret_key:
            raise RuntimeError("PAYMENT_STRIPE_SECRET_KEY is not configured.")
        webhook_secret = getattr(settings, "PAYMENT_STRIPE_WEBHOOK_SECRET", None)
        return StripeProvider(api_key=secret_key, webhook_secret=webhook_secret)

    if slug_enum is ProviderSlug.IYZICO:
        raise NotImplementedError("IyziCo provider is not implemented yet.")

    if slug_enum is ProviderSlug.PAYTR:
        raise NotImplementedError("PayTR provider is not implemented yet.")

    raise ValueError(f"Unsupported provider slug '{slug}'.")


__all__ = [
    "get_provider",
    "BaseProvider",
    "StripeProvider",
    "IyziCoProvider",
    "PayTRProvider",
]

