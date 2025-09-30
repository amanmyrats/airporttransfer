import os
from django.db.models.signals import pre_save, post_delete, post_save
from django.dispatch import receiver
from django.db import transaction

from .models import (
    BlogSection, SectionType, 
    BlogSectionTranslation, BlogImage, BlogPost,
    BlogPostTranslation, LANGUAGE_CHOICES
) 


def delete_file_if_exists(file_field):
    if file_field and hasattr(file_field, 'storage') and file_field.storage.exists(file_field.name):
        file_field.delete(save=False)


# === BlogSectionTranslation ===

@receiver(pre_save, sender=BlogSectionTranslation)
def auto_delete_old_og_image_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    if old.og_image and old.og_image != instance.og_image:
        delete_file_if_exists(old.og_image)

@receiver(post_delete, sender=BlogSectionTranslation)
def auto_delete_og_image_on_delete(sender, instance, **kwargs):
    delete_file_if_exists(instance.og_image)


# === BlogImage ===

@receiver(pre_save, sender=BlogImage)
def auto_delete_old_blog_image_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    if old.image and old.image != instance.image:
        delete_file_if_exists(old.image)
    # Delete image_small if image is changed
    if old.image_small and old.image != instance.image:
        delete_file_if_exists(old.image_small)

@receiver(post_delete, sender=BlogImage)
def auto_delete_blog_image_on_delete(sender, instance, **kwargs):
    delete_file_if_exists(instance.image)
    # Delete image_small if image is deleted
    delete_file_if_exists(instance.image_small)


# === BlogPost ===

@receiver(pre_save, sender=BlogPost)
def auto_delete_old_main_images_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    if old.main_image and old.main_image != instance.main_image:
        delete_file_if_exists(old.main_image)
    if old.main_image_small and old.main_image_small != instance.main_image_small:
        delete_file_if_exists(old.main_image_small)

@receiver(post_delete, sender=BlogPost)
def auto_delete_main_images_on_delete(sender, instance, **kwargs):
    delete_file_if_exists(instance.main_image)
    delete_file_if_exists(instance.main_image_small)


@receiver(post_save, sender=BlogPost)
def create_empty_translations(sender, instance: BlogPost, created, **kwargs):
    # if not created:
    #     return
    for code, _ in LANGUAGE_CHOICES:
        # Title/slug can be empty-ish; slug is auto-filled in save()
        BlogPostTranslation.objects.get_or_create(
            post=instance,
            language=code,
            defaults={
                'title': '',
                'short_description': '',
                'seo_title': '',
                'seo_description': '',
            }
        )

@receiver(post_save, sender=BlogPost)
def ensure_initial_section(sender, instance: BlogPost, created, **kwargs):
    if not created:
        return

    # Defer until the outer transaction commits to avoid partial writes
    def _create_initial_section():
        # Only create if truly none (idempotent)
        if not instance.sections.exists():
            BlogSection.objects.create(
                post=instance,
                order=0,                       # or 1 if you prefer
                section_type=SectionType.TEXT, # default first section type
            )

    transaction.on_commit(_create_initial_section)


@receiver(post_save, sender=BlogSection)
def ensure_section_translations(sender, instance: BlogSection, created, **kwargs):
    # if not created:
    #     return

    def _create_missing_translations():
        existing_langs = set(
            instance.translations.values_list('language', flat=True)
        )
        missing = [code for code, _ in LANGUAGE_CHOICES if code not in existing_langs]

        BlogSectionTranslation.objects.bulk_create([
            BlogSectionTranslation(
                section=instance,
                language=code,
                heading='',
                body='',
                alt_text='',
            )
            for code in missing
        ])

    transaction.on_commit(_create_missing_translations)