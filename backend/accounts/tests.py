from django.test import TestCase

from .models import Account, CustomerProfile


class AccountSignalsTests(TestCase):
    def test_client_role_sets_flags(self):
        user = Account.objects.create_user(
            email='client@example.com',
            first_name='Client',
            password='pass12345',
            role='client',
        )
        self.assertTrue(user.is_client)
        self.assertFalse(user.is_company_user)

    def test_company_role_sets_flags(self):
        user = Account.objects.create_user(
            email='admin@example.com',
            first_name='Admin',
            password='pass12345',
            role='company_admin',
        )
        self.assertTrue(user.is_company_user)
        self.assertFalse(user.is_client)

    def test_customer_profile_created(self):
        user = Account.objects.create_user(
            email='profile@example.com',
            first_name='Profile',
            password='pass12345',
            role='client',
        )
        self.assertTrue(CustomerProfile.objects.filter(user=user).exists())
