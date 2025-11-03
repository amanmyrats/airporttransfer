from __future__ import annotations

from typing import Any

from django.conf import settings
from rest_framework import serializers

from . import services
from .enums import PaymentMethod
from .models import (
    BankTransferInstruction,
    OfflineReceipt,
    Payment,
    PaymentIntent,
    Refund,
)
from .selectors import AvailableMethod, get_payment_intent, list_available_methods
from .validators import (
    validate_amount_minor,
    validate_currency,
    validate_payment_method,
)


class CustomerSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_null=True)
    name = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "id",
            "provider_payment_id",
            "amount_minor",
            "currency",
            "status",
            "card_brand",
            "last4",
            "receipt_url",
            "captured_at",
            "refundable_minor",
            "metadata",
        )


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = (
            "id",
            "provider_refund_id",
            "amount_minor",
            "status",
            "reason",
            "created_at",
        )


class OfflineReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflineReceipt
        fields = (
            "id",
            "note",
            "evidence_file",
            "submitted_by",
            "created_at",
        )


class BankTransferInstructionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankTransferInstruction
        fields = (
            "iban",
            "account_name",
            "bank_name",
            "reference_text",
            "expires_at",
        )


class PaymentIntentDetailSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    offline_receipts = OfflineReceiptSerializer(many=True, read_only=True)
    bank_transfer_instruction = BankTransferInstructionSerializer(read_only=True)
    ledger_entries = serializers.SerializerMethodField()

    class Meta:
        model = PaymentIntent
        fields = (
            "public_id",
            "booking_ref",
            "amount_minor",
            "currency",
            "method",
            "status",
            "provider",
            "provider_intent_id",
            "client_secret",
            "customer_email",
            "customer_name",
            "capture_method",
            "return_url",
            "metadata",
            "created_at",
            "updated_at",
            "payments",
            "offline_receipts",
            "bank_transfer_instruction",
            "ledger_entries",
        )

    def get_ledger_entries(self, obj: PaymentIntent) -> list[dict[str, Any]]:
        entries = obj.ledger_entries.all().order_by("-created_at")
        return [
            {
                "id": entry.id,
                "kind": entry.kind,
                "delta_minor": entry.delta_minor,
                "currency": entry.currency,
                "payment_id": entry.payment_id,
                "refund_id": entry.refund_id,
                "created_at": entry.created_at,
            }
            for entry in entries
        ]


class PaymentIntentCreateSerializer(serializers.Serializer):
    booking_ref = serializers.CharField(max_length=64)
    amount_minor = serializers.IntegerField()
    currency = serializers.CharField(max_length=3)
    method = serializers.CharField(max_length=32)
    return_url = serializers.URLField(required=False, allow_null=True)
    customer = CustomerSerializer(required=False)
    capture_method = serializers.ChoiceField(
        choices=PaymentIntent.CAPTURE_METHOD_CHOICES,
        default=PaymentIntent.CAPTURE_METHOD_AUTOMATIC,
    )
    idempotency_key = serializers.CharField(max_length=128)
    provider = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    metadata = serializers.JSONField(required=False)

    def validate_amount_minor(self, value: int) -> int:
        return validate_amount_minor(value)

    def validate_currency(self, value: str) -> str:
        return validate_currency(value)

    def validate_method(self, value: str) -> str:
        method = validate_payment_method(value).value
        if method == PaymentMethod.CARD.value and not getattr(
            settings, "PAYMENT_ENABLE_CARD", False
        ):
            raise serializers.ValidationError("Card payments are currently disabled.")
        if (
            method != PaymentMethod.CARD.value
            and method not in getattr(settings, "PAYMENT_OFFLINE_CHANNELS", [])
        ):
            raise serializers.ValidationError("Selected payment method is not enabled.")
        return method

    def create(self, validated_data: dict[str, Any]) -> PaymentIntent:
        customer = validated_data.pop("customer", {})
        offline_instructions = None
        if validated_data["method"] == PaymentMethod.BANK_TRANSFER.value:
            offline_instructions = (
                getattr(settings, "PAYMENT_BANK_TRANSFER_INSTRUCTIONS", None) or {}
            )
        return services.create_payment_intent(
            customer=customer,
            offline_instructions=offline_instructions,
            **validated_data,
        )


class PaymentIntentConfirmSerializer(serializers.Serializer):
    payment_method_payload = serializers.JSONField(required=False)

    def save(self, **kwargs) -> PaymentIntent:
        public_id = kwargs.get("public_id")
        if not public_id:
            raise serializers.ValidationError("Missing payment intent identifier.")
        payload = self.validated_data.get("payment_method_payload")
        return services.confirm_payment_intent(
            public_id=public_id, payment_method_payload=payload
        )


class OfflineReceiptUploadSerializer(serializers.Serializer):
    evidence_file = serializers.FileField()
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_evidence_file(self, file):
        max_bytes = getattr(settings, "PAYMENT_OFFLINE_MAX_FILE_SIZE", 5 * 1024 * 1024)
        if file.size > max_bytes:
            raise serializers.ValidationError("File size exceeds allowed limit (5 MB).")
        valid_mime_prefixes = ("image/", "application/pdf")
        if not any(file.content_type.startswith(prefix) for prefix in valid_mime_prefixes):
            raise serializers.ValidationError("Unsupported file type.")
        return file

    def save(self, **kwargs) -> OfflineReceipt:
        public_id = kwargs.get("public_id")
        if not public_id:
            raise serializers.ValidationError("Missing payment intent identifier.")
        user = kwargs.get("user")
        return services.record_offline_receipt(
            public_id=public_id,
            evidence_file=self.validated_data["evidence_file"],
            note=self.validated_data.get("note"),
            submitted_by=user,
        )


class OfflineSettleSerializer(serializers.Serializer):
    amount_minor = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_amount_minor(self, value: int) -> int:
        return validate_amount_minor(value)

    def save(self, **kwargs) -> Payment:
        public_id = kwargs.get("public_id")
        if not public_id:
            raise serializers.ValidationError("Missing payment intent identifier.")
        return services.record_offline_settlement(
            public_id=public_id,
            amount_minor=self.validated_data["amount_minor"],
            note=self.validated_data.get("note"),
        )


class RefundCreateSerializer(serializers.Serializer):
    payment_id = serializers.IntegerField()
    amount_minor = serializers.IntegerField(required=False, allow_null=True)
    reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    idempotency_key = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def save(self, **kwargs) -> Refund:
        return services.issue_refund(
            payment_id=self.validated_data["payment_id"],
            amount_minor=self.validated_data.get("amount_minor"),
            reason=self.validated_data.get("reason"),
            idempotency_key=self.validated_data.get("idempotency_key"),
        )


class PaymentIntentResponseSerializer(PaymentIntentDetailSerializer):
    pass


class PaymentMethodSerializer(serializers.Serializer):
    method = serializers.CharField()
    currencies = serializers.ListField(child=serializers.CharField())
    provider = serializers.CharField()
    metadata = serializers.DictField()

    @classmethod
    def from_available(cls, available: AvailableMethod) -> dict[str, Any]:
        return {
            "method": available.method.value,
            "currencies": list(available.currencies),
            "provider": available.provider,
            "metadata": available.metadata,
        }
