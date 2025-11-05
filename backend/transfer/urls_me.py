from django.urls import path

from .views import (
    MyReservationListAPIView,
    MyReservationDetailAPIView,
    MyReservationChangeRequestCollectionAPIView,
    MyReservationChangeRequestDetailAPIView,
    MyReservationChangeRequestCancelAPIView,
)

app_name = "transfer_me"

urlpatterns = [
    path(
        "reservations/",
        MyReservationListAPIView.as_view(),
        name="reservation-list",
    ),
    path(
        "reservations/<int:pk>/",
        MyReservationDetailAPIView.as_view(),
        name="reservation-detail",
    ),
    path(
        "reservations/<int:reservation_id>/change-requests/",
        MyReservationChangeRequestCollectionAPIView.as_view(),
        name="reservation-change-request-list",
    ),
    path(
        "change-requests/<int:pk>/",
        MyReservationChangeRequestDetailAPIView.as_view(),
        name="reservation-change-request-detail",
    ),
    path(
        "change-requests/<int:pk>/cancel/",
        MyReservationChangeRequestCancelAPIView.as_view(),
        name="reservation-change-request-cancel",
    ),
]
