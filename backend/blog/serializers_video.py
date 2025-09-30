# --- VIDEO: admin serializers (one video per section) ----------------------

from rest_framework import serializers
from django.utils.functional import cached_property
from .models_video import (
    BlogVideo, BlogVideoTranslation, BlogVideoCaption, BlogSection, LANGUAGE_CHOICES
)

# Caption track (admin)
class BlogVideoCaptionModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogVideoCaption
        fields = ['id', 'language', 'kind', 'label', 'src', 'file', 'mime_type', 'is_default']
        read_only_fields = ['id']


# Translation (admin)
class BlogVideoTranslationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogVideoTranslation
        fields = [
            'id', 'language',
            'title', 'caption', 'description',
            'alt_text', 'aria_label',
            'transcript',
            'seo_title', 'seo_description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Video (admin)
class BlogVideoModelSerializer(serializers.ModelSerializer):
    translations = BlogVideoTranslationModelSerializer(many=True, required=False)
    caption_tracks = BlogVideoCaptionModelSerializer(many=True, required=False)

    embed_src = serializers.SerializerMethodField()
    aspect_ratio = serializers.SerializerMethodField()
    poster_url = serializers.SerializerMethodField()
    sources = serializers.SerializerMethodField()

    class Meta:
        model = BlogVideo
        fields = [
            'id', 'section',
            'provider', 'provider_video_id', 'source_url',
            'file', 'hls_url', 'dash_url', 'mime_type',
            'poster', 'poster_url',
            'width', 'height', 'duration_seconds', 'bytes',
            'autoplay', 'muted', 'loop', 'controls', 'playsinline', 'preload',
            'start_at', 'end_at',
            'oembed_json', 'oembed_fetched_at',
            'is_primary',
            'created_at', 'updated_at',

            # nested
            'translations',
            'caption_tracks',

            # computed
            'embed_src',
            'aspect_ratio',
            'sources',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'oembed_fetched_at',
            'embed_src', 'aspect_ratio', 'poster_url', 'sources',
        ]

    def _abs(self, f):
        req = self.context.get('request')
        if not f:
            return None
        url = getattr(f, 'url', None) or f
        return req.build_absolute_uri(url) if (req and url) else url

    def get_poster_url(self, obj): return self._abs(obj.poster)

    def get_sources(self, obj):
        return {
            'hls_url': obj.hls_url or '',
            'dash_url': obj.dash_url or '',
            'file_url': self._abs(obj.file) or '',
            'mime_type': obj.mime_type or '',
        }

    def get_embed_src(self, obj): return obj.get_embed_src()
    def get_aspect_ratio(self, obj): return obj.aspect_ratio

    def create(self, validated_data):
        txs = validated_data.pop('translations', [])
        caps = validated_data.pop('caption_tracks', [])

        # OneToOne: will raise if section already has a video; let DB constraint handle it
        obj = super().create(validated_data)

        # translations: upsert provided, seed missing languages
        present = {t['language'] for t in txs if 'language' in t}
        for t in txs:
            BlogVideoTranslation.objects.update_or_create(
                video=obj, language=t['language'],
                defaults={k: v for k, v in t.items() if k != 'language'}
            )
        for code, _ in LANGUAGE_CHOICES:
            if code not in present:
                BlogVideoTranslation.objects.get_or_create(video=obj, language=code)

        # caption tracks: create provided
        for c in caps:
            BlogVideoCaption.objects.create(video=obj, **c)

        return obj

    def update(self, instance, validated_data):
        txs = validated_data.pop('translations', None)
        caps = validated_data.pop('caption_tracks', None)

        instance = super().update(instance, validated_data)

        if txs is not None:
            for t in txs:
                BlogVideoTranslation.objects.update_or_create(
                    video=instance, language=t['language'],
                    defaults={k: v for k, v in t.items() if k != 'language'}
                )

        if caps is not None:
            instance.caption_tracks.all().delete()
            for c in caps:
                BlogVideoCaption.objects.create(video=instance, **c)

        return instance


# --- VIDEO: public serializers (one video per section) ---------------------

class _LangMixin:
    @cached_property
    def _lang(self):
        ctx = self.context or {}
        if ctx.get('lang'):
            return ctx['lang']
        req = ctx.get('request')
        return (req.query_params.get('lang') if req else None) or 'en'


class PublicBlogVideoSerializer(_LangMixin, serializers.ModelSerializer):
    # flattened i18n
    title = serializers.SerializerMethodField()
    caption = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    alt_text = serializers.SerializerMethodField()
    aria_label = serializers.SerializerMethodField()
    transcript = serializers.SerializerMethodField()

    # player bits
    embed_src = serializers.SerializerMethodField()
    poster_url = serializers.SerializerMethodField()
    sources = serializers.SerializerMethodField()
    tracks = serializers.SerializerMethodField()

    class Meta:
        model = BlogVideo
        fields = [
            'id',
            'provider',
            'embed_src',
            'poster_url',
            'width', 'height', 'duration_seconds',
            'autoplay', 'muted', 'loop', 'controls', 'playsinline', 'preload',
            'start_at', 'end_at',
            # i18n
            'title', 'caption', 'description', 'alt_text', 'aria_label', 'transcript',
            # media/tracks
            'sources', 'tracks',
        ]
        read_only_fields = fields

    # helpers
    def _tx(self, obj):
        lang = self._lang
        tx = next((t for t in obj.translations.all() if t.language == lang), None)
        return tx or next((t for t in obj.translations.all() if t.language == 'en'), None)

    def _abs(self, f):
        req = self.context.get('request')
        if not f:
            return ''
        url = getattr(f, 'url', None) or f
        return req.build_absolute_uri(url) if (req and url) else (url or '')

    # i18n getters
    def get_title(self, o):       tx = self._tx(o); return (tx and tx.title) or ''
    def get_caption(self, o):     tx = self._tx(o); return (tx and tx.caption) or ''
    def get_description(self, o): tx = self._tx(o); return (tx and tx.description) or ''
    def get_alt_text(self, o):    tx = self._tx(o); return (tx and tx.alt_text) or ''
    def get_aria_label(self, o):  tx = self._tx(o); return (tx and tx.aria_label) or ''
    def get_transcript(self, o):  tx = self._tx(o); return (tx and tx.transcript) or ''

    # media getters
    def get_embed_src(self, obj): return obj.get_embed_src()
    def get_poster_url(self, obj): return self._abs(obj.poster)
    def get_sources(self, obj):
        return {
            'hls_url': obj.hls_url or '',
            'dash_url': obj.dash_url or '',
            'file_url': self._abs(obj.file),
            'mime_type': obj.mime_type or '',
        }
    def get_tracks(self, obj):
        out = []
        for t in obj.caption_tracks.all():
            out.append({
                'language': t.language,
                'kind': t.kind,
                'label': t.label or t.language.upper(),
                'src': t.src or self._abs(t.file),
                'mime_type': t.mime_type or '',
                'default': t.is_default,
            })
        return out
