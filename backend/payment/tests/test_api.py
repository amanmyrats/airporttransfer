import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Account
from payment.models import PaymentIntent
from transfer.models import Reservation


@override_settings(DEFAULT_FILE_STORAGE='django.core.files.storage.FileSystemStorage')
class PaymentApiTests(APITestCase):
    def setUp(self):
        self.temp_media = tempfile.mkdtemp()
        self.media_override = override_settings(MEDIA_ROOT=self.temp_media)
        self.media_override.enable()
        self.client_user = Account.objects.create_user('client@example.com', 'Client', password='testpass', is_client=True)
        self.staff_user = Account.objects.create_user('staff@example.com', 'Staff', password='testpass', is_staff=True)
        self.reservation = Reservation.objects.create(
            number='RES-API-1',
            amount=120,
            currency_code='EUR',
            passenger_name='API Tester',
            passenger_email='api@example.com',
            pickup_full='IST Airport',
            dest_full='Hotel',
        )

    def tearDown(self):
        self.media_override.disable()
        shutil.rmtree(self.temp_media, ignore_errors=True)

    def test_offline_payment_flow(self):
        self.client.force_authenticate(user=self.client_user)
        create_url = reverse('payment:intent-create')
        payload = {
            'booking_ref': self.reservation.number,
            'amount_minor': 12000,
            'currency': 'EUR',
            'method': 'BANK_TRANSFER',
            'customer': {
                'email': 'api@example.com',
                'name': 'API Tester',
            },
            'idempotency_key': 'RES-API-1-EUR-12000',
        }
        response = self.client.post(create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        public_id = response.data['public_id']

        detail_url = reverse('payment:intent-detail', kwargs={'public_id': public_id})
        detail_response = self.client.get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data['method'], 'BANK_TRANSFER')

        # upload offline receipt
        receipt_url = reverse('payment:intent-offline-receipt', kwargs={'public_id': public_id})
        fake_file = SimpleUploadedFile('receipt.pdf', b'%PDF-1.4', content_type='application/pdf')
        upload_response = self.client.post(receipt_url, {'evidence_file': fake_file}, format='multipart')
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)

        # staff settlement
        self.client.force_authenticate(user=self.staff_user)
        settle_url = reverse('payment:intent-offline-settle', kwargs={'public_id': public_id})
        settle_response = self.client.post(settle_url, {'amount_minor': 12000}, format='json')
        self.assertEqual(settle_response.status_code, status.HTTP_200_OK)

        intent = PaymentIntent.objects.get(public_id=public_id)
        self.assertEqual(intent.status, 'succeeded')

    def test_list_payment_methods(self):
        methods_url = reverse('payment:methods')
        response = self.client.get(methods_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
