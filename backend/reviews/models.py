from __future__ import annotations

import uuid
from decimal import Decimal
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class ReviewStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PUBLISHED = "published", "Published"
    REJECTED = "rejected", "Rejected"


class ReviewQuerySet(models.QuerySet):
    def for_user(self, user_id: int) -> "ReviewQuerySet":
        return self.filter(user_id=user_id)

    def public(self) -> "ReviewQuerySet":
        return self.filter(is_public=True, status=ReviewStatus.PUBLISHED)

    def verified(self) -> "ReviewQuerySet":
        return self.filter(is_verified=True)


class Review(models.Model):
    reservation = models.OneToOneField(
        "transfer.Reservation",
        on_delete=models.CASCADE,
        related_name="review",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    # NOTE: The underlying Reservation currently stores route details denormalised.
    # We keep a nullable FK that can later point to transfer.Route once available.
    route = models.ForeignKey(
        "common.PopularRoute",
        on_delete=models.SET_NULL,
        related_name="reviews",
        null=True,
        blank=True,
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=120, blank=True, default="")
    comment = models.TextField(max_length=4000, blank=True, default="")
    is_public = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_flagged = models.BooleanField(default=False)
    status = models.CharField(
        max_length=16,
        choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ReviewQuerySet.as_manager()

    class Meta:
        ordering = ("-created_at",)
        unique_together = (("reservation", "user"),)
        indexes = [
            models.Index(fields=("route", "is_public", "status")),
            models.Index(fields=("created_at",)),
        ]

    def __str__(self) -> str:
        return f"Review(reservation={self.reservation_id}, rating={self.rating})"

    def mark_verified(self, verified: bool = True) -> None:
        if self.is_verified != verified:
            self.is_verified = verified
            self.updated_at = timezone.now()
            self.save(update_fields=["is_verified", "updated_at"])

    def sync_route_from_reservation(self) -> None:
        reservation = self.reservation
        route = getattr(reservation, "route", None)
        if route and self.route_id != getattr(route, "id", None):
            self.route = route
            self.save(update_fields=["route"])


class ReviewReply(models.Model):
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="review_replies",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"Reply(review={self.review_id}, author={self.author_id})"


class ReviewAggregate(models.Model):
    route = models.ForeignKey(
        "common.PopularRoute",
        on_delete=models.CASCADE,
        related_name="review_aggregates",
        null=True,
        blank=True,
    )
    vendor = models.CharField(max_length=64, null=True, blank=True)
    review_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal("0.00"))
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (("route", "vendor"),)
        indexes = [
            models.Index(fields=("route", "vendor")),
            models.Index(fields=("updated_at",)),
        ]

    def __str__(self) -> str:
        scope = self.route_id or self.vendor or "global"
        return f"Aggregate(scope={scope})"


class ReviewInvite(models.Model):
    reservation = models.OneToOneField(
        "transfer.Reservation",
        on_delete=models.CASCADE,
        related_name="review_invite",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="review_invites",
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_active = models.BooleanField(default=True)
    last_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=("is_active", "created_at")),
        ]

    def __str__(self) -> str:
        return f"ReviewInvite(reservation={self.reservation_id})"
