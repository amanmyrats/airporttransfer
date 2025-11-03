from __future__ import annotations

from django.urls import path

from . import views, webhooks

app_name = "payment"

urlpatterns = [
    path("intents/", views.PaymentIntentCreateView.as_view(), name="intent-create"),
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
    path("refunds/", views.RefundCreateView.as_view(), name="refund-create"),
    path("methods/", views.PaymentMethodsListView.as_view(), name="methods"),
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

