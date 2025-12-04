from __future__ import annotations

from drf_spectacular.utils import extend_schema

PAYMENTS_TAG = "Payments"


def payment_schema(**kwargs):
    tags = kwargs.pop("tags", None) or [PAYMENTS_TAG]
    return extend_schema(tags=tags, **kwargs)


__all__ = ["payment_schema", "PAYMENTS_TAG"]

