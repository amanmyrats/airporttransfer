from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Account, CustomerProfile


@receiver(pre_save, sender=Account)
def sync_role_flags(sender, instance: Account, **kwargs):
    if instance.role == 'client':
        instance.is_client = True
        instance.is_company_user = False
    elif instance.role and instance.role.startswith('company_'):
        instance.is_client = False
        instance.is_company_user = True
    else:
        instance.is_client = False
        instance.is_company_user = False


@receiver(post_save, sender=Account)
def create_profile_for_account(sender, instance: Account, created, **kwargs):
    if created:
        CustomerProfile.objects.get_or_create(user=instance)
