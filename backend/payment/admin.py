from __future__ import annotations

from django.contrib import admin

from .models import (
    BankTransferInstruction,
    LedgerEntry,
    OfflineReceipt,
    Payment,
    PaymentBankAccount,
    PaymentIntent,
    PaymentProviderAccount,
    Refund,
)


@admin.register(PaymentProviderAccount)
class PaymentProviderAccountAdmin(admin.ModelAdmin):
    list_display = ("name", "provider", "is_active", "default_currency")
    list_filter = ("provider", "is_active")
    search_fields = ("name",)
    filter_horizontal = ()


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = (
        "public_id",
        "booking_ref",
        "amount_minor",
        "currency",
        "method",
        "status",
        "provider",
        "created_at",
    )
    list_filter = ("method", "status", "provider", "currency")
    search_fields = ("public_id", "booking_ref", "provider_intent_id")
    readonly_fields = ("public_id", "created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("provider_payment_id", "payment_intent", "amount_minor", "currency", "status")
    list_filter = ("status", "currency")
    search_fields = ("provider_payment_id",)
    ordering = ("-created_at",)


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ("provider_refund_id", "payment", "amount_minor", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("provider_refund_id",)
    ordering = ("-created_at",)


@admin.register(OfflineReceipt)
class OfflineReceiptAdmin(admin.ModelAdmin):
    list_display = ("payment_intent", "submitted_by", "created_at")
    search_fields = ("payment_intent__booking_ref", "submitted_by__email")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ("kind", "booking_ref", "delta_minor", "currency", "created_at")
    list_filter = ("kind", "currency")
    search_fields = ("booking_ref", "intent__public_id")
    readonly_fields = (
        "kind",
        "booking_ref",
        "intent",
        "payment",
        "refund",
        "delta_minor",
        "currency",
        "snapshot",
        "created_at",
    )
    ordering = ("-created_at",)


@admin.register(BankTransferInstruction)
class BankTransferInstructionAdmin(admin.ModelAdmin):
    list_display = (
        "payment_intent",
        "reference_text",
        "expires_at",
        "account_count",
    )
    search_fields = ("payment_intent__booking_ref", "reference_text", "bank_accounts__label")
    filter_horizontal = ("bank_accounts",)

    def account_count(self, obj: BankTransferInstruction) -> int:
        return obj.bank_accounts.count()


@admin.register(PaymentBankAccount)
class PaymentBankAccountAdmin(admin.ModelAdmin):
    list_display = (
        "label",
        "method",
        "currency",
        "bank_name",
        "account_name",
        "branch_code",
        "is_active",
        "priority",
    )
    list_filter = ("method", "currency", "is_active")
    search_fields = ("label", "bank_name", "account_name", "iban", "account_number")
    ordering = ("-is_active", "-priority", "label")
