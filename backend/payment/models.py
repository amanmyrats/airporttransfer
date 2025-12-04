from __future__ import annotations

import uuid
from typing import Any

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.utils import timezone

from .enums import IntentStatus, LedgerEntryKind, PaymentMethod, PaymentStatus, ProviderSlug, RefundStatus


def default_json() -> dict[str, Any]:
    return {}


class PaymentProviderAccount(models.Model):
    """Represents a configured provider (Stripe account, IyziCo merchant, etc.)."""

    PROVIDER_CHOICES = ProviderSlug.choices()

    name = models.CharField(max_length=255)
    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES)
    is_active = models.BooleanField(default=True)
    default_currency = models.CharField(max_length=3)
    supported_currencies = ArrayField(
        models.CharField(max_length=3),
        default=list,
        blank=True,
    )
    metadata = models.JSONField(default=default_json, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Payment provider account"
        verbose_name_plural = "Payment provider accounts"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.get_provider_display()} – {self.name}"

    def supports_currency(self, currency: str) -> bool:
        currency = currency.upper()
        return not self.supported_currencies or currency in self.supported_currencies


class PaymentIntentQuerySet(models.QuerySet):
    def pending_offline(self) -> "PaymentIntentQuerySet":
        return self.filter(
            method__in=PaymentMethod.offline_values(),
            status__in=[
                IntentStatus.REQUIRES_ACTION.value,
                IntentStatus.PROCESSING.value,
            ],
        )


class PaymentIntent(models.Model):
    CAPTURE_METHOD_AUTOMATIC = "automatic"
    CAPTURE_METHOD_MANUAL = "manual"
    CAPTURE_METHOD_CHOICES = [
        (CAPTURE_METHOD_AUTOMATIC, "Automatic"),
        (CAPTURE_METHOD_MANUAL, "Manual"),
    ]

    objects = PaymentIntentQuerySet.as_manager()

    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    booking_ref = models.CharField(max_length=64, db_index=True)
    amount_minor = models.BigIntegerField()
    currency = models.CharField(max_length=3)
    method = models.CharField(
        max_length=32,
        choices=PaymentMethod.choices(),
    )
    status = models.CharField(
        max_length=32,
        choices=IntentStatus.choices(),
        default=IntentStatus.REQUIRES_PAYMENT_METHOD.value,
    )
    provider = models.CharField(max_length=32)
    provider_account = models.ForeignKey(
        PaymentProviderAccount,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="intents",
    )
    provider_intent_id = models.CharField(max_length=128, null=True, blank=True)
    client_secret = models.CharField(max_length=255, null=True, blank=True)
    idempotency_key = models.CharField(max_length=128, unique=True)
    customer_email = models.EmailField(null=True, blank=True)
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    capture_method = models.CharField(
        max_length=16,
        choices=CAPTURE_METHOD_CHOICES,
        default=CAPTURE_METHOD_AUTOMATIC,
    )
    return_url = models.URLField(null=True, blank=True)
    metadata = models.JSONField(default=default_json, blank=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "provider_intent_id"],
                name="unique_provider_intent",
                violation_error_message="Provider intent already registered.",
                condition=models.Q(provider_intent_id__isnull=False),
            ),
        ]
        permissions = [
            ("manage_payments", "Can manage and settle payments"),
        ]

    def __str__(self) -> str:
        return f"{self.booking_ref} – {self.amount_minor} {self.currency}"

    def clean(self) -> None:
        method = PaymentMethod(self.method)
        if not method.supports_currency(self.currency):
            raise ValidationError(
                {"currency": f"{self.currency} is not supported for {self.method}."}
            )
        if (
            self.provider_account
            and not self.provider_account.supports_currency(self.currency)
        ):
            raise ValidationError(
                {
                    "currency": f"{self.currency} is not supported by "
                    f"{self.provider_account}."
                }
            )
        super().clean()

    @property
    def is_offline(self) -> bool:
        return PaymentMethod(self.method).is_offline

    def mark_status(self, status: IntentStatus) -> None:
        self.status = status.value
        self.updated_at = timezone.now()
        self.save(update_fields=["status", "updated_at"])

    def _sum_successful_payments(self) -> int:
        return (
            self.payments.filter(status=PaymentStatus.SUCCEEDED.value)
            .aggregate(total=Coalesce(Sum("amount_minor"), 0))
            .get("total")
            or 0
        )

    def _sum_successful_refunds(self) -> int:
        return (
            Refund.objects.filter(payment__payment_intent=self, status=RefundStatus.SUCCEEDED.value)
            .aggregate(total=Coalesce(Sum("amount_minor"), 0))
            .get("total")
            or 0
        )

    def recompute_financials(self) -> tuple[int, int, int]:
        paid = self._sum_successful_payments()
        refunded = self._sum_successful_refunds()
        due = max(self.amount_minor - (paid - refunded), 0)
        self._paid_minor_cache = paid
        self._refunded_minor_cache = refunded
        self._due_minor_cache = due
        return paid, refunded, due

    @property
    def paid_minor(self) -> int:
        if not hasattr(self, "_paid_minor_cache"):
            self.recompute_financials()
        return getattr(self, "_paid_minor_cache", 0)

    @property
    def refunded_minor(self) -> int:
        if not hasattr(self, "_refunded_minor_cache"):
            self.recompute_financials()
        return getattr(self, "_refunded_minor_cache", 0)

    @property
    def due_minor(self) -> int:
        if not hasattr(self, "_due_minor_cache"):
            self.recompute_financials()
        return getattr(self, "_due_minor_cache", max(self.amount_minor, 0))

    def refresh_status_from_payments(self) -> None:
        paid, refunded, due = self.recompute_financials()
        net_paid = paid - refunded
        if due <= 0 and self.status != IntentStatus.SUCCEEDED.value:
            self.mark_status(IntentStatus.SUCCEEDED)
        elif due > 0 and net_paid > 0 and self.status != IntentStatus.PROCESSING.value:
            self.mark_status(IntentStatus.PROCESSING)

    def _aggregate_payments(self) -> int:
        from .models import Payment  # circular? we are in same file. can't import.


class Payment(models.Model):
    payment_intent = models.ForeignKey(
        PaymentIntent,
        on_delete=models.PROTECT,
        related_name="payments",
    )
    provider_payment_id = models.CharField(max_length=128, unique=True)
    amount_minor = models.BigIntegerField()
    currency = models.CharField(max_length=3)
    status = models.CharField(
        max_length=32,
        choices=PaymentStatus.choices(),
    )
    card_brand = models.CharField(max_length=32, null=True, blank=True)
    last4 = models.CharField(max_length=4, null=True, blank=True)
    receipt_url = models.URLField(null=True, blank=True)
    captured_at = models.DateTimeField(null=True, blank=True)
    refundable_minor = models.BigIntegerField(default=0)
    metadata = models.JSONField(default=default_json, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.provider_payment_id} – {self.amount_minor} {self.currency}"

    def mark_status(self, status: PaymentStatus, refundable_minor: int | None = None):
        self.status = status.value
        update_fields = ["status", "updated_at"]
        if refundable_minor is not None:
            self.refundable_minor = refundable_minor
            update_fields.append("refundable_minor")
        self.updated_at = timezone.now()
        self.save(update_fields=update_fields)


class Refund(models.Model):
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="refunds",
    )
    amount_minor = models.BigIntegerField()
    provider_refund_id = models.CharField(max_length=128, unique=True)
    status = models.CharField(
        max_length=32,
        choices=RefundStatus.choices(),
    )
    reason = models.CharField(max_length=255, null=True, blank=True)
    metadata = models.JSONField(default=default_json, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.provider_refund_id} – {self.amount_minor}"


def offline_receipt_upload_to(instance: "OfflineReceipt", filename: str) -> str:
    return f"payments/offline-receipts/{instance.payment_intent.public_id}/{filename}"


class OfflineReceipt(models.Model):
    payment_intent = models.ForeignKey(
        PaymentIntent,
        on_delete=models.CASCADE,
        related_name="offline_receipts",
    )
    evidence_file = models.FileField(upload_to=offline_receipt_upload_to)
    note = models.TextField(null=True, blank=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_offline_receipts",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Offline receipt for {self.payment_intent.public_id}"


class LedgerEntry(models.Model):
    kind = models.CharField(max_length=64, choices=LedgerEntryKind.choices())
    booking_ref = models.CharField(max_length=64)
    intent = models.ForeignKey(
        PaymentIntent,
        on_delete=models.CASCADE,
        related_name="ledger_entries",
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="ledger_entries",
        null=True,
        blank=True,
    )
    refund = models.ForeignKey(
        Refund,
        on_delete=models.CASCADE,
        related_name="ledger_entries",
        null=True,
        blank=True,
    )
    delta_minor = models.BigIntegerField()
    currency = models.CharField(max_length=3)
    snapshot = models.JSONField(default=default_json, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.kind} – {self.booking_ref}"

    def save(self, *args, **kwargs) -> None:  # type: ignore[override]
        if self.pk:
            raise ValidationError("Ledger entries are immutable.")
        super().save(*args, **kwargs)


BANK_ACCOUNT_CURRENCY_CACHE_KEY = "payment:bank_accounts:currency_map"
BANK_ACCOUNT_CURRENCY_CACHE_TIMEOUT = 60 * 5


def clear_bank_account_currency_cache() -> None:
    cache.delete(BANK_ACCOUNT_CURRENCY_CACHE_KEY)


class PaymentBankAccountQuerySet(models.QuerySet):
    def active(self) -> "PaymentBankAccountQuerySet":
        return self.filter(is_active=True)

    def for_method_and_currency(self, method: PaymentMethod, currency: str) -> "PaymentBankAccountQuerySet":
        currency = currency.upper()
        return self.active().filter(method=method.value, currency=currency)

    def active_currency_map(self) -> dict[str, tuple[str, ...]]:
        rows = (
            self.active()
            .values_list("method", "currency")
            .distinct()
        )
        mapping: dict[str, set[str]] = {}
        for method, currency in rows:
            mapping.setdefault(method, set()).add(currency.upper())
        return {method: tuple(sorted(values)) for method, values in mapping.items()}


class PaymentBankAccount(models.Model):
    objects = PaymentBankAccountQuerySet.as_manager()

    label = models.CharField(max_length=255)
    method = models.CharField(max_length=32, choices=PaymentMethod.choices())
    currency = models.CharField(max_length=3)
    account_name = models.CharField(max_length=255)
    bank_name = models.CharField(max_length=255, blank=True)
    iban = models.CharField(max_length=64, blank=True)
    account_number = models.CharField(max_length=64, blank=True)
    swift_code = models.CharField(max_length=64, blank=True)
    branch_code = models.CharField(max_length=64, blank=True)
    phone_number = models.CharField(max_length=64, blank=True)
    reference_hint = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=default_json, blank=True)
    priority = models.IntegerField(default=0, help_text="Higher priority accounts are used first.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_active", "-priority", "label"]

    def __str__(self) -> str:
        return f"{self.label} ({self.currency} – {self.method})"

    def clean(self) -> None:
        method = PaymentMethod(self.method)
        if method == PaymentMethod.BANK_TRANSFER:
            if not self.iban and not self.account_number:
                raise ValidationError(
                    {"iban": "Either IBAN or account number must be provided for bank transfer accounts."}
                )
        if method == PaymentMethod.RUB_PHONE_TRANSFER and not self.phone_number:
            raise ValidationError({"phone_number": "Phone number is required for Russian phone transfers."})
        super().clean()

    def save(self, *args, **kwargs):  # type: ignore[override]
        response = super().save(*args, **kwargs)
        clear_bank_account_currency_cache()
        return response

    def delete(self, *args, **kwargs):  # type: ignore[override]
        response = super().delete(*args, **kwargs)
        clear_bank_account_currency_cache()
        return response


class BankTransferInstruction(models.Model):
    payment_intent = models.OneToOneField(
        PaymentIntent,
        on_delete=models.CASCADE,
        related_name="bank_transfer_instruction",
    )
    bank_accounts = models.ManyToManyField(
        PaymentBankAccount,
        related_name="bank_transfer_instructions",
        blank=True,
    )
    reference_text = models.CharField(max_length=255)
    expires_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=default_json, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Instructions for {self.payment_intent.public_id}"
