from unittest import mock

from django.core import mail
from django.test import override_settings
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Account


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.verify_url = reverse('auth_email_verify')
        self.me_url = reverse('auth_me')
        self.refresh_url = reverse('token_refresh')
        self.logout_url = reverse('auth_logout')
        self.password_forgot_url = reverse('auth_password_forgot')
        self.password_reset_confirm_url = reverse('auth_password_reset_confirm')
        self.google_social_url = reverse('auth_social_google')
        self.apple_social_url = reverse('auth_social_apple')
        if hasattr(mail, 'outbox'):
            mail.outbox.clear()

    def _register_user(self, email='test@example.com', password='Secret123!', first_name='Test'):
        response = self.client.post(
            self.register_url,
            {
                'email': email,
                'password': password,
                'first_name': first_name,
                'preferred_language': 'en',
                'marketing_opt_in': True,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = Account.objects.get(email=email)
        return user

    def _extract_token_from_email(self, subject_keyword):
        message = next((m for m in mail.outbox if subject_keyword in m.subject), None)
        self.assertIsNotNone(message, f'Email with subject containing {subject_keyword} not found')
        for line in message.body.splitlines():
            if line.startswith('TOKEN:'):
                return line.split('TOKEN:')[1].strip()
        return None

    def _extract_reset_payload(self):
        message = next((m for m in mail.outbox if 'Password reset request' in m.subject), None)
        self.assertIsNotNone(message, 'Password reset email not found')
        uid = token = None
        for line in message.body.splitlines():
            if line.startswith('UID:'):
                uid = line.split('UID:')[1].strip()
            if line.startswith('TOKEN:'):
                token = line.split('TOKEN:')[1].strip()
        return uid, token

    def test_register_sends_verification_email(self):
        user = self._register_user()
        self.assertFalse(user.is_active)
        self.assertEqual(len(mail.outbox), 1)
        token = self._extract_token_from_email('Verify your email')
        self.assertIsNotNone(token)

    def test_login_requires_email_verification(self):
        self._register_user()
        login_response = self.client.post(
            self.login_url,
            {'email': 'test@example.com', 'password': 'Secret123!'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_401_UNAUTHORIZED)
        token = self._extract_token_from_email('Verify your email')
        verify_response = self.client.post(self.verify_url, {'key': token}, format='json')
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        login_response = self.client.post(
            self.login_url,
            {'email': 'test@example.com', 'password': 'Secret123!'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)

    def test_refresh_and_blacklist_flow(self):
        self._register_user()
        token = self._extract_token_from_email('Verify your email')
        self.client.post(self.verify_url, {'key': token}, format='json')
        login_response = self.client.post(
            self.login_url,
            {'email': 'test@example.com', 'password': 'Secret123!'},
            format='json',
        )
        refresh = login_response.data['refresh']
        access = login_response.data['access']
        refresh_response = self.client.post(self.refresh_url, {'refresh': refresh}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        logout_response = self.client.post(self.logout_url, {'refresh': refresh}, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        reused_refresh_response = self.client.post(self.refresh_url, {'refresh': refresh}, format='json')
        self.assertEqual(reused_refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_password_reset_flow(self):
        self._register_user()
        token = self._extract_token_from_email('Verify your email')
        self.client.post(self.verify_url, {'key': token}, format='json')
        forgot_response = self.client.post(self.password_forgot_url, {'email': 'test@example.com'}, format='json')
        self.assertEqual(forgot_response.status_code, status.HTTP_200_OK)
        uid, reset_token = self._extract_reset_payload()
        reset_response = self.client.post(
            self.password_reset_confirm_url,
            {'uid': uid, 'token': reset_token, 'new_password': 'NewSecret123!'},
            format='json',
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        login_response = self.client.post(
            self.login_url,
            {'email': 'test@example.com', 'password': 'NewSecret123!'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    @override_settings(SOCIAL_GOOGLE_CLIENT_ID='google-client-id')
    def test_social_login_google(self):
        payload = {
            'email': 'google@example.com',
            'sub': 'google-sub',
            'given_name': 'Google',
            'family_name': 'User',
            'iss': 'accounts.google.com',
            'aud': 'google-client-id',
        }
        with mock.patch('authentication.serializers.verify_google_id_token', return_value=payload):
            response = self.client.post(self.google_social_url, {'id_token': 'fake'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        user = Account.objects.get(email='google@example.com')
        self.assertTrue(user.is_client)
        self.assertTrue(user.is_active)

    @override_settings(SOCIAL_APPLE_CLIENT_ID='apple-client-id')
    def test_social_login_apple(self):
        payload = {
            'email': 'apple@example.com',
            'sub': 'apple-sub',
            'iss': 'https://appleid.apple.com',
            'aud': 'apple-client-id',
        }
        with mock.patch('authentication.serializers.verify_apple_identity_token', return_value=payload):
            response = self.client.post(self.apple_social_url, {'identity_token': 'fake'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = Account.objects.get(email='apple@example.com')
        self.assertTrue(user.is_client)
        self.assertTrue(user.is_active)

    @override_settings(
        REST_FRAMEWORK={
            'DEFAULT_AUTHENTICATION_CLASSES': (
                'rest_framework_simplejwt.authentication.JWTAuthentication',
            ),
            'DEFAULT_PERMISSION_CLASSES': (
                'rest_framework.permissions.AllowAny',
            ),
            'DEFAULT_THROTTLE_CLASSES': (
                'authentication.throttles.AuthBurstRateThrottle',
            ),
            'DEFAULT_THROTTLE_RATES': {
                'auth_burst': '2/min',
            },
        }
    )
    def test_auth_throttle(self):
        for idx in range(2):
            email = f'user{idx}@example.com'
            self.client.post(
                self.register_url,
                {
                    'email': email,
                    'password': 'Secret123!',
                    'first_name': 'User',
                    'preferred_language': 'en',
                    'marketing_opt_in': False,
                },
                format='json',
            )
        response = self.client.post(
            self.register_url,
            {
                'email': 'user-final@example.com',
                'password': 'Secret123!',
                'first_name': 'User',
                'preferred_language': 'en',
                'marketing_opt_in': False,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
