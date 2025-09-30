# apps/blog/models_map.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from .models import BlogSection, LANGUAGE_CHOICES

class MapProvider(models.TextChoices):
    GOOGLE_MY_MAPS = "google_my_maps", _("Google My Maps")

class BlogSectionMap(models.Model):
    """
    One map per section. Use on sections with section_type = 'map'.
    Title/description live inside the external map (e.g., Google My Maps).
    """
    section = models.OneToOneField(
        BlogSection,
        related_name="map",
        on_delete=models.CASCADE,
        primary_key=True,  # makes PK == section_id
    )
    provider = models.CharField(
        max_length=32,
        choices=MapProvider.choices,
        default=MapProvider.GOOGLE_MY_MAPS,
    )
    is_active = models.BooleanField(default=True)
    internal_identifier = models.CharField(
        max_length=128,
        blank=True,
        help_text="Optional internal ID to identify the map in the provider system",
    )

    # display hint for frontend
    iframe_height = models.PositiveIntegerField(default=420, help_text="Suggested iframe height (px)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["is_active"])]
        verbose_name = "Blog Section Map"
        verbose_name_plural = "Blog Section Maps"

    def __str__(self):
        return f"Map for Section#{self.section_id}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        existing = set(self.translations.values_list('language', flat=True))
        for code, _ in LANGUAGE_CHOICES:
            if code not in existing:
                BlogSectionMapTranslation.objects.create(section_map=self, language=code)


class BlogSectionMapTranslation(models.Model):
    """
    Per-language embed URL (e.g., Google My Maps viewer URL).
    """
    section_map = models.ForeignKey(
        BlogSectionMap, related_name="translations", on_delete=models.CASCADE
    )
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    embed_url = models.URLField(max_length=800)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("section_map", "language")
        indexes = [models.Index(fields=["section_map", "language"])]

    def __str__(self):
        return f"{self.language.upper()} – SectionMap#{self.section_map_id}"
