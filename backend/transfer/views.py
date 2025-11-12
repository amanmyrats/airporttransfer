import logging

from django.http import HttpResponse
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import (
    Q,
    Exists,
    OuterRef,
    Subquery,
    Case,
    When,
    IntegerField,
    Value,
    Count,
    F,
    ExpressionWrapper,
)
from django.db.models.functions import Coalesce

from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.utils import timezone

from common.utils import transform_choices_to_key_value_pairs
from .serializers import (
    ReservationModelSerializer,
    ReservationStatusModelSerializer, 
    ContactUsMessageModelSerializer,
    ReservationClientSerializer,
    ReservationDuePaymentSerializer,
    ReservationPassengerReminderSerializer,
    ReservationPassengerSerializer,
    ReservationPassengerListSerializer,
    ReservationChangeRequestSerializer,
    ReservationChangeRequestCreateSerializer,
)
from .models import (
    Reservation, ContactUsMessage, 
    ReservationChangeRequest,
    ReservationChangeRequestStatus,
    ReservationStatus,
    ReservationPassenger,
)
from .filtersets import (
    ReservationFilterSet, ContactUsMessageFilterSet, 
)
from .resources import (
    ReservationModelResource,
)
from .services import apply_change_request
from reviews.utils import reservation_belongs_to_user
from payment.models import PaymentIntent


logger = logging.getLogger("airporttransfer")


class ReservationModelViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationModelSerializer
    filterset_class = ReservationFilterSet
    search_fields = (
        "number",
        "status",
        "flight_number",
        "passenger_name",
        "passenger_count",
        "note",
        "pickup_short",
        "pickup_full",
        "dest_short",
        "dest_full",
    )
    ordering_fields = (
        "reservation_date",
        "created_at",
        "transfer_date",
        "transfer_time",
        "number",
        "status",
        "pickup_short",
        "pickup_full",
        "dest_short",
        "dest_full",
    )
    ordering = (
        "-reservation_date",
        "-status",
        "-created_at",
        "-transfer_date",
        "transfer_time",
        "number",
        "pickup_short",
        "pickup_full",
        "dest_short",
        "dest_full",
    )

    def get_queryset(self):
        latest_change_request = ReservationChangeRequest.objects.filter(
            reservation=OuterRef("pk")
        ).order_by("-created_at")
        pending_change_request = ReservationChangeRequest.objects.filter(
            reservation=OuterRef("pk"),
            status=ReservationChangeRequestStatus.PENDING_REVIEW,
        )
        return Reservation.objects.all().annotate(
            latest_change_request_status=Subquery(
                latest_change_request.values("status")[:1]
            ),
            has_change_request=Exists(
                pending_change_request
            ),
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status in [
            ReservationStatus.CONFIRMED,
            ReservationStatus.COMPLETED,
            ReservationStatus.CANCELLED_BY_OPERATOR,
            ReservationStatus.CANCELLED_BY_USER,
        ]:
            raise ValidationError("Onaylanmış rezervasyonlar güncellenemez.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status in [
            ReservationStatus.CONFIRMED,
            ReservationStatus.COMPLETED,
            ReservationStatus.CANCELLED_BY_OPERATOR,
            ReservationStatus.CANCELLED_BY_USER,
        ]:
            raise ValidationError("Onaylanmış rezervasyonlar güncellenemez.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status in [
            ReservationStatus.CONFIRMED,
            ReservationStatus.COMPLETED,
            ReservationStatus.CANCELLED_BY_OPERATOR,
            ReservationStatus.CANCELLED_BY_USER,
        ]:
            raise ValidationError("Onaylanmış rezervasyonlar silinemez.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='number/(?P<reservation_number>[^/.]+)')
    def get_by_reservation_number(self, request, reservation_number=None):
        reservation = get_object_or_404(Reservation, number=reservation_number)
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def export(self, request, *args, **kwargs):
        # Use the same queryset as for list view, but without pagination
        queryset = self.filter_queryset(self.get_queryset())
        export_excel_name = "overall"
        logger.debug(f"export_excel_name: {export_excel_name}")

        # Export data using the resource
        resource = ReservationModelResource()
        dataset = resource.export(queryset=queryset[:1000])

        # Always export as CSV
        export_data = dataset.csv
        content_type = "text/csv"
        extension = "csv"
        response_data = export_data.encode("utf-8")

        # Use HttpResponse for binary data to avoid any encoding issues
        response = HttpResponse(response_data, content_type=content_type)
        response["Content-Disposition"] = (
            f'attachment; filename="{export_excel_name}-rezervasyonlar.{extension}"'
        )
        response["Access-Control-Expose-Headers"] = (
            "Content-Disposition"  # Required for CORS
        )

        return response

    @action(detail=True, methods=["put"])
    def update_status(self, request, pk=None):
        serializer = ReservationStatusModelSerializer(
            instance=self.get_object(), data=request.data, partial=True
        )
        if serializer.is_valid(raise_exception=True):
            reservation = serializer.save()
            serialized_data = ReservationModelSerializer(reservation).data
            return Response(serialized_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def statuses(self, request, *args, **kwargs):
        statuses = [{"value": choice.value, "label": choice.label} for choice in ReservationStatus]
        return Response(statuses, status=status.HTTP_200_OK)


class StatusChoicesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        choices = [(choice.value, choice.label) for choice in ReservationStatus]
        return Response(transform_choices_to_key_value_pairs(choices), status=status.HTTP_200_OK)
    

class ChangeRequestStatusChoicesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        choices = [
            (choice.value, choice.label)
            for choice in ReservationChangeRequestStatus
        ]
        return Response(transform_choices_to_key_value_pairs(choices), status=status.HTTP_200_OK)
    

class BookingCreateAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = ReservationModelSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            greet_with_flower = serializer.validated_data.get("greet_with_flower")
            greet_with_champagne = serializer.validated_data.get("greet_with_champagne")
            note = serializer.validated_data.get("note")

            if greet_with_flower or greet_with_champagne:
                # Add the note to the serializer's data
                serializer.validated_data["note"] = f"{note or ''}\n" \
                    f"{'ARRIVAL transferinde Çiçek ile karşılanacak.' if greet_with_flower else ''}\n" \
                    f"{'ARRIVAL transferinde Şampanya ile karşılanacak.' if greet_with_champagne else ''}"
            reservation = serializer.save()

            is_round_trip = serializer.validated_data.get("is_round_trip")
            if is_round_trip:
                round_trip_data = request.data.copy()
                round_trip_data["transfer_date"] = serializer.validated_data.get(
                    "return_transfer_date"
                )
                round_trip_data["transfer_time"] = serializer.validated_data.get(
                    "return_transfer_time"
                )
                round_trip_data["flight_number"] = serializer.validated_data.get(
                    "return_flight_number"
                )
                round_trip_data["amount"] = serializer.validated_data.get("return_trip_amount")
                round_trip_data["pickup_short"] = serializer.validated_data.get(
                    "dest_short"
                )
                round_trip_data["pickup_full"] = serializer.validated_data.get(
                    "dest_full"
                )
                round_trip_data["dest_short"] = serializer.validated_data.get(
                    "pickup_short"
                )
                round_trip_data["dest_full"] = serializer.validated_data.get(
                    "pickup_full"
                )
                note = serializer.validated_data.get("note")
                if greet_with_flower or greet_with_champagne:
                    round_trip_data["note"] = note

                round_trip_serializer = ReservationModelSerializer(data=round_trip_data)
                if round_trip_serializer.is_valid(raise_exception=True):
                    round_trip_reservation = round_trip_serializer.save()
                    return Response(
                        {
                            "one_way": serializer.data,
                            "return": round_trip_serializer.data,
                        },
                        status=status.HTTP_201_CREATED,
                    )
            return Response({"one_way": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingUpdateAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def put(self, request, *args, **kwargs):
        try:
            reservation = get_object_or_404(Reservation, pk=kwargs["pk"])
            serializer = ReservationModelSerializer(
                instance=reservation, data=request.data, partial=True
            )
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactUsModelViewSet(viewsets.ModelViewSet):
    queryset = ContactUsMessage.objects.all()
    serializer_class = ContactUsMessageModelSerializer
    filterset_class = ContactUsMessageFilterSet
    

class SendMessageAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = ContactUsMessageModelSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()


# DEFAULT_FROM_EMAIL = 'info@transfertakip.com'

# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = os.getenv('EMAIL_HOST_TRANSFERTAKIP')
# EMAIL_PORT = os.getenv('EMAIL_PORT_TRANSFERTAKIP')
# # EMAIL_USE_TLS = True
# EMAIL_USE_TLS = False
# EMAIL_USE_SSL = True
# EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER_TRANSFERTAKIP')
# EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD_TRANSFERTAKIP')

            # send mail to info@transfertakip.com
            subject = f"Contact Us Message from {serializer.data.get('email')} - {serializer.data.get('name')}"
            message = f"""
Name: {serializer.data.get('name')} 
Email: {serializer.data.get('email')}
Phone: {serializer.data.get('phone')}
Message: {serializer.data.get('message')}
"""
            send_mail(
                subject, 
                message,
                settings.EMAIL_HOST_USER, 
                ['amansarahs@gmail.com', 'deryamyrat899@gmail.com']
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _ensure_reservation_access(reservation: Reservation, user) -> None:
    if not reservation_belongs_to_user(reservation, user):
        raise PermissionDenied("Reservation not found.")


def _reservations_queryset_for_user(user):
    field_names = {field.name for field in Reservation._meta.get_fields()}
    filters = Q()

    email = (getattr(user, "email", "") or "").strip()
    if email:
        filters |= Q(passenger_email__iexact=email)

    if "owner" in field_names:
        filters |= Q(owner=user)

    if "account" in field_names:
        filters |= Q(account=user)

    if "customer_profile" in field_names and hasattr(user, "customer_profile"):
        filters |= Q(customer_profile=user.customer_profile)

    if not filters:
        return Reservation.objects.none()

    return Reservation.objects.filter(filters).distinct()


STATUS_PRIORITY_SEQUENCE = [
    ReservationStatus.DRAFT,
    ReservationStatus.AWAITING_PAYMENT,
    ReservationStatus.CONFIRMED,
    ReservationStatus.COMPLETED,
    ReservationStatus.CANCELLED_BY_USER,
    ReservationStatus.CANCELLED_BY_OPERATOR,
    ReservationStatus.NO_SHOW,
]


class MyReservationListAPIView(ListAPIView):
    serializer_class = ReservationClientSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = ReservationFilterSet
    search_fields = (
        "number",
        "pickup_short",
        "pickup_full",
        "dest_short",
        "dest_full",
        "passenger_name",
        "passenger_email",
        "note",
    )
    ordering_fields = (
        "transfer_date",
        "transfer_time",
        "reservation_date",
        "status",
        "status_priority",
        "payment_status",
        "created_at",
    )
    ordering = ("status_priority", "status", "-reservation_date", "-transfer_date", "-transfer_time", "-created_at")

    def get_queryset(self):
        base_queryset = _reservations_queryset_for_user(self.request.user)
        priority_case = Case(
            *[
                When(status=status_value, then=Value(index))
                for index, status_value in enumerate(STATUS_PRIORITY_SEQUENCE)
            ],
            default=Value(len(STATUS_PRIORITY_SEQUENCE)),
            output_field=IntegerField(),
        )
        return (
            base_queryset.annotate(status_priority=priority_case)
            .order_by(*self.ordering)
        )


class MyReservationDuePaymentListAPIView(ListAPIView):
    serializer_class = ReservationDuePaymentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    DUE_RESERVATION_STATUSES = [
        ReservationStatus.DRAFT,
        ReservationStatus.AWAITING_PAYMENT,
    ]
    DUE_PAYMENT_STATES = ["unpaid"]

    def get_queryset(self):
        base_queryset = _reservations_queryset_for_user(self.request.user)
        return (
            base_queryset.filter(
                status__in=self.DUE_RESERVATION_STATUSES,
                payment_status__in=self.DUE_PAYMENT_STATES,
            )
            .order_by("-updated_at", "-created_at")
        )

    def list(self, request, *args, **kwargs):
        queryset = list(self.get_queryset()[: self._limit()])
        due_map = self._build_due_map(res.number for res in queryset)
        serializer = self.get_serializer(
            queryset,
            many=True,
            context={
                **self.get_serializer_context(),
                "due_map": due_map,
            },
        )
        return Response(serializer.data)

    def _limit(self) -> int:
        raw_limit = self.request.query_params.get("limit")
        try:
            limit = int(raw_limit) if raw_limit is not None else 5
        except (TypeError, ValueError):
            limit = 5
        return max(1, min(limit, 10))

    def _build_due_map(self, booking_refs_iterable):
        booking_refs = list({reference for reference in booking_refs_iterable if reference})
        if not booking_refs:
            return {}

        intents = (
            PaymentIntent.objects.filter(booking_ref__in=booking_refs)
            .order_by("booking_ref", "-created_at")
        )
        due_map = {}
        for intent in intents:
            reference = intent.booking_ref
            if reference in due_map:
                continue
            due_map[reference] = {
                "due_minor": intent.due_minor,
                "due_currency": intent.currency,
            }
        return due_map


class MyReservationMissingPassengerListAPIView(ListAPIView):
    serializer_class = ReservationPassengerReminderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    MAX_RESULTS = 5
    ACTIVE_STATUSES = [
        ReservationStatus.DRAFT,
        ReservationStatus.AWAITING_PAYMENT,
        ReservationStatus.CONFIRMED,
    ]

    def get_queryset(self):
        reservation_qs = _reservations_queryset_for_user(self.request.user).filter(
            status__in=self.ACTIVE_STATUSES,
        )
        extra_adults = Case(
            When(passenger_count__gt=1, then=F('passenger_count') - 1),
            default=Value(0),
            output_field=IntegerField(),
        )
        expected_extra = ExpressionWrapper(
            extra_adults + Coalesce(F('passenger_count_child'), Value(0)),
            output_field=IntegerField(),
        )
        annotated = reservation_qs.annotate(
            passenger_names_count=Count('passengers', distinct=True),
            expected_extra=expected_extra,
        )
        pending = annotated.filter(
            expected_extra__gt=0,
            passenger_names_count__lt=F('expected_extra'),
        ).order_by('-updated_at', '-created_at')
        return pending[: self._limit()]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    def _limit(self) -> int:
        raw = self.request.query_params.get('limit')
        try:
            value = int(raw) if raw is not None else self.MAX_RESULTS
        except (TypeError, ValueError):
            value = self.MAX_RESULTS
        return max(1, min(value, self.MAX_RESULTS))


class MyReservationPassengersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, reservation_id: int, *args, **kwargs):
        reservation = get_object_or_404(Reservation, pk=reservation_id)
        _ensure_reservation_access(reservation, request.user)
        passengers = ReservationPassenger.objects.filter(reservation=reservation).order_by('order', 'id')
        serializer = ReservationPassengerSerializer(passengers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, reservation_id: int, *args, **kwargs):
        reservation = get_object_or_404(Reservation, pk=reservation_id)
        _ensure_reservation_access(reservation, request.user)
        serializer = ReservationPassengerListSerializer(
            data=request.data or {},
            context={'reservation': reservation},
        )
        serializer.is_valid(raise_exception=True)
        passengers = serializer.save()
        response_serializer = ReservationPassengerSerializer(passengers, many=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class MyReservationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int, *args, **kwargs):
        reservation = get_object_or_404(Reservation, pk=pk)
        _ensure_reservation_access(reservation, request.user)
        serializer = ReservationClientSerializer(reservation, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyReservationChangeRequestCollectionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, reservation_id: int, *args, **kwargs):
        reservation = get_object_or_404(Reservation, pk=reservation_id)
        _ensure_reservation_access(reservation, request.user)
        queryset = reservation.change_requests.order_by("-created_at")
        serializer = ReservationChangeRequestSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, reservation_id: int, *args, **kwargs):
        print('reservation_id:', reservation_id)
        reservation = get_object_or_404(Reservation, pk=reservation_id)
        print('reservation found:', reservation)
        _ensure_reservation_access(reservation, request.user)
        serializer = ReservationChangeRequestCreateSerializer(
            data=request.data,
            context={"request": request, "reservation": reservation},
        )
        serializer.is_valid(raise_exception=True)
        print('serializer is valid:', serializer.is_valid())
        try:
            change_request = serializer.save()
        except Exception as e:
            print('Error saving change request:', e)
            raise
        print('change_request created:', change_request)
        print('change_request status:', change_request.status)

        try:
            if (
                change_request.status == ReservationChangeRequestStatus.AUTO_APPROVED
                and not change_request.requires_manual_review
            ):
                apply_change_request(change_request, actor=request.user)
            change_request.refresh_from_db()
        except Exception as e:
            print('Error applying change request:', e)
            raise

        response_serializer = ReservationChangeRequestSerializer(change_request, context={"request": request})
        print('response_serializer data:', response_serializer.data)
        http_status = status.HTTP_200_OK if serializer.validated_data.get("existing_request") else status.HTTP_201_CREATED
        print('http_status:', http_status)
        return Response(response_serializer.data, status=http_status)


class MyReservationChangeRequestDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int, *args, **kwargs):
        change_request = get_object_or_404(ReservationChangeRequest, pk=pk)
        _ensure_reservation_access(change_request.reservation, request.user)
        serializer = ReservationChangeRequestSerializer(change_request, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyReservationChangeRequestCancelAPIView(APIView):
    permission_classes = [IsAuthenticated]

    cancellable_statuses = {
        ReservationChangeRequestStatus.PENDING_REVIEW,
        ReservationChangeRequestStatus.AUTO_APPROVED,
        ReservationChangeRequestStatus.AWAITING_USER_PAYMENT,
    }

    def post(self, request, pk: int, *args, **kwargs):
        change_request = get_object_or_404(ReservationChangeRequest, pk=pk)
        _ensure_reservation_access(change_request.reservation, request.user)

        if change_request.status not in self.cancellable_statuses:
            raise ValidationError({"status": "Only pending change requests can be cancelled."})

        change_request.status = ReservationChangeRequestStatus.CANCELLED
        change_request.decision_reason = request.data.get("reason", change_request.decision_reason or "")
        change_request.decided_by = request.user
        change_request.decided_at = timezone.now()
        change_request.save(
            update_fields=["status", "decision_reason", "decided_by", "decided_at", "updated_at"]
        )

        serializer = ReservationChangeRequestSerializer(change_request, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminReservationChangeRequestListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        queryset = ReservationChangeRequest.objects.all().order_by("-created_at")
        status_param = request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        reservation_param = request.query_params.get("reservation")
        if reservation_param:
            queryset = queryset.filter(reservation_id=reservation_param)
        serializer = ReservationChangeRequestSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminReservationChangeRequestApproveAPIView(APIView):
    permission_classes = [IsAdminUser]

    ALLOWED_STATUSES = {
        ReservationChangeRequestStatus.PENDING_REVIEW,
        ReservationChangeRequestStatus.AUTO_APPROVED,
        ReservationChangeRequestStatus.AWAITING_USER_PAYMENT,
    }

    def post(self, request, pk: int, *args, **kwargs):
        change_request = get_object_or_404(ReservationChangeRequest, pk=pk)
        if change_request.status not in self.ALLOWED_STATUSES:
            raise ValidationError({"status": "Change request cannot be approved in its current state."})

        apply_change_request(change_request, actor=request.user)
        note = request.data.get("note")
        if note:
            change_request.decision_reason = note
            change_request.save(update_fields=["decision_reason", "updated_at"])
        serializer = ReservationChangeRequestSerializer(change_request, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminReservationChangeRequestDeclineAPIView(APIView):
    permission_classes = [IsAdminUser]

    DECLINABLE_STATUSES = {
        ReservationChangeRequestStatus.PENDING_REVIEW,
        ReservationChangeRequestStatus.AWAITING_USER_PAYMENT,
    }

    def post(self, request, pk: int, *args, **kwargs):
        change_request = get_object_or_404(ReservationChangeRequest, pk=pk)
        if change_request.status not in self.DECLINABLE_STATUSES:
            raise ValidationError({"status": "Change request cannot be declined in its current state."})

        reason = request.data.get("note")
        change_request.mark_declined(request.user, reason)
        serializer = ReservationChangeRequestSerializer(change_request, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
