from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    MyReviewsViewSet,
    PublicReviewsViewSet,
    ReviewAdminViewSet,
    ReviewReplyViewSet,
)

app_name = "reviews"

router = DefaultRouter()
router.register(r"me/reviews", MyReviewsViewSet, basename="my-reviews")
router.register(r"reviews", ReviewAdminViewSet, basename="review")
router.register(r"public/reviews", PublicReviewsViewSet, basename="public-review")
router.register(r"review-replies", ReviewReplyViewSet, basename="review-reply")

urlpatterns = [
    path("", include(router.urls)),
]

