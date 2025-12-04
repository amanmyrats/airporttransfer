from types import SimpleNamespace
from unittest import mock

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class StripeWebhookTests(APITestCase):
    @mock.patch('payment.webhooks.get_provider')
    @mock.patch('payment.webhooks.sync_intent_from_provider')
    def test_webhook_invokes_sync(self, mock_sync, mock_get_provider):
        provider = mock.Mock()
        provider.webhook_is_valid.return_value = True
        provider.parse_webhook_event.return_value = SimpleNamespace(intent_id='pi_123', type='payment_intent.succeeded')
        mock_get_provider.return_value = provider

        url = reverse('payment:stripe-webhook')
        response = self.client.post(url, data='{}', content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_sync.assert_called_once_with(provider='stripe', provider_intent_id='pi_123')

    @mock.patch('payment.webhooks.get_provider')
    def test_invalid_signature_returns_400(self, mock_get_provider):
        provider = mock.Mock()
        provider.webhook_is_valid.return_value = False
        mock_get_provider.return_value = provider

        url = reverse('payment:stripe-webhook')
        response = self.client.post(url, data='{}', content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
