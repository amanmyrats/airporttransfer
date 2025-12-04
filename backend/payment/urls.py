from __future__ import annotations

from django.urls import path

from . import views, webhooks

app_name = "payment"

urlpatterns = [
    path("intents/", views.PaymentIntentCreateView.as_view(), name="intent-create"),
    path(
        "intents/pending-settlement/",
        views.PendingSettlementIntentListView.as_view(),
        name="intent-pending-settlement",
    ),
    path("intents/all/", views.PaymentIntentListView.as_view(), name="intent-list"),
    path(
        "intents/by-booking/<str:booking_ref>/",
        views.PaymentIntentByBookingView.as_view(),
        name="intent-by-booking",
    ),
    path(
        "intents/history/<str:booking_ref>/",
        views.PaymentIntentHistoryView.as_view(),
        name="intent-history",
    ),
    path(
        "intents/<uuid:public_id>/",
        views.PaymentIntentDetailView.as_view(),
        name="intent-detail",
    ),
    path(
        "intents/<uuid:public_id>/confirm/",
        views.PaymentIntentConfirmView.as_view(),
        name="intent-confirm",
    ),
    path(
        "intents/<uuid:public_id>/offline-receipt/",
        views.OfflineReceiptUploadView.as_view(),
        name="intent-offline-receipt",
    ),
    path(
        "intents/<uuid:public_id>/settle-offline/",
        views.OfflineSettlementView.as_view(),
        name="intent-offline-settle",
    ),
    path(
        "intents/<uuid:public_id>/decline-offline/",
        views.OfflineDeclineView.as_view(),
        name="intent-offline-decline",
    ),
    path("refunds/", views.RefundCreateView.as_view(), name="refund-create"),
    path("payments/", views.PaymentListView.as_view(), name="payment-list"),
    path("methods/", views.PaymentMethodsListView.as_view(), name="methods"),
    path(
        "bank-transfer-instructions/",
        views.BankTransferInstructionListCreateView.as_view(),
        name="bank-transfer-instruction-list",
    ),
    path(
        "bank-transfer-instructions/<int:pk>/",
        views.BankTransferInstructionDetailView.as_view(),
        name="bank-transfer-instruction-detail",
    ),
    path(
        "bank-accounts/",
        views.PaymentBankAccountListCreateView.as_view(),
        name="bank-account-list",
    ),
    path(
        "bank-accounts/<int:pk>/",
        views.PaymentBankAccountDetailView.as_view(),
        name="bank-account-detail",
    ),
    path("webhooks/stripe/", webhooks.StripeWebhookView.as_view(), name="stripe-webhook"),
    path(
        "webhooks/iyzico/",
        webhooks.IyziCoWebhookView.as_view(),
        name="iyzico-webhook",
    ),
    path(
        "webhooks/paytr/",
        webhooks.PayTRWebhookView.as_view(),
        name="paytr-webhook",
    ),
]
