from __future__ import annotations

import re

from rest_framework import serializers

from .enums import PaymentMethod

CURRENCY_RE = re.compile(r"^[A-Z]{3}$")


def validate_currency(value: str) -> str:
    if not value:
        raise serializers.ValidationError("Currency is required.")
    value = value.upper()
    if not CURRENCY_RE.match(value):
        raise serializers.ValidationError("Currency must be an ISO 4217 alpha code.")
    return value


def validate_amount_minor(value: int) -> int:
    if value is None:
        raise serializers.ValidationError("Amount is required.")
    if value <= 0:
        raise serializers.ValidationError("Amount must be greater than zero.")
    return value


def validate_payment_method(value: str) -> PaymentMethod:
    try:
        return PaymentMethod(value)
    except ValueError as exc:
        raise serializers.ValidationError("Unsupported payment method.") from exc

