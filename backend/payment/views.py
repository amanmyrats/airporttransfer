from __future__ import annotations

from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .enums import IntentStatus
from .models import BankTransferInstruction, Payment, PaymentBankAccount, PaymentIntent
from .permissions import IsAuthenticatedPaymentUser, IsPaymentStaff
from .selectors import list_available_methods, list_offline_pending
from .serializers import (
    OfflineDeclineSerializer,
    OfflineReceiptSerializer,
    OfflineReceiptUploadSerializer,
    OfflineSettleSerializer,
    BankTransferInstructionAdminSerializer,
    PaymentBankAccountSerializer,
    PaymentIntentConfirmSerializer,
    PaymentIntentCreateSerializer,
    PaymentIntentDetailSerializer,
    PaymentIntentResponseSerializer,
    PendingSettlementIntentSerializer,
    PaymentMethodSerializer,
    PaymentSerializer,
    RefundCreateSerializer,
)
from .throttles import PaymentIntentConfirmThrottle, PaymentIntentCreateThrottle
from .schema import payment_schema
from transfer.models import Reservation


class PaymentIntentCreateView(generics.CreateAPIView):
    queryset = PaymentIntent.objects.all()
    serializer_class = PaymentIntentCreateSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PaymentIntentCreateThrottle]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsPaymentStaff()]
        return super().get_permissions()

    def get_throttles(self):
        if self.request.method == "GET":
            return []
        return super().get_throttles()

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
    permission_classes = [permissions.AllowAny]


class PaymentIntentConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
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
    permission_classes = [permissions.AllowAny]
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


class OfflineDeclineView(APIView):
    permission_classes = [IsPaymentStaff]

    @payment_schema(
        summary="Decline an offline payment intent",
        request=OfflineDeclineSerializer,
    )
    def post(self, request, public_id: str):
        serializer = OfflineDeclineSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)
        intent = serializer.save(public_id=public_id)
        return Response(PaymentIntentResponseSerializer(intent).data, status=status.HTTP_200_OK)


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


class PaymentIntentByBookingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, booking_ref: str):
        intent = (
            PaymentIntent.objects.prefetch_related("payments", "offline_receipts", "ledger_entries")
            .filter(booking_ref=booking_ref)
            .order_by("-created_at")
            .first()
        )
        if not intent:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = PaymentIntentDetailSerializer(intent)
        return Response(serializer.data)


class PaymentIntentHistoryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, booking_ref: str):
        intents = (
            PaymentIntent.objects.prefetch_related("payments", "offline_receipts", "ledger_entries")
            .filter(booking_ref=booking_ref)
            .order_by("-created_at")
        )
        serializer = PaymentIntentDetailSerializer(intents, many=True)
        return Response(serializer.data)


class BankTransferInstructionListCreateView(generics.ListCreateAPIView):
    serializer_class = BankTransferInstructionAdminSerializer
    permission_classes = [IsPaymentStaff]
    pagination_class = None

    def get_queryset(self):
        queryset = (
            BankTransferInstruction.objects.select_related("payment_intent")
            .prefetch_related("bank_accounts")
            .order_by("-created_at")
        )
        booking_ref = self.request.query_params.get("booking_ref")
        method = self.request.query_params.get("method")
        search = self.request.query_params.get("search")
        if booking_ref:
            queryset = queryset.filter(payment_intent__booking_ref__icontains=booking_ref)
        if method:
            queryset = queryset.filter(payment_intent__method=method)
        if search:
            queryset = queryset.filter(
                Q(bank_accounts__iban__icontains=search)
                | Q(bank_accounts__account_name__icontains=search)
                | Q(bank_accounts__bank_name__icontains=search)
                | Q(bank_accounts__phone_number__icontains=search)
                | Q(reference_text__icontains=search)
            )
        return queryset.distinct()


class BankTransferInstructionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BankTransferInstruction.objects.select_related("payment_intent").prefetch_related("bank_accounts")
    serializer_class = BankTransferInstructionAdminSerializer
    permission_classes = [IsPaymentStaff]


class PaymentBankAccountListCreateView(generics.ListCreateAPIView):
    queryset = PaymentBankAccount.objects.all()
    serializer_class = PaymentBankAccountSerializer
    permission_classes = [IsPaymentStaff]
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()
        method = self.request.query_params.get("method")
        currency = self.request.query_params.get("currency")
        is_active = self.request.query_params.get("is_active")
        if method:
            queryset = queryset.filter(method=method)
        if currency:
            queryset = queryset.filter(currency__iexact=currency)
        if is_active is not None:
            if str(is_active).lower() in {"true", "1"}:
                queryset = queryset.filter(is_active=True)
            elif str(is_active).lower() in {"false", "0"}:
                queryset = queryset.filter(is_active=False)
        return queryset.order_by("-is_active", "-priority", "label")


class PaymentBankAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PaymentBankAccount.objects.all()
    serializer_class = PaymentBankAccountSerializer
    permission_classes = [IsPaymentStaff]


class PaymentIntentListView(generics.ListAPIView):
    queryset = PaymentIntent.objects.prefetch_related("payments", "offline_receipts", "ledger_entries")
    serializer_class = PaymentIntentDetailSerializer
    permission_classes = [IsPaymentStaff]
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get("status")
        method = self.request.query_params.get("method")
        booking_ref = self.request.query_params.get("booking_ref")

        if status_param:
            statuses = [value.strip() for value in status_param.split(",") if value.strip()]
            if statuses:
                queryset = queryset.filter(status__in=statuses)
        if method:
            queryset = queryset.filter(method__iexact=method)
        if booking_ref:
            queryset = queryset.filter(booking_ref__icontains=booking_ref)
        return queryset.order_by("-updated_at")


class PendingSettlementIntentListView(APIView):
    permission_classes = [IsPaymentStaff]

    def get(self, request):
        limit_param = request.query_params.get("limit")
        try:
            limit = int(limit_param) if limit_param is not None else 10
        except (TypeError, ValueError):
            limit = 10
        limit = max(1, min(limit, 50))

        queryset = (
            PaymentIntent.objects.pending_offline()
            .filter(status=IntentStatus.PROCESSING.value)
            .order_by("-updated_at")
        )
        intents = list(queryset[:limit])
        booking_refs = [intent.booking_ref for intent in intents if intent.booking_ref]
        reservations = {}
        if booking_refs:
            reservations = {
                reservation.number: reservation
                for reservation in Reservation.objects.filter(number__in=booking_refs)
            }

        serializer = PendingSettlementIntentSerializer(
            intents,
            many=True,
            context={"reservations": reservations},
        )
        return Response(serializer.data)


class PaymentListView(generics.ListAPIView):
    queryset = Payment.objects.select_related("payment_intent")
    serializer_class = PaymentSerializer
    permission_classes = [IsPaymentStaff]
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get("status")
        booking_ref = self.request.query_params.get("booking_ref")
        method = self.request.query_params.get("method")

        if status_param:
            statuses = [value.strip() for value in status_param.split(",") if value.strip()]
            if statuses:
                queryset = queryset.filter(status__in=statuses)
        if booking_ref:
            queryset = queryset.filter(payment_intent__booking_ref__icontains=booking_ref)
        if method:
            queryset = queryset.filter(payment_intent__method__iexact=method)
        return queryset.order_by("-created_at")
