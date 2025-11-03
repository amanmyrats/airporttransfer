from __future__ import annotations

from typing import Any

from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed, PermissionDenied, ValidationError
from rest_framework.permissions import IsAdminUser, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from blog.mixins import PublicReadMixin
from .models import Review, ReviewReply, ReviewStatus
from .serializers import (
    MyReviewSerializer,
    PublicReviewSerializer,
    ReviewModelSerializer,
    ReviewReplySerializer,
)
from .utils import EDIT_WINDOW, reservation_belongs_to_user, reservation_is_completed


class MyReviewsViewSet(viewsets.ModelViewSet):
    serializer_class = MyReviewSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]
    ordering_fields = ("created_at", "rating", "updated_at")
    ordering = ("-created_at",)

    def get_queryset(self):
        return (
            Review.objects.select_related("reservation", "route")
            .filter(user=self.request.user)
            .order_by("-created_at")
        )

    def perform_create(self, serializer: MyReviewSerializer) -> None:
        reservation = serializer.validated_data["reservation"]
        if not reservation_belongs_to_user(reservation, self.request.user):
            raise PermissionDenied(_("You can only review your own reservations."))

        if not reservation_is_completed(reservation):
            raise ValidationError({"reservation": _("Reservation is not yet completed.")})

        if Review.objects.filter(reservation=reservation).exists():
            raise ValidationError({"reservation": _("This reservation already has a review.")})

        route = getattr(reservation, "route", None)
        serializer.save(
            user=self.request.user,
            route=route,
            is_verified=reservation_is_completed(reservation),
        )

    def create(self, request, *args, **kwargs):
        if "reservation" not in request.data:
            raise ValidationError({"reservation": _("Reservation is required.")})
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed("PUT")

    def partial_update(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user_id != request.user.id:
            raise PermissionDenied(_("You can only update your own review."))

        if timezone.now() - review.created_at > EDIT_WINDOW:
            raise ValidationError({"detail": _("You can only edit within 15 minutes of creation.")})

        allowed_fields = {"rating", "title", "comment"}
        unexpected = {key for key in request.data.keys() if key not in allowed_fields}
        if unexpected:
            raise ValidationError({"detail": _("Only rating, title, and comment can be updated.")})

        return super().partial_update(request, *args, **kwargs)


class PublicReviewsViewSet(PublicReadMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = PublicReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    http_method_names = ["get", "head", "options"]
    search_fields = ("title", "comment")
    ordering_fields = ("created_at", "rating")
    ordering = ("-created_at",)

    def get_queryset(self):
        queryset = (
            Review.objects.public()
            .select_related("reservation", "route", "user")
            .order_by("-created_at")
        )

        params = self.request.query_params
        route_id = params.get("route")
        if route_id:
            queryset = queryset.filter(route_id=route_id)

        reservation_number = params.get("reservation_number")
        if reservation_number:
            queryset = queryset.filter(reservation__number=reservation_number)

        min_rating = params.get("min_rating")
        if min_rating:
            try:
                queryset = queryset.filter(rating__gte=int(min_rating))
            except ValueError:
                raise ValidationError({"min_rating": _("Invalid rating filter.")})

        status_code = params.get("status")
        if status_code:
            queryset = queryset.filter(status=status_code)

        return queryset


class ReviewAdminViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewModelSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Review.objects.select_related("reservation", "user", "route").all()
    filterset_fields = ("status", "is_public", "is_flagged", "rating", "route")
    search_fields = ("title", "comment", "reservation__number", "user__email")
    ordering_fields = ("created_at", "rating", "updated_at")
    ordering = ("-created_at",)

    def perform_create(self, serializer: ReviewModelSerializer) -> None:
        reservation = serializer.validated_data.get("reservation")
        route = serializer.validated_data.get("route") or getattr(reservation, "route", None)
        serializer.save(route=route)

    def perform_update(self, serializer: ReviewModelSerializer) -> None:
        reservation = serializer.validated_data.get("reservation") or serializer.instance.reservation
        route = serializer.validated_data.get("route") or getattr(reservation, "route", None)
        serializer.save(route=route)

    def _moderate(self, review: Review, **changes: Any) -> Response:
        for field, value in changes.items():
            setattr(review, field, value)
        review.updated_at = timezone.now()
        review.save(update_fields=[*changes.keys(), "updated_at"])
        serializer = self.get_serializer(review)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        review = self.get_object()
        return self._moderate(
            review,
            status=ReviewStatus.PUBLISHED,
            is_public=True,
            is_flagged=False,
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        review = self.get_object()
        return self._moderate(
            review,
            status=ReviewStatus.REJECTED,
            is_public=False,
        )

    @action(detail=True, methods=["post"])
    def flag(self, request, pk=None):
        review = self.get_object()
        return self._moderate(review, is_flagged=True)

    @action(detail=True, methods=["post"])
    def unflag(self, request, pk=None):
        review = self.get_object()
        return self._moderate(review, is_flagged=False)


class ReviewReplyViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewReplySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = ReviewReply.objects.select_related("review", "author").all()
    ordering = ("created_at",)

    def perform_create(self, serializer: ReviewReplySerializer) -> None:
        if not self.request.user.is_staff:
            raise PermissionDenied(_("Only staff can reply to reviews."))
        serializer.save(author=self.request.user)

    def perform_update(self, serializer: ReviewReplySerializer) -> None:
        if not self.request.user.is_staff:
            raise PermissionDenied(_("Only staff can update replies."))
        serializer.save()
