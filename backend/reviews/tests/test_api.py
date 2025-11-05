from __future__ import annotations

from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Account
from common.models import PopularRoute
from reviews.models import Review, ReviewStatus
from transfer.models import Reservation


class ReviewApiTests(APITestCase):
    def setUp(self) -> None:
        self.user = Account.objects.create_user(
            email="user@example.com",
            first_name="Test",
            password="testpass123",
            is_client=True,
        )
        self.staff = Account.objects.create_user(
            email="staff@example.com",
            first_name="Staff",
            password="testpass123",
            is_staff=True,
        )
        self.route = PopularRoute.objects.create(
            main_location="IST",
            destination="Hotel",
            car_type="VITO",
            euro_price=100,
        )
        self.reservation = self._create_reservation(number="RES-1001", status="confirmed")

    def _create_reservation(self, number: str, status: str = "confirmed", email: str | None = None) -> Reservation:
        email = email or self.user.email
        return Reservation.objects.create(
            number=number,
            status=status,
            passenger_email=email,
            passenger_name="Tester",
            pickup_short="IST",
            dest_short="Hotel",
        )

    def test_create_review_happy_path(self) -> None:
        self.client.force_authenticate(self.user)
        url = reverse("reviews:my-reviews-list")
        payload = {
            "reservation": self.reservation.id,
            "rating": 5,
            "title": "Great ride",
            "comment": "Driver was on time.",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        review = Review.objects.get(reservation=self.reservation)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.user_id, self.user.id)
        self.assertTrue(review.is_verified)
        self.assertEqual(review.status, ReviewStatus.PENDING)

    def test_prevent_multiple_reviews_for_same_reservation(self) -> None:
        Review.objects.create(
            reservation=self.reservation,
            user=self.user,
            rating=5,
            title="Existing",
            comment="Already reviewed",
        )
        self.client.force_authenticate(self.user)
        url = reverse("reviews:my-reviews-list")
        payload = {
            "reservation": self.reservation.id,
            "rating": 4,
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("reservation", response.data)

    def test_prevent_create_on_non_completed_reservation(self) -> None:
        pending_reservation = self._create_reservation(number="RES-2001", status="draft")
        self.client.force_authenticate(self.user)
        url = reverse("reviews:my-reviews-list")
        payload = {
            "reservation": pending_reservation.id,
            "rating": 5,
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_edit_window_allows_update_within_15_minutes(self) -> None:
        review = Review.objects.create(
            reservation=self.reservation,
            user=self.user,
            rating=5,
        )
        self.client.force_authenticate(self.user)
        url = reverse("reviews:my-reviews-detail", kwargs={"pk": review.pk})
        response = self.client.patch(url, {"rating": 4}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.content)
        review.refresh_from_db()
        self.assertEqual(review.rating, 4)

    def test_edit_window_blocks_updates_after_15_minutes(self) -> None:
        review = Review.objects.create(
            reservation=self.reservation,
            user=self.user,
            rating=5,
        )
        Review.objects.filter(pk=review.pk).update(
            created_at=timezone.now() - timedelta(minutes=16)
        )
        self.client.force_authenticate(self.user)
        url = reverse("reviews:my-reviews-detail", kwargs={"pk": review.pk})
        response = self.client.patch(url, {"rating": 4}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_public_listing_filters_and_ordering(self) -> None:
        reservation_one = self._create_reservation(number="RES-3001")
        reservation_two = self._create_reservation(number="RES-3002")
        Review.objects.create(
            reservation=reservation_one,
            user=self.user,
            rating=5,
            status=ReviewStatus.PUBLISHED,
            is_public=True,
            route=self.route,
            title="Amazing",
        )
        Review.objects.create(
            reservation=reservation_two,
            user=self.user,
            rating=3,
            status=ReviewStatus.PENDING,
            is_public=False,
        )

        url = reverse("reviews:public-review-list")
        response = self.client.get(url, {"route": self.route.id, "min_rating": 4})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["rating"], 5)

    def test_staff_moderation_transitions(self) -> None:
        review = Review.objects.create(
            reservation=self.reservation,
            user=self.user,
            rating=4,
        )
        self.client.force_authenticate(self.staff)

        publish_url = reverse("reviews:review-publish", kwargs={"pk": review.pk})
        response = self.client.post(publish_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.status, ReviewStatus.PUBLISHED)
        self.assertTrue(review.is_public)

        flag_url = reverse("reviews:review-flag", kwargs={"pk": review.pk})
        response = self.client.post(flag_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertTrue(review.is_flagged)

        reject_url = reverse("reviews:review-reject", kwargs={"pk": review.pk})
        response = self.client.post(reject_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.status, ReviewStatus.REJECTED)
        self.assertFalse(review.is_public)
