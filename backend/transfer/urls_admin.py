from django.urls import path

from .views import (
    AdminReservationChangeRequestListAPIView,
    AdminReservationChangeRequestApproveAPIView,
    AdminReservationChangeRequestDeclineAPIView,
)

app_name = "transfer_admin"

urlpatterns = [
    path(
        "change-requests/",
        AdminReservationChangeRequestListAPIView.as_view(),
        name="change-request-list",
    ),
    path(
        "change-requests/<int:pk>/approve/",
        AdminReservationChangeRequestApproveAPIView.as_view(),
        name="change-request-approve",
    ),
    path(
        "change-requests/<int:pk>/decline/",
        AdminReservationChangeRequestDeclineAPIView.as_view(),
        name="change-request-decline",
    ),
]
