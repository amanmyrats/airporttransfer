from django.urls import path

from .views import (
    MyReservationListAPIView,
    MyReservationDuePaymentListAPIView,
    MyReservationMissingPassengerListAPIView,
    MyReservationPassengersAPIView,
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
        "reservations/due-payments/",
        MyReservationDuePaymentListAPIView.as_view(),
        name="reservation-due-payments",
    ),
    path(
        "reservations/missing-passengers/",
        MyReservationMissingPassengerListAPIView.as_view(),
        name="reservation-missing-passengers",
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
        "reservations/<int:reservation_id>/passengers/",
        MyReservationPassengersAPIView.as_view(),
        name="reservation-passenger-list",
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
