from __future__ import annotations

from datetime import timedelta
from typing import Any

EDIT_WINDOW = timedelta(minutes=15)

# Allow current reservation flow (confirmed) while paving the way for an explicit
# completed state once it exists on the Reservation model.
COMPLETED_STATUSES = {"completed", "confirmed"}


def reservation_is_completed(reservation: Any) -> bool:
    status = getattr(reservation, "status", "") or ""
    return status.lower() in COMPLETED_STATUSES


def reservation_belongs_to_user(reservation: Any, user: Any) -> bool:
    owner = getattr(reservation, "owner", None)
    if owner and getattr(owner, "id", None) == getattr(user, "id", None):
        return True

    account = getattr(reservation, "account", None)
    if account and getattr(account, "id", None) == getattr(user, "id", None):
        return True

    profile = getattr(reservation, "customer_profile", None)
    if profile and getattr(profile, "user_id", None) == getattr(user, "id", None):
        return True

    passenger_email = (getattr(reservation, "passenger_email", None) or "").lower()
    user_email = (getattr(user, "email", None) or "").lower()
    if passenger_email and user_email and passenger_email == user_email:
        return True

    return False
