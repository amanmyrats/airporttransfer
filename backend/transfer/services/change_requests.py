from __future__ import annotations

import datetime as dt
from decimal import Decimal
from typing import Any, Dict, Tuple

from django.db import transaction
from django.utils import timezone

from ..models import Reservation, ReservationChangeRequest, ReservationChangeRequestStatus, ReservationStatus

# Only allow passengers to adjust operational fields that do not impact pricing.
ALLOWED_CHANGE_FIELDS = {
    "transfer_date",
    "transfer_time",
    "flight_date",
    "flight_time",
    "flight_number",
    "passenger_count",
    "passenger_count_child",
    "need_child_seat",
    "child_seat_count",
    "note",
}

# 24-hour default cutoff for time-sensitive mutations.
DEFAULT_EDIT_CUTOFF = dt.timedelta(hours=24)


def extract_effective_changes(
    reservation: Reservation, validated_changes: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Return the subset of validated_changes that will actually mutate the reservation.
    This strips out values that are identical to the current state, providing a clean diff.
    """
    effective: Dict[str, Any] = {}
    for field, new_value in validated_changes.items():
        current_value = getattr(reservation, field, None)
        if _normalize_value(current_value) != _normalize_value(new_value):
            effective[field] = new_value
    return effective


def evaluate_change_request_policy(
    reservation: Reservation,
    effective_changes: Dict[str, Any],
    *,
    now: dt.datetime | None = None,
    edit_cutoff: dt.timedelta = DEFAULT_EDIT_CUTOFF,
) -> Tuple[ReservationChangeRequestStatus, bool, bool]:
    """
    Apply business policy to determine the target status, cutoff flag, and manual review requirement.
    """
    now = now or timezone.now()
    if reservation.status == ReservationStatus.DRAFT:
        # Draft reservations can be updated without staff involvement.
        return (
            ReservationChangeRequestStatus.AUTO_APPROVED,
            True,
            False,
        )

    cutoff_ok = _is_within_cutoff(reservation, effective_changes, now=now, edit_cutoff=edit_cutoff)
    total_passengers = _calculate_total_passengers(reservation, effective_changes)
    capacity_ok = total_passengers <= 6

    requires_manual_review = not (cutoff_ok and capacity_ok)

    if requires_manual_review:
        status = ReservationChangeRequestStatus.PENDING_REVIEW
    else:
        status = ReservationChangeRequestStatus.AUTO_APPROVED

    return status, cutoff_ok, requires_manual_review


@transaction.atomic
def apply_change_request(
    change_request: ReservationChangeRequest,
    *,
    actor: Any | None = None,
    applied_changes: Dict[str, Any] | None = None,
) -> Reservation:
    """
    Persist the proposed changes onto the reservation under a single transaction.
    """
    reservation = Reservation.objects.select_for_update().get(pk=change_request.reservation_id)

    raw_changes = applied_changes or change_request.proposed_changes or {}

    from ..serializers import ReservationModelSerializer  # Local import to avoid circular dependency

    serializer = ReservationModelSerializer(instance=reservation, data=raw_changes, partial=True)
    serializer.is_valid(raise_exception=True)
    changes = serializer.validated_data

    for field, value in changes.items():
        setattr(reservation, field, value)
    reservation.save()

    serialized_changes = {_serialize_key(field): _serialize_value(value) for field, value in changes.items()}

    change_request.applied_changes = serialized_changes
    change_request.status = ReservationChangeRequestStatus.APPROVED_APPLIED
    change_request.decided_at = timezone.now()
    if actor:
        change_request.decided_by = actor
    change_request.save(
        update_fields=[
            "applied_changes",
            "status",
            "decided_at",
            "decided_by",
            "updated_at",
        ]
    )

    return reservation


def _calculate_total_passengers(reservation: Reservation, changes: Dict[str, Any]) -> int:
    adults = changes.get("passenger_count", reservation.passenger_count or 0) or 0
    children = changes.get("passenger_count_child", reservation.passenger_count_child or 0) or 0
    return int(adults) + int(children)


def _is_within_cutoff(
    reservation: Reservation,
    changes: Dict[str, Any],
    *,
    now: dt.datetime,
    edit_cutoff: dt.timedelta,
) -> bool:
    if not changes:
        return True

    transfer_dt = _resolve_transfer_datetime(reservation, changes)
    if not transfer_dt:
        return True

    # Ensure we compare aware datetimes.
    if timezone.is_naive(transfer_dt):
        transfer_dt = timezone.make_aware(transfer_dt, timezone.get_current_timezone())

    return transfer_dt >= now + edit_cutoff


def _resolve_transfer_datetime(reservation: Reservation, changes: Dict[str, Any]) -> dt.datetime | None:
    date_value = changes.get("transfer_date", reservation.transfer_date)
    time_value = changes.get("transfer_time", reservation.transfer_time)

    if not date_value or not time_value:
        return reservation.transfer_date_time

    return dt.datetime.combine(date_value, time_value)


def _normalize_value(value: Any) -> Any:
    if isinstance(value, dt.time):
        return value.strftime("%H:%M:%S")
    if isinstance(value, dt.date):
        return value.isoformat()
    if isinstance(value, dt.datetime):
        if timezone.is_naive(value):
            value = timezone.make_aware(value, timezone.get_current_timezone())
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value.quantize(Decimal("0.01")))
    return value


def _serialize_value(value: Any) -> Any:
    if isinstance(value, (dt.datetime, dt.date, dt.time)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    return value


def _serialize_key(key: str) -> str:
    return str(key)
