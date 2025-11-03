from __future__ import annotations

from django.contrib import admin

from .models import (
    BankTransferInstruction,
    LedgerEntry,
    OfflineReceipt,
    Payment,
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
    list_display = ("payment_intent", "bank_name", "iban", "expires_at")
    search_fields = ("payment_intent__booking_ref", "iban", "bank_name")

