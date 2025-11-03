from __future__ import annotations

from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PaymentIntent
from .permissions import IsAuthenticatedPaymentUser, IsPaymentStaff
from .selectors import list_available_methods, list_offline_pending
from .serializers import (
    OfflineReceiptSerializer,
    OfflineReceiptUploadSerializer,
    OfflineSettleSerializer,
    PaymentIntentConfirmSerializer,
    PaymentIntentCreateSerializer,
    PaymentIntentDetailSerializer,
    PaymentIntentResponseSerializer,
    PaymentMethodSerializer,
    PaymentSerializer,
    RefundCreateSerializer,
)
from .throttles import PaymentIntentConfirmThrottle, PaymentIntentCreateThrottle
from .schema import payment_schema


class PaymentIntentCreateView(generics.CreateAPIView):
    queryset = PaymentIntent.objects.all()
    serializer_class = PaymentIntentCreateSerializer
    permission_classes = [IsAuthenticatedPaymentUser]
    throttle_classes = [PaymentIntentCreateThrottle]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsPaymentStaff()]
        return super().get_permissions()

    @payment_schema(
        summary="Create a payment intent",
        request=PaymentIntentCreateSerializer,
        responses={201: PaymentIntentResponseSerializer},
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        intent = serializer.save()
        payload = PaymentIntentResponseSerializer(intent, context=self.get_serializer_context()).data
        return Response(payload, status=status.HTTP_201_CREATED)

    @payment_schema(
        summary="List pending offline payment intents",
        responses={200: PaymentIntentDetailSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        days = request.query_params.get("days")
        days_int = int(days) if days else None
        intents = list_offline_pending(days=days_int)
        serializer = PaymentIntentDetailSerializer(intents, many=True)
        return Response(serializer.data)


class PaymentIntentDetailView(generics.RetrieveAPIView):
    queryset = PaymentIntent.objects.prefetch_related("payments", "offline_receipts", "ledger_entries")
    serializer_class = PaymentIntentDetailSerializer
    lookup_field = "public_id"
    permission_classes = [IsAuthenticatedPaymentUser]


class PaymentIntentConfirmView(APIView):
    permission_classes = [IsAuthenticatedPaymentUser]
    throttle_classes = [PaymentIntentConfirmThrottle]

    @payment_schema(
        summary="Confirm a payment intent",
        request=PaymentIntentConfirmSerializer,
        responses={200: PaymentIntentResponseSerializer},
    )
    def post(self, request, public_id: str):
        serializer = PaymentIntentConfirmSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)
        intent = serializer.save(public_id=public_id)
        payload = PaymentIntentResponseSerializer(intent).data
        return Response(payload, status=status.HTTP_200_OK)


class OfflineReceiptUploadView(APIView):
    permission_classes = [IsAuthenticatedPaymentUser]
    parser_classes = [MultiPartParser, FormParser]

    @payment_schema(
        summary="Upload offline payment receipt",
        request=OfflineReceiptUploadSerializer,
        responses={201: OfflineReceiptSerializer},
    )
    def post(self, request, public_id: str):
        serializer = OfflineReceiptUploadSerializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        receipt = serializer.save(public_id=public_id, user=request.user)
        return Response(OfflineReceiptSerializer(receipt).data, status=status.HTTP_201_CREATED)


class OfflineSettlementView(APIView):
    permission_classes = [IsPaymentStaff]

    @payment_schema(
        summary="Settle an offline payment intent",
        request=OfflineSettleSerializer,
    )
    def post(self, request, public_id: str):
        serializer = OfflineSettleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(public_id=public_id)

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)


class RefundCreateView(generics.CreateAPIView):
    serializer_class = RefundCreateSerializer
    permission_classes = [IsPaymentStaff]

    @payment_schema(
        summary="Issue a refund",
        request=RefundCreateSerializer,
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refund = serializer.save()
        return Response(
            data={
                "refund": refund.id,
                "status": refund.status,
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentMethodsListView(APIView):
    permission_classes = [permissions.AllowAny]

    @payment_schema(
        summary="List available payment methods",
        responses={200: PaymentMethodSerializer(many=True)},
    )
    def get(self, request):
        methods = [
            PaymentMethodSerializer.from_available(available)
            for available in list_available_methods()
        ]
        return Response(methods)
