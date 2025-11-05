import datetime
from decimal import Decimal

from rest_framework import serializers
from rest_framework.serializers import (
    ModelSerializer,
    TimeField,
    ValidationError,
    DateField,
    DecimalField,
    CharField,
)

from django.db import ProgrammingError, OperationalError
from django.db.models import Q

from reviews.models import Review

from .models import (
    Reservation,
    ContactUsMessage,
    ReservationChangeRequest,
    ReservationChangeRequestStatus,
    ReservationStatus,
)
from .services import (
    ALLOWED_CHANGE_FIELDS,
    evaluate_change_request_policy,
    extract_effective_changes,
)


class Time24HourField(TimeField):
    def to_representation(self, value):
        if value is None:
            return None
        return value.strftime('%H:%M')
    def from_representation(self, value):
        if value is None:
            return None
        try:
            return datetime.datetime.strptime(value, '%H:%M').time()
        except ValueError:
            raise ValidationError('Invalid time format. Use HH:MM (24-hour format).')
        

class ReservationModelSerializer(ModelSerializer):
    transfer_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    flight_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    return_transfer_date = DateField(required=False, allow_null=True)
    return_transfer_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    return_flight_number = CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    return_trip_amount = DecimalField(max_digits=10, decimal_places=2, default=0, required=False, allow_null=True)
    latest_change_request_status = CharField(read_only=True, required=False, allow_blank=True, allow_null=True)
    has_change_request = serializers.BooleanField(read_only=True, required=False)

    def create(self, validated_data):
        # Extract the extra fields
        return_transfer_date = validated_data.pop('return_transfer_date', None)
        return_transfer_time = validated_data.pop('return_transfer_time', None)
        return_flight_number = validated_data.pop('return_flight_number', None)
        return_trip_amount = validated_data.pop('return_trip_amount', None)
        reservation = super().create(validated_data)
        return reservation
    class Meta:
        model = Reservation
        fields = '__all__'
    

class ReservationStatusModelSerializer(ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'status')
        

class ContactUsMessageModelSerializer(ModelSerializer):
    class Meta:
        model = ContactUsMessage
        fields = '__all__'


class ReservationClientSerializer(ModelSerializer):
    transfer_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    flight_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    has_review = serializers.SerializerMethodField()
    can_review = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = (
            "id",
            "number",
            "status",
            "reservation_date",
            "transfer_date",
            "transfer_time",
            "flight_number",
            "flight_date",
            "flight_time",
            "passenger_name",
            "passenger_email",
            "passenger_phone",
            "passenger_count",
            "passenger_count_child",
            "note",
            "pickup_short",
            "pickup_full",
            "dest_short",
            "dest_full",
            "need_child_seat",
            "child_seat_count",
            "greet_with_champagne",
            "greet_with_flower",
            "payment_status",
            "has_review",
            "can_review",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_has_review(self, obj: Reservation) -> bool:
        try:
            return Review.objects.filter(reservation_id=obj.pk).exists()
        except (ProgrammingError, OperationalError):
            # Database might not have the reviews table yet; treat as no review.
            return False

    def get_can_review(self, obj: Reservation) -> bool:
        status = (getattr(obj, "status", "") or "").lower()
        return status in {"confirmed", "completed"}


class ReservationChangeRequestSerializer(ModelSerializer):
    reservation_status = serializers.CharField(source="reservation.status", read_only=True)
    reservation_number = serializers.CharField(source="reservation.number", read_only=True)

    class Meta:
        model = ReservationChangeRequest
        fields = (
            "id",
            "reservation",
            "reservation_number",
            "reservation_status",
            "status",
            "proposed_changes",
            "applied_changes",
            "pricing_delta",
            "cutoff_ok",
            "requires_manual_review",
            "reason_code",
            "idempotency_key",
            "expires_at",
            "created_by",
            "decided_by",
            "decided_at",
            "decision_reason",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "status",
            "applied_changes",
            "pricing_delta",
            "cutoff_ok",
            "requires_manual_review",
            "expires_at",
            "created_by",
            "decided_by",
            "decided_at",
            "decision_reason",
            "created_at",
            "updated_at",
        )


class ReservationChangeRequestCreateSerializer(serializers.Serializer):
    reason_code = serializers.CharField(required=False, allow_blank=True, max_length=255)
    changes = serializers.DictField(
        child=serializers.JSONField(), allow_empty=False, help_text="Partial reservation payload."
    )
    idempotency_key = serializers.CharField(required=False, allow_blank=True, max_length=64)

    def validate(self, attrs):
        reservation: Reservation = self.context["reservation"]
        request = self.context["request"]
        changes = attrs.get("changes") or {}

        allowed_statuses = {
            ReservationStatus.DRAFT,
            ReservationStatus.AWAITING_PAYMENT,
            ReservationStatus.CONFIRMED,
            ReservationStatus.COMPLETED,
        }
        if reservation.status not in allowed_statuses:
            raise ValidationError(
                {
                    "reservation": (
                        "Reservation is not in an editable state. "
                        "Only draft, awaiting payment, confirmed, or completed trips can be updated."
                    )
                }
            )

        disallowed_fields = set(changes.keys()) - ALLOWED_CHANGE_FIELDS
        if disallowed_fields:
            raise ValidationError(
                {"changes": f"These fields cannot be edited: {', '.join(sorted(disallowed_fields))}"}
            )

        reservation_serializer = ReservationModelSerializer(
            instance=reservation, data=changes, partial=True, context=self.context
        )
        reservation_serializer.is_valid(raise_exception=True)
        validated_changes = dict(reservation_serializer.validated_data)

        effective_changes = extract_effective_changes(reservation, validated_changes)
        if not effective_changes:
            raise ValidationError({"changes": "No actual changes detected."})

        status, cutoff_ok, requires_manual_review = evaluate_change_request_policy(
            reservation, effective_changes
        )
        idempotency_key = attrs.get("idempotency_key") or None
        if idempotency_key:
            existing = reservation.change_requests.filter(idempotency_key=idempotency_key).first()
            if existing:
                attrs["existing_request"] = existing

        if not attrs.get("existing_request"):
            existing_open = reservation.change_requests.filter(
                Q(status=ReservationChangeRequestStatus.PENDING_REVIEW)
                | Q(status=ReservationChangeRequestStatus.AWAITING_USER_PAYMENT)
            )
            if existing_open.exists():
                raise ValidationError(
                    {
                        "reservation": "There is already a change request pending review for this reservation."
                    }
                )

        attrs["validated_changes"] = effective_changes
        attrs["target_status"] = status
        attrs["cutoff_ok"] = cutoff_ok
        attrs["requires_manual_review"] = requires_manual_review
        attrs["pricing_delta"] = Decimal("0.00")
        attrs["created_by"] = getattr(request, "user", None)
        return attrs

    def create(self, validated_data):
        reservation: Reservation = self.context["reservation"]
        request = self.context["request"]

        existing = validated_data.get("existing_request")
        if existing:
            return existing

        proposed_changes = {
            field: self._normalize_for_storage(value)
            for field, value in validated_data["validated_changes"].items()
        }

        change_request = ReservationChangeRequest.objects.create(
            reservation=reservation,
            status=validated_data["target_status"],
            proposed_changes=proposed_changes,
            pricing_delta=validated_data["pricing_delta"],
            cutoff_ok=validated_data["cutoff_ok"],
            requires_manual_review=validated_data["requires_manual_review"],
            reason_code=validated_data.get("reason_code", ""),
            idempotency_key=validated_data.get("idempotency_key") or None,
            created_by=getattr(request, "user"),
        )
        return change_request

    def _normalize_for_storage(self, value):
        if isinstance(value, (datetime.date, datetime.time, datetime.datetime)):
            return value.isoformat()
        if isinstance(value, Decimal):
            return str(value)
        return value
