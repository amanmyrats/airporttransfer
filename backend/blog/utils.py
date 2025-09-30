import os
import unicodedata
import re
from datetime import datetime

from django.db import models, IntegrityError, transaction
from django.conf import settings
from django.utils.text import slugify as dj_slugify


def blog_main_image_upload_to(instance, filename):
    # print('inside blog_main_image_upload_to')
    # print(f"instance: {instance}")
    # print(f"filename: {filename}")
    return _resolve_upload_path(instance, filename, subfolder='blog/covers', fallback_title="vip airport transfer antalya")

def blog_main_thumbnail_upload_to(instance, filename):
    return _resolve_upload_path(instance, filename, subfolder='blog/covers/thumbnails')

def blog_og_image_upload_to(instance, filename):
    return _resolve_upload_path(instance, filename, subfolder='blog/og_images')

def blog_image_upload_to(instance, filename):
    return _resolve_upload_path(instance, filename, subfolder='blog/images')

def blog_image_small_upload_to(instance, filename):
    return _resolve_upload_path(instance, f"small_{filename}", subfolder='blog/images')

def slugify_filename(value):
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)


def _resolve_upload_path(instance, filename, subfolder: str, fallback_title: str = "vip airport transfer antalya"):
    # print('inside _resolve_upload_path')
    # print(f"instance: {instance}")
    # print(f"filename: {filename}")
    base_dir = "airporttransfer/media"
    if settings.DEBUG:
        base_dir = f"dev/{base_dir}"

    ext = filename.split('.')[-1]
    base_name = None
    # print(f'base_dir: {base_dir}, subfolder: {subfolder}, ext: {ext}')

    for attr in ['heading', 'title', 'name']:
        val = getattr(instance, attr, None)
        if val:
            base_name = slugify_filename(str(val))
            break

    if not base_name:
        try:
            if hasattr(instance, 'section') and instance.section.post.category.name:
                base_name = slugify_filename(instance.section.post.category.name)
        except Exception:
            pass

    if not base_name:
        base_name = slugify_filename(fallback_title)

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    filename = f"{base_name}-{timestamp}.{ext}"
    # print(f"Final filename: {filename}")
    # print(f"Final path: {os.path.join(base_dir, subfolder, filename)}")
    from django.core.files.storage import default_storage
    # print(f"default storage: {default_storage.__class__}")
    # print(f"default storage location: {default_storage.location}")
    return os.path.join(base_dir, subfolder, filename)

def slugify_by_language(text: str, lang: str) -> str:
    policy = getattr(settings, "BLOG_SLUG_POLICY", {})
    default_policy = getattr(settings, "BLOG_SLUG_DEFAULT_POLICY", "latin")
    mode = (policy.get(lang) or default_policy).lower()
    allow_unicode = (mode == "unicode")
    # Django will latinize when allow_unicode=False; keep native if True
    return dj_slugify(text or "", allow_unicode=allow_unicode)


def generate_unique_slug(instance, source_value: str, *, field_name: str = "slug") -> str:
    """
    Build a unique slug for `instance` from `source_value`, trimming to the DB max length
    and appending -2, -3, ... if needed.
    """
    slug_field = instance._meta.get_field(field_name)
    max_len = getattr(slug_field, "max_length", 150) or 150

    base = dj_slugify(source_value or "") or "item"
    base = base[:max_len]
    Model = instance.__class__

    # Exclude self on update
    qs = Model.objects.all()
    if instance.pk:
        qs = qs.exclude(pk=instance.pk)

    # First try without suffix
    if not qs.filter(**{field_name: base}).exists():
        return base

    # Add numeric suffixes
    i = 2
    while True:
        suffix = f"-{i}"
        candidate = f"{base[:max_len - len(suffix)]}{suffix}"
        if not qs.filter(**{field_name: candidate}).exists():
            return candidate
        i += 1