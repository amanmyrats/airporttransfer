from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from transfer.models import Reservation

from .models import Review, ReviewInvite
from .utils import reservation_is_completed


@receiver(post_save, sender=Reservation)
def ensure_review_invite(sender, instance: Reservation, created: bool, **kwargs: Any) -> None:
    """
    Create or refresh a review invite once a reservation is completed.
    """

    def _handle() -> None:
        if not reservation_is_completed(instance):
            return

        owner = getattr(instance, "owner", None)
        user_id = getattr(owner, "id", None)
        if not user_id:
            passenger_email = getattr(instance, "passenger_email", None)
            if passenger_email:
                account = get_user_model().objects.filter(email__iexact=passenger_email).first()
                user_id = getattr(account, "id", None)

        invite, created_invite = ReviewInvite.objects.get_or_create(
            reservation=instance,
            defaults={"user_id": user_id},
        )
        if not created_invite and user_id and invite.user_id != user_id:
            invite.user_id = user_id
            invite.save(update_fields=["user", "updated_at"])

        review = getattr(instance, "review", None)
        if isinstance(review, Review) and not review.is_verified:
            review.mark_verified(True)

    transaction.on_commit(_handle)
