from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .enums import ProviderSlug
from .providers import get_provider
from .services import sync_intent_from_provider


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        provider = get_provider(ProviderSlug.STRIPE.value)
        if not provider.webhook_is_valid(request):
            return Response({"detail": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)
        event = provider.parse_webhook_event(request)
        if event.intent_id:
            sync_intent_from_provider(
                provider=ProviderSlug.STRIPE.value,
                provider_intent_id=event.intent_id,
            )
        return Response({"received": True})


class IyziCoWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        return Response(
            {"detail": "IyziCo webhook handling is not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class PayTRWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request, *args, **kwargs):
        return Response(
            {"detail": "PayTR webhook handling is not implemented yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

