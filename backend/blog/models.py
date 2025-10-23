from django.db import models
from django.urls import reverse
from django.db.models import UniqueConstraint
from django.utils.text import slugify
from typing import Optional
from django.db import models, IntegrityError, transaction
from uuid import uuid4


from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.base import ContentFile
from datetime import datetime
import os

from .utils import (
    blog_main_image_upload_to,
    blog_main_thumbnail_upload_to,
    blog_og_image_upload_to,
    blog_image_upload_to, 
    blog_image_small_upload_to, 
    slugify_filename, 
    slugify_by_language, 
    generate_unique_slug, 
)
from .managers import BlogPostQuerySet


LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('de', 'Deutsch'),
    ('ru', 'Russian'),
    ('tr', 'Turkish'),
]


def _trim_slug_to_length(s: str, max_len: int, reserve: int = 0) -> str:
    """
    Trim slug `s` to fit into `max_len`, reserving `reserve` chars
    for a suffix like '-2' or '-25'. Keeps it clean (no trailing '-').
    """
    limit = max_len - max(reserve, 0)
    s = (s or '')[:max(1, limit)].rstrip('-')
    return s or 'post'

class SectionType(models.TextChoices):
    TEXT = 'text', 'Text Only'
    IMAGE = 'image', 'Image'
    GALLERY = 'gallery', 'Gallery'
    FAQ = 'faq', 'FAQ Section'
    BOOKING = 'booking_form', 'Booking Form Embed'
    CTA_BANNER = 'cta_banner', 'Call-to-Action Banner'
    MAP = 'map', 'Map / Location'
    VIDEO = 'video', 'Video Embed'
    FEATURES = 'features', 'Features List'
    QUOTE = 'quote', 'Quote / Testimonial'
    STEPS = 'steps', 'Step-by-Step Guide'
    TABLE = 'table', 'Table / Price List'
    DOWNLOAD = 'download', 'Downloadable Content'


class BlogPost(models.Model):
    objects = BlogPostQuerySet.as_manager()

    internal_title = models.CharField(
        max_length=255,
        help_text="Internal reference name, not shown publicly"
    )
    slug = models.SlugField(max_length=150)
    slug_locked = models.BooleanField(
        default=False,
        help_text="If True, slug will not be auto-generated and must be set manually"
    )

    category = models.ForeignKey('BlogCategory', on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField("BlogTag", blank=True)

    main_image = models.ImageField(
        upload_to=blog_main_image_upload_to,
        null=True,
        blank=True
    )
    main_image_small = models.ImageField(
        upload_to=blog_main_thumbnail_upload_to,
        null=True, blank=True
    )
    views_count = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    priority = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    is_translated_fully = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    author = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.internal_title or f"Post {self.pk}"
    
    def save(self, *args, **kwargs):
        # Auto-generate slug if not locked and not set
        if not self.slug_locked and (not self.slug or not self.is_published):
            base = (self.internal_title or f"post-{self.pk}").strip()
            candidate = slugify(base) or f"post-{self.pk}"
            self.slug = self._unique_slug(candidate)
        super().save(*args, **kwargs)
    
    def _unique_slug(self, candidate: str) -> str:
        """
        Ensure uniqueness within the same language and never exceed DB max length.
        """
        MAX = self._meta.get_field('slug').max_length
        qs = BlogPost.objects.all().exclude(pk=self.pk)

        base = _trim_slug_to_length(candidate, MAX)
        unique = base
        if not qs.filter(slug=unique).exists():
            return unique

        i = 2
        while True:
            suffix = f"-{i}"
            base_fitted = _trim_slug_to_length(candidate, MAX, reserve=len(suffix))
            unique = f"{base_fitted}{suffix}"
            if not qs.filter(slug=unique).exists():
                return unique
            i += 1
    

class BlogPostTranslation(models.Model):
    post = models.ForeignKey(BlogPost, related_name='translations', on_delete=models.CASCADE)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)

    title = models.CharField(max_length=255)
    short_description = models.TextField(blank=True)  # used for preview cards
    slug = models.SlugField(max_length=250, unique=True)  # language-specific URL slug

    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'language')
        # constraints = [
        #     UniqueConstraint(fields=['language', 'slug'], name='uniq_lang_slug')  # same slug cannot repeat within a language
        # ]

    def __str__(self):
        return f"{self.language.upper()} - {self.title}"
    
    def get_absolute_url(self):
        return reverse("blog:post_detail", kwargs={"lang": self.language, "slug": self.slug})

    def save(self, *args, **kwargs):
        base = (self.seo_title or self.title or f"{self.post.slug}-{self.language}").strip()

        # Only regenerate when not locked (e.g., draft)
        if not self.slug or not self.post.slug_locked:   # or: if not self.post.is_published:
            if not self.post.is_published:
                from .utils import slugify_by_language
                candidate = slugify_by_language(base, self.language) or f"{self.post.slug}-{self.language}"
                self.slug = self._unique_slug(candidate)

        super().save(*args, **kwargs)
   
    def _unique_slug(self, candidate: str) -> str:
        """
        Ensure uniqueness within the same language and never exceed DB max length.
        """
        MAX = self._meta.get_field('slug').max_length
        # qs = BlogPostTranslation.objects.filter(language=self.language).exclude(pk=self.pk)
        qs = BlogPostTranslation.objects.exclude(pk=self.pk)

        base = _trim_slug_to_length(candidate, MAX)
        unique = base
        if not qs.filter(slug=unique).exists():
            return unique

        i = 2
        while True:
            suffix = f"-{i}"
            base_fitted = _trim_slug_to_length(candidate, MAX, reserve=len(suffix))
            unique = f"{base_fitted}{suffix}"
            if not qs.filter(slug=unique).exists():
                return unique
            i += 1
    

class BlogSection(models.Model):
    post = models.ForeignKey(BlogPost, related_name='sections', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)  # for sorting
    section_type = models.CharField(max_length=50, choices=SectionType.choices, default=SectionType.TEXT)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Section {self.order} of {self.post.slug}"
    


class BlogSectionTranslation(models.Model):
    section = models.ForeignKey(BlogSection, related_name='translations', on_delete=models.CASCADE)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    heading = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)  # can use Markdown or HTML
    alt_text = models.CharField(max_length=255, blank=True)

    og_image = models.ImageField(
        upload_to=blog_og_image_upload_to,
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('section', 'language')
        ordering = ['language']
        indexes = [
            models.Index(fields=['section', 'language']),
        ]

    def __str__(self):
        return f"{self.language.upper()} - Section {self.section.order} of {self.section.post.slug}"

    def save(self, *args, **kwargs):
        # Resize only if og_image is new or changed
        if self.pk:
            try:
                old = BlogSectionTranslation.objects.get(pk=self.pk)
                image_changed = old.og_image != self.og_image
            except BlogSectionTranslation.DoesNotExist:
                image_changed = True
        else:
            image_changed = bool(self.og_image)

        if image_changed and self.og_image:
            try:
                img = Image.open(self.og_image)
                output = BytesIO()
                img = img.convert("RGB")
                img.thumbnail((1200, 630))
                img.save(output, format='JPEG', quality=85)
                self.og_image.save(self.og_image.name, ContentFile(output.getvalue()), save=False)
            except Exception as e:
                print(f"Error resizing image: {e}")

        elif not self.og_image and self.heading:
            self.og_image = self.generate_og_image(self.heading)
        super().save(*args, **kwargs)

    def generate_og_image(self, title):
        img = Image.new("RGB", (1200, 630), color=(30, 30, 30))
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", size=48)
        except IOError:
            font = ImageFont.load_default()

        draw.text((60, 260), title[:100], fill=(255, 255, 255), font=font)

        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        buffer.seek(0)

        filename = f"{slugify_filename(title)}-{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
        return ContentFile(buffer.read(), name=filename)


class BlogImage(models.Model):
    section = models.ForeignKey(
        BlogSection, related_name='images', on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to=blog_image_upload_to, blank=True, null=True)
    image_small = models.ImageField(upload_to=blog_image_small_upload_to, blank=True, null=True)

    # Non-localized, technical/meta fields
    is_primary = models.BooleanField(default=False)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)  # e.g. 'image/webp'
    bytes = models.PositiveIntegerField(null=True, blank=True)
    focal_x = models.FloatField(null=True, blank=True)  # 0..1 for smart-crop
    focal_y = models.FloatField(null=True, blank=True)
    dominant_color = models.CharField(max_length=9, blank=True)  # '#RRGGBB' or 'rgba(...)'
    blurhash = models.CharField(max_length=50, blank=True)  # optional LQIP

    # DEPRECATE old caption (move to translations)
    caption = models.CharField(max_length=255, blank=True)

    def get_i18n(self, lang: str) -> Optional['BlogImageTranslation']:
        # exact language
        tx = next((t for t in self.translations.all() if t.language == lang), None)
        if tx:
            return tx
        # fallback to the section language (if you carry current lang in request, pass that)
        # or fallback to English
        return next((t for t in self.translations.all() if t.language == 'en'), None)

    def get_resolved_attrs(self, lang: str, section_fallback: Optional[BlogSectionTranslation] = None) -> dict:
        """
        Returns dict for frontend: alt, title, ariaLabel, caption, longDescription.
        Applies fallbacks in a sensible order.
        """
        tx = self.get_i18n(lang)
        alt = (tx and tx.alt_text) or \
            (section_fallback and section_fallback.alt_text) or \
            (tx and tx.caption) or \
            (self.section.post.internal_title) or \
            "Airport Transfer in Antalya and Istanbul"

        return {
            "alt": alt[:255],
            "title": (tx and tx.title_text) or "",
            "aria_label": (tx and tx.aria_label) or alt[:255],
            "caption": (tx and tx.caption) or "",
            "long_description": (tx and tx.long_description) or "",
            "file_name_override": (tx and tx.file_name_override) or "",
        }
    
    # when created, create blogimagetranslation for all languages
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            existing_langs = set(self.translations.values_list('language', flat=True))
            for lang_code, _ in LANGUAGE_CHOICES:
                if lang_code not in existing_langs:
                    BlogImageTranslation.objects.create(image=self, language=lang_code)
    

class BlogImageTranslation(models.Model):
    """
    Per-language copy for image accessibility & SEO.
    """
    image = models.ForeignKey(
        BlogImage, related_name='translations', on_delete=models.CASCADE
    )
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)

    # Localized, user-visible text:
    caption = models.CharField(max_length=255, blank=True)       # shown under the image
    alt_text = models.CharField(max_length=255, blank=True)      # <img alt="">
    title_text = models.CharField(max_length=255, blank=True)    # <img title="">
    aria_label = models.CharField(max_length=255, blank=True)    # for <img role="img" aria-label="...">
    long_description = models.TextField(blank=True)              # detailed description for accessibility (can be linked)

    # Optional localized SEO bits (rarely used, but handy):
    file_name_override = models.CharField(max_length=200, blank=True)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('image', 'language')
        indexes = [
            models.Index(fields=['image', 'language']),
        ]

    def __str__(self):
        return f"{self.language.upper()} - Image #{self.image_id}"


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Only auto-generate if slug is empty; preserves existing URLs on rename.
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name, field_name="slug")

        # Simple retry loop in case of a rare race condition on concurrent creates
        for _ in range(3):
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError as e:
                if "slug" in str(e).lower():
                    # another process grabbed the same slug; bump and retry
                    self.slug = generate_unique_slug(self, self.name, field_name="slug")
                    continue
                raise
        # Final attempt (very unlikely to reach)
        return super().save(*args, **kwargs)


class BlogTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=150, unique=True, blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name, field_name="slug")

        for _ in range(3):
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError as e:
                if "slug" in str(e).lower():
                    self.slug = generate_unique_slug(self, self.name, field_name="slug")
                    continue
                raise
        return super().save(*args, **kwargs)


class FaqItem(models.Model):
    """
    One Q/A row inside a BlogSection of type 'faq'.
    """
    section = models.ForeignKey(
        BlogSection, related_name='faqs', on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField(default=0)
    internal_note = models.CharField(max_length=255, blank=True)  # for admin use only
    is_expanded_by_default = models.BooleanField(default=False)

    # Non-localized meta (for analytics / UI behavior)
    anchor = models.SlugField(max_length=120, blank=True)  # optional in-page anchor id
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['section', 'order']),
            models.Index(fields=['section', 'is_featured']),
        ]

    def __str__(self):
        return f"FAQ #{self.pk} in {self.section.post.slug} (order {self.order})"

    def get_i18n(self, lang: str) -> Optional['FaqItemTranslation']:
        tx = next((t for t in self.translations.all() if t.language == lang), None)
        if tx:
            return tx
        return next((t for t in self.translations.all() if t.language == 'en'), None)

    def get_resolved(self, lang: str) -> dict:
        tx = self.get_i18n(lang)
        question = (tx and tx.question) or ""
        answer = (tx and tx.answer) or ""
        return {
            "question": question,
            "answer": answer,
            "anchor": self.anchor or "",
            "is_expanded_by_default": self.is_expanded_by_default,
        }

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        # optional: autogenerate anchor from first non-empty question
        super().save(*args, **kwargs)
        if is_new:
            existing_langs = set(self.translations.values_list('language', flat=True))
            for code, _ in LANGUAGE_CHOICES:
                if code not in existing_langs:
                    FaqItemTranslation.objects.create(item=self, language=code)


class FaqItemTranslation(models.Model):
    """
    Localized content for FaqItem.
    """
    item = models.ForeignKey(
        FaqItem, related_name='translations', on_delete=models.CASCADE
    )
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)

    question = models.CharField(max_length=255, blank=True)
    # Rich text allowed; you already use HTML in BlogSectionTranslation.body
    answer = models.TextField(blank=True)

    # Optional SEO/accessibility helpers
    aria_label = models.CharField(max_length=255, blank=True)
    # Optional short answer for list previews / FAQPage schema if you want
    summary = models.CharField(max_length=255, blank=True)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('item', 'language')
        indexes = [
            models.Index(fields=['item', 'language']),
        ]

    def __str__(self):
        return f"{self.language.upper()} – FAQ #{self.item_id}"


class FaqLibraryItem(models.Model):
    internal_identifier = models.CharField(max_length=120, unique=True, default="New FAQ")
    key = models.SlugField(max_length=120, help_text="Stable key, e.g. 'payment-methods'", null=True, blank=True)
    slug_lock = models.BooleanField(default=False, help_text="Freeze the key from auto-regeneration")
    
    order = models.PositiveIntegerField(default=0)
    is_expanded_by_default = models.BooleanField(default=False)

    # Non-localized meta (for analytics / UI behavior)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # override save and create all translations if not exists
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self._generate_key(self.internal_identifier)
        elif not self.slug_lock:
            self.key = self._generate_key(self.internal_identifier)
        super().save(*args, **kwargs)
        existing_langs = set(self.translations.values_list('language', flat=True))
        for lang_code, _ in LANGUAGE_CHOICES:
            if lang_code not in existing_langs:
                FaqLibraryItemTranslation.objects.create(item=self, language=lang_code)

    def _generate_key(self, source: Optional[str]) -> str:
        slug = (slugify(source or '') or '')[:120]
        if slug:
            return slug
        fallback = f"faq-{(self.pk or uuid4().hex[:8])}"
        return fallback[:120]


class FaqLibraryItemTranslation(models.Model):
    item = models.ForeignKey(FaqLibraryItem, related_name='translations', on_delete=models.CASCADE)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    question = models.CharField(max_length=255)
    answer = models.TextField(blank=True)

    class Meta:
        unique_together = ('item', 'language')

class BlogPostFaqLink(models.Model):
    """
    Links a blog FAQ section to a library item; allows per-blog overrides & ordering.
    """
    blog_post = models.ForeignKey(BlogPost, related_name='faq_links', on_delete=models.CASCADE)
    faq_item = models.ForeignKey(FaqLibraryItem, related_name='links', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    # Optional per-blog override (if set, use these instead of library wording)
    override_question = models.CharField(max_length=255, blank=True)
    override_answer = models.TextField(blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ('blog_post', 'faq_item')
