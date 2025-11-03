from __future__ import annotations

from typing import Any, Dict

from rest_framework import serializers

from .models import Review, ReviewReply, ReviewStatus


def _reservation_summary(reservation: Any) -> Dict[str, Any]:
    if not reservation:
        return {}

    return {
        "id": getattr(reservation, "id", None),
        "number": getattr(reservation, "number", None),
        "pickup": getattr(reservation, "pickup_short", None) or getattr(reservation, "pickup_full", None),
        "destination": getattr(reservation, "dest_short", None) or getattr(reservation, "dest_full", None),
        "status": getattr(reservation, "status", None),
        "transfer_date": getattr(reservation, "transfer_date", None),
    }


class BaseReviewSerializer(serializers.ModelSerializer):
    reservation_obj = serializers.SerializerMethodField()
    reservation_id = serializers.IntegerField(source="reservation.pk", read_only=True)
    route_id = serializers.IntegerField(source="route.pk", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "reservation",
            "reservation_id",
            "reservation_obj",
            "route",
            "route_id",
            "rating",
            "title",
            "comment",
            "is_public",
            "is_verified",
            "is_flagged",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("reservation_obj", "reservation_id", "route_id", "created_at", "updated_at")

    def get_reservation_obj(self, obj: Review) -> Dict[str, Any]:
        return _reservation_summary(getattr(obj, "reservation", None))


class ReviewModelSerializer(BaseReviewSerializer):
    class Meta(BaseReviewSerializer.Meta):
        read_only_fields = BaseReviewSerializer.Meta.read_only_fields

    def validate_rating(self, value: int) -> int:
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class MyReviewSerializer(BaseReviewSerializer):
    class Meta(BaseReviewSerializer.Meta):
        fields = (
            "id",
            "reservation",
            "reservation_id",
            "reservation_obj",
            "route_id",
            "rating",
            "title",
            "comment",
            "status",
            "is_verified",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "reservation_id",
            "reservation_obj",
            "route_id",
            "status",
            "is_verified",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "reservation": {"write_only": True},
        }

    def validate_rating(self, value: int) -> int:
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        reservation = attrs.get("reservation") or getattr(self.instance, "reservation", None)
        if reservation is None and not self.instance:
            raise serializers.ValidationError({"reservation": "Reservation is required."})
        return super().validate(attrs)


class PublicReviewSerializer(BaseReviewSerializer):
    author_display = serializers.SerializerMethodField()

    class Meta(BaseReviewSerializer.Meta):
        fields = (
            "id",
            "rating",
            "title",
            "comment",
            "reservation_obj",
            "route_id",
            "author_display",
            "created_at",
            "is_verified",
        )
        read_only_fields = fields

    def get_author_display(self, obj: Review) -> str:
        user = getattr(obj, "user", None)
        if not user:
            return ""
        first_name = getattr(user, "first_name", "") or ""
        last_initial = (getattr(user, "last_name", "") or "")[:1]
        first_initial = first_name[:1]
        if first_initial and last_initial:
            return f"{first_initial}. {last_initial}."
        if first_initial:
            return f"{first_initial}."
        return "Guest"


class ReviewReplySerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = ReviewReply
        fields = (
            "id",
            "review",
            "author",
            "author_name",
            "body",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("author", "author_name", "created_at", "updated_at")

    def get_author_name(self, obj: ReviewReply) -> str:
        user = getattr(obj, "author", None)
        if not user:
            return ""
        first = getattr(user, "first_name", "") or ""
        last = getattr(user, "last_name", "") or ""
        return (first + " " + last).strip() or user.email
