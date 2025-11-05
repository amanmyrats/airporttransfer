from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Account
from transfer.models import (
    Reservation,
    ReservationStatus,
    ReservationChangeRequestStatus,
)


class ReservationChangeRequestApiTests(APITestCase):
    def setUp(self) -> None:
        self.user = Account.objects.create_user(
            email="client@example.com",
            first_name="Client",
            password="testpass123",
            is_client=True,
        )
        self.admin = Account.objects.create_user(
            email="admin@example.com",
            first_name="Admin",
            password="testpass123",
            is_staff=True,
        )
        future = timezone.now() + timedelta(days=3)
        self.reservation = Reservation.objects.create(
            number="RES-2024-0001",
            status=ReservationStatus.CONFIRMED,
            passenger_email=self.user.email,
            pickup_short="Airport",
            dest_short="Hotel",
            transfer_date=future.date(),
            transfer_time=future.time().replace(microsecond=0),
        )

    def _create_change_request(self, payload: dict) -> dict:
        url = reverse(
            "transfer_me:reservation-change-request-list",
            kwargs={"reservation_id": self.reservation.id},
        )
        self.client.force_authenticate(self.user)
        response = self.client.post(url, payload, format="json")
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            msg=response.data if hasattr(response, "data") else response.content,
        )
        return response.data

    def test_user_can_retrieve_reservation_detail(self) -> None:
        url = reverse("transfer_me:reservation-detail", kwargs={"pk": self.reservation.id})
        self.client.force_authenticate(self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.reservation.id)

    def test_user_can_list_their_reservations(self) -> None:
        Reservation.objects.create(
            number="RES-2024-9999",
            status=ReservationStatus.CONFIRMED,
            passenger_email="someoneelse@example.com",
            pickup_short="Airport",
            dest_short="City Center",
        )

        url = reverse("transfer_me:reservation-list")
        self.client.force_authenticate(self.user)
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=response.data)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["id"], self.reservation.id)

    def test_reject_change_request_for_draft_reservation(self) -> None:
        draft_reservation = Reservation.objects.create(
            number="RES-2024-0002",
            status=ReservationStatus.DRAFT,
            passenger_email=self.user.email,
            pickup_short="Airport",
            dest_short="Hotel",
        )
        url = reverse(
            "transfer_me:reservation-change-request-list",
            kwargs={"reservation_id": draft_reservation.id},
        )
        self.client.force_authenticate(self.user)
        response = self.client.post(url, {"changes": {"note": "Update note"}}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("reservation", response.data)

    def test_user_can_create_manual_review_change_request(self) -> None:
        payload = {
            "reason_code": "more_passengers",
            "changes": {"passenger_count": 5, "passenger_count_child": 3},
        }
        data = self._create_change_request(payload)
        self.assertEqual(data["status"], ReservationChangeRequestStatus.PENDING_REVIEW)
        self.assertTrue(data["requires_manual_review"])

    def test_auto_approved_change_request_applies_immediately(self) -> None:
        payload = {
            "changes": {"passenger_count": 2},
        }
        url = reverse(
            "transfer_me:reservation-change-request-list",
            kwargs={"reservation_id": self.reservation.id},
        )
        self.client.force_authenticate(self.user)
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertEqual(data["status"], ReservationChangeRequestStatus.APPROVED_APPLIED)

        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.passenger_count, 2)

    def test_user_can_cancel_pending_change_request(self) -> None:
        payload = {
            "reason_code": "more_passengers",
            "changes": {"passenger_count": 5, "passenger_count_child": 2},
        }
        data = self._create_change_request(payload)
        cancel_url = reverse(
            "transfer_me:reservation-change-request-cancel",
            kwargs={"pk": data["id"]},
        )
        self.client.force_authenticate(self.user)
        response = self.client.post(cancel_url, {"reason": "No longer needed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], ReservationChangeRequestStatus.CANCELLED)

    def test_admin_can_approve_pending_change_request(self) -> None:
        payload = {
            "reason_code": "more_passengers",
            "changes": {"passenger_count": 5, "passenger_count_child": 2},
        }
        data = self._create_change_request(payload)

        approve_url = reverse(
            "transfer_admin:change-request-approve",
            kwargs={"pk": data["id"]},
        )
        self.client.force_authenticate(self.admin)
        response = self.client.post(approve_url, {"note": "All good"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK, msg=response.data)
        self.assertEqual(response.data["status"], ReservationChangeRequestStatus.APPROVED_APPLIED)

        self.reservation.refresh_from_db()
        self.assertEqual(self.reservation.passenger_count, 5)
        self.assertEqual(self.reservation.passenger_count_child, 2)
