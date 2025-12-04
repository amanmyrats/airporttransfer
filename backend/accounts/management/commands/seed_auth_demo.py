from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import CustomerProfile


class Command(BaseCommand):
    help = 'Create or update a demo client user for authentication flows.'

    def add_arguments(self, parser):
        parser.add_argument('--email', default='demo.client@example.com')
        parser.add_argument('--password', default='DemoClient123!')
        parser.add_argument('--first-name', dest='first_name', default='Demo')
        parser.add_argument('--last-name', dest='last_name', default='User')
        parser.add_argument('--preferred-language', dest='preferred_language', default='en')
        parser.add_argument('--marketing-opt-in', action='store_true', dest='marketing_opt_in', default=False)
        parser.add_argument('--force-reset-password', action='store_true', dest='force_reset_password', default=False)

    def handle(self, *args, **options):
        user_model = get_user_model()
        email = user_model.objects.normalize_email(options['email'])
        defaults = {
            'first_name': options['first_name'],
            'last_name': options['last_name'],
            'role': 'client',
            'is_active': True,
        }
        user, created = user_model.objects.get_or_create(email=email, defaults=defaults)

        updated_fields = []
        if created or options['force_reset_password']:
            user.set_password(options['password'])
            updated_fields.append('password')
        if not created:
            for field in ('first_name', 'last_name'):
                value = defaults[field]
                if value and getattr(user, field) != value:
                    setattr(user, field, value)
                    updated_fields.append(field)
            if not user.is_active:
                user.is_active = True
                updated_fields.append('is_active')
            if user.role != 'client':
                user.role = 'client'
                updated_fields.append('role')
        if updated_fields:
            user.save(update_fields=list(set(updated_fields)))

        try:
            profile = user.customer_profile
        except CustomerProfile.DoesNotExist:
            profile = CustomerProfile.objects.create(user=user)
        profile.preferred_language = options['preferred_language']
        profile.marketing_opt_in = options['marketing_opt_in']
        profile.save(update_fields=['preferred_language', 'marketing_opt_in', 'updated_at'])

        if created:
            self.stdout.write(self.style.SUCCESS(f'Demo client {email} created.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Demo client {email} updated.'))
