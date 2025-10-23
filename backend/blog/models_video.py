# models_video.py  (or inline in models.py)
from django.db import models
from typing import Optional
from .models import BlogSection, LANGUAGE_CHOICES
from .utils import blog_image_small_upload_to  # reuse for poster or create a dedicated one

class VideoProvider(models.TextChoices):
    YOUTUBE = 'youtube', 'YouTube'
    VIMEO   = 'vimeo',   'Vimeo'
    SELF    = 'self',    'Self-hosted'
    OTHER   = 'other',   'Other/External'

class PreloadMode(models.TextChoices):
    AUTO = 'auto', 'auto'
    METADATA = 'metadata', 'metadata'
    NONE = 'none', 'none'

class BlogVideo(models.Model):
    """
    Exactly one video per BlogSection.
    """
    section = models.OneToOneField(          # 👈 one-per-section
        BlogSection, related_name='video', on_delete=models.CASCADE
    )

    # Source selection
    provider = models.CharField(max_length=20, choices=VideoProvider.choices, default=VideoProvider.YOUTUBE)
    provider_video_id = models.CharField(max_length=200, blank=True)
    source_url = models.URLField(blank=True)

    # Self-hosted / multi-bitrate
    file = models.FileField(upload_to='blog/videos/%Y/%m/', blank=True, null=True)
    hls_url = models.URLField(blank=True)
    dash_url = models.URLField(blank=True)

    # Poster / preview
    poster = models.ImageField(upload_to=blog_image_small_upload_to, blank=True, null=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    bytes = models.PositiveIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)

    # Playback & UX flags
    autoplay = models.BooleanField(default=False)
    muted = models.BooleanField(default=False)
    loop = models.BooleanField(default=False)
    controls = models.BooleanField(default=True)
    playsinline = models.BooleanField(default=True)
    preload = models.CharField(max_length=10, choices=PreloadMode.choices, default=PreloadMode.METADATA)

    # Optional clipping
    start_at = models.PositiveIntegerField(default=0, help_text="Start in seconds")
    end_at = models.PositiveIntegerField(null=True, blank=True, help_text="End in seconds (optional)")

    # Cached oEmbed
    oembed_json = models.JSONField(null=True, blank=True)
    oembed_fetched_at = models.DateTimeField(null=True, blank=True)

    # Kept for symmetry with images; no ordering needed anymore
    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['provider', 'provider_video_id']),
        ]

    def __str__(self):
        return f"Video #{self.pk} in {self.section.post.slug} ({self.provider})"

    @property
    def aspect_ratio(self) -> Optional[float]:
        if self.width and self.height:
            try:
                return round(self.width / max(1, self.height), 4)
            except Exception:
                return None
        return None

    def get_embed_src(self) -> Optional[str]:
        if self.provider == VideoProvider.YOUTUBE and self.provider_video_id:
            base = f"https://www.youtube.com/embed/{self.provider_video_id}"
            params = []
            if self.start_at: params.append(f"start={self.start_at}")
            if self.end_at: params.append(f"end={self.end_at}")
            if self.autoplay: params.append("autoplay=1")
            if self.muted: params.append("mute=1")
            params.append(f"controls={1 if self.controls else 0}")
            return base + (("?" + "&".join(params)) if params else "")
        if self.provider == VideoProvider.VIMEO and self.provider_video_id:
            base = f"https://player.vimeo.com/video/{self.provider_video_id}"
            params = []
            if self.autoplay: params.append("autoplay=1")
            if self.muted: params.append("muted=1")
            if not self.controls: params.append("controls=0")
            return base + (("?" + "&".join(params)) if params else "")
        return None

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            existing = set(self.translations.values_list('language', flat=True))
            for code, _ in LANGUAGE_CHOICES:
                if code not in existing:
                    BlogVideoTranslation.objects.create(video=self, language=code)


class BlogVideoTranslation(models.Model):
    video = models.ForeignKey(BlogVideo, related_name='translations', on_delete=models.CASCADE)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    title = models.CharField(max_length=255, blank=True)
    caption = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    aria_label = models.CharField(max_length=255, blank=True)
    transcript = models.TextField(blank=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('video', 'language')
        indexes = [models.Index(fields=['video', 'language'])]

    def __str__(self):
        return f"{self.language.upper()} – Video #{self.video_id}"


class CaptionKind(models.TextChoices):
    SUBTITLES = 'subtitles', 'Subtitles'
    CAPTIONS  = 'captions',  'Captions'
    DESCRIPT  = 'descriptions', 'Audio Descriptions'

class BlogVideoCaption(models.Model):
    video = models.ForeignKey(BlogVideo, related_name='caption_tracks', on_delete=models.CASCADE)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    kind = models.CharField(max_length=20, choices=CaptionKind.choices, default=CaptionKind.SUBTITLES)
    label = models.CharField(max_length=120, blank=True)
    src = models.URLField(blank=True)
    file = models.FileField(upload_to='blog/video_captions/%Y/%m/', blank=True, null=True)
    mime_type = models.CharField(max_length=60, blank=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ('video', 'language', 'kind')
        indexes = [models.Index(fields=['video', 'language'])]

    def __str__(self):
        return f"{self.language.upper()} {self.kind} for Video #{self.video_id}"
