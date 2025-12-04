from unittest import mock

from django.test import SimpleTestCase, override_settings

from payment.providers import get_provider


class ProviderRegistryTests(SimpleTestCase):
    def tearDown(self):
        get_provider.cache_clear()

    @override_settings(PAYMENT_STRIPE_SECRET_KEY='sk_test', PAYMENT_STRIPE_WEBHOOK_SECRET='whsec_test')
    @mock.patch('payment.providers.stripe_provider.StripeProvider')
    def test_get_provider_returns_singleton(self, mock_provider):
        instance = mock_provider.return_value
        provider = get_provider('stripe')
        self.assertIs(provider, instance)
        again = get_provider('stripe')
        self.assertIs(again, instance)
        mock_provider.assert_called_once_with(api_key='sk_test', webhook_secret='whsec_test')

    def test_unsupported_provider_raises(self):
        with self.assertRaises(ValueError):
            get_provider('unknown')

