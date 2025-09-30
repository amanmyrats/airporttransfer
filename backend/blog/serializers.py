from django.conf import settings
from django.utils.text import slugify
from rest_framework import serializers
from urllib.parse import urlparse

from rest_framework import serializers
from .models import (
    BlogPost, BlogPostTranslation, BlogSection,
    BlogSectionTranslation, BlogImage, BlogCategory, BlogTag,
    BlogImageTranslation,
    FaqItem, FaqItemTranslation,
    FaqLibraryItem,
    FaqLibraryItemTranslation,
    BlogPostFaqLink,
)
from .serializers_video import BlogVideoModelSerializer
from .serializers_map import BlogSectionMapSerializer


class BlogCategoryModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug']


class BlogTagModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']


# class BlogImageModelSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BlogImage
#         fields = ['id', 'image', 'alt_text', 'caption', 'is_primary']


class BlogSectionTranslationModelSerializer(serializers.ModelSerializer):
    og_image_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogSectionTranslation
        fields = ['id', 'section', 'language', 'heading', 'body', 'og_image', 'og_image_url', 'created_at', 'updated_at']

    def get_og_image_url(self, obj):
        request = self.context.get('request')
        if obj.og_image and hasattr(obj.og_image, 'url'):
            return request.build_absolute_uri(obj.og_image.url) if request else obj.og_image.url
        return None

    
class BlogPostTranslationModelSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = BlogPostTranslation
        fields = ['id', 'post', 'language', 'title', 'short_description', 'slug', 'created_at', 'updated_at', 
                  'seo_title', 'seo_description']
        extra_kwargs = {
            "slug": {"validators": []}
        }

    def validate_slug(self, value: str):
        """
        Allow natural input; do not regex-validate here.
        Optional: pre-normalize for a nicer error if you want to check conflicts now.
        """
        return value  # let the model normalize in save()
    


class BlogImageTranslationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImageTranslation
        fields = ('id', 'language', 'image', 'caption', 'alt_text', 'title_text', 'aria_label', 'long_description', 'file_name_override')


class BlogImageModelSerializer(serializers.ModelSerializer):
    translations = BlogImageTranslationModelSerializer(many=True, read_only=True)
    seo = serializers.SerializerMethodField()

    class Meta:
        model = BlogImage
        fields = (
            'id', 'section', 'image', 'is_primary',
            'width', 'height', 'mime_type', 'bytes',
            'focal_x', 'focal_y', 'dominant_color', 'blurhash',
            'translations',
            'seo',  # computed, localized bundle for <img> attrs
        )

    def get_seo(self, obj: BlogImage):
        request = self.context.get('request')
        lang = (request and request.query_params.get('lang')) or 'en'

        # Optionally fetch section translation for better fallback
        section_tr = None
        if hasattr(obj.section, '_section_tr_cache'):
            section_tr = obj.section._section_tr_cache
        else:
            section_tr = BlogSectionTranslation.objects.filter(
                section=obj.section, language=lang
            ).only('alt_text').first()
            obj.section._section_tr_cache = section_tr  # simple local cache

        resolved = obj.get_resolved_attrs(lang, section_tr)
        return resolved
    

class FaqItemTranslationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaqItemTranslation
        fields = ['id', 'language', 'question', 'answer', 'aria_label', 'summary', 'updated_at', 'created_at']

class FaqItemModelSerializer(serializers.ModelSerializer):
    translations = FaqItemTranslationModelSerializer(many=True, read_only=True)

    class Meta:
        model = FaqItem
        fields = ['id', 'section', 'order', 'internal_note', 'is_expanded_by_default', 'anchor', 'is_featured', 'translations']


class BlogSectionModelSerializer(serializers.ModelSerializer):
    translations = BlogSectionTranslationModelSerializer(many=True, read_only=True)
    images = BlogImageModelSerializer(many=True, read_only=True)
    faqs = FaqItemModelSerializer(many=True, read_only=True)
    video = BlogVideoModelSerializer(read_only=True)
    map = BlogSectionMapSerializer(read_only=True)

    class Meta:
        model = BlogSection
        fields = ['id', 'post', 'order', 'section_type', 'translations', 'images', 
                  'faqs', 'video', 'map', ]


class FaqLibraryItemTranslationModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaqLibraryItemTranslation
        fields = [
            "id",
            "item",
            "language",
            "question",
            "answer",
        ]


class FaqLibraryItemModelSerializer(serializers.ModelSerializer):
    translations = FaqLibraryItemTranslationModelSerializer(many=True, read_only=True)
    links = serializers.SerializerMethodField()

    class Meta:
        model = FaqLibraryItem
        fields = [
            "id",
            "internal_identifier",
            "key",
            "order",
            "links", 
            "created_at",
            "updated_at",
            "translations",
            "is_expanded_by_default", "is_featured", 
        ]

    def get_links(self, obj):
        # convenience: include existing links for this FAQ item
        links = getattr(obj, '_links_cache', None)
        if links is None:
            links = BlogPostFaqLink.objects.filter(faq_item=obj).order_by('order')
            # obj._links_cache = links  # simple local cache
        return BlogPostFaqLinkModelSerializer(links, many=True, context=self.context).data
    


class FaqLibraryItemLiteModelSerializer(serializers.ModelSerializer):
    translations = FaqLibraryItemTranslationModelSerializer(many=True, read_only=True)

    class Meta:
        model = FaqLibraryItem
        fields = [
            "id",
            "internal_identifier",
            "key",
            "order",
            "is_expanded_by_default",
            "is_featured",
            "translations",
        ]


class BlogPostFaqLinkModelSerializer(serializers.ModelSerializer):
    # convenience: expand faq_item details read-only
    # faq_item_detail = FaqLibraryItemModelSerializer(source="faq_item", read_only=True)
    blog_post_internal_title = serializers.CharField(source="blog_post.internal_title", read_only=True)
    faq_item_internal_identifier = serializers.CharField(source="faq_item.internal_identifier", read_only=True)

    # NEW: embed the actual library item (lite)
    faq_item_obj = FaqLibraryItemLiteModelSerializer(source="faq_item", read_only=True)

    class Meta:
        model = BlogPostFaqLink
        fields = [
            "id",
            "blog_post",
            "faq_item",
            "order",
            "blog_post_internal_title",
            "faq_item_internal_identifier",
            "faq_item_obj",    
        ]


class BlogPostModelSerializer(serializers.ModelSerializer):
    translations = BlogPostTranslationModelSerializer(many=True, read_only=True)
    sections = BlogSectionModelSerializer(many=True, read_only=True)
    # category = BlogCategoryModelSerializer(read_only=True)

    category = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(), required=False, allow_null=True
    )
    category_obj = BlogCategoryModelSerializer(source='category', read_only=True)

    tags = serializers.PrimaryKeyRelatedField(
        queryset=BlogTag.objects.all(), many=True, required=False
    )
    tags_obj = BlogTagModelSerializer(many=True, source='tags', read_only=True)
    tag_names = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    # main_image = serializers.ImageField(read_only=True)
    main_image = serializers.ImageField(required=False, allow_null=True, use_url=True)

    thumbnail = serializers.ImageField(source='main_image_small', read_only=True)

    faq_links = BlogPostFaqLinkModelSerializer(many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id','internal_title', 'is_published', 'created_at', 'updated_at', 'published_at',
            'main_image',
            'category', 'translations', 'sections',
            'views_count', 'tags', 'featured', 'priority', 'is_translated_fully', 
            'thumbnail', 
            'category_obj', 'tags_obj', 'tag_names', 
            'faq_links', 'author', 
            'slug_locked',
        ]
        read_only_fields = ['views_count', 'is_translated_fully', 'thumbnail']
    

class BlogPostLocalizedModelSerializer(serializers.ModelSerializer):
    translation = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    category = BlogCategoryModelSerializer(read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    thumbnail = serializers.ImageField(source='main_image_small', read_only=True)
    # available_languages = serializers.SerializerMethodField()
    # is_partial = serializers.SerializerMethodField()
    # untranslated_section_ids = serializers.SerializerMethodField()

    resolved_faqs = serializers.SerializerMethodField()
    faq_links = BlogPostFaqLinkModelSerializer(many=True, read_only=True)  # optional but handy

    class Meta:
        model = BlogPost
        fields = [
            'id', 'slug', 'is_published', 'created_at', 'updated_at', 'published_at',
            'main_image', 'thumbnail',
            'category', 'translation', 'sections', 
            'views_count', 'tags', 'featured', 'priority', 'is_translated_fully',
            'faq_links',
            'resolved_faqs', 'author', 
        ]

    def get_translation(self, obj):
        lang = self.context.get('lang')
        translation = obj.translations.filter(language=lang).first()
        return BlogPostTranslationModelSerializer(translation).data if translation else None

    def get_sections(self, obj):
        lang = self.context.get('lang')
        sections = obj.sections.all()
        data = []
        for section in sections:
            trans = section.translations.filter(language=lang).first()
            sec_data = BlogSectionModelSerializer(section).data
            sec_data['translations'] = [BlogSectionTranslationModelSerializer(trans).data] if trans else []
            data.append(sec_data)
        return data
    
    @staticmethod
    def _tx_for_lang(item: FaqLibraryItem, lang: str):
        # simple helper to get translation; adjust fallbacks if you want
        tx = next((t for t in item.translations.all() if t.language == lang), None)
        if tx:
            return tx
        return next((t for t in item.translations.all() if t.language == 'en'), None)

    def get_resolved_faqs(self, obj):
        lang = self.context.get('lang') or 'en'
        links_qs = getattr(obj, 'faq_links', None)
        if links_qs is None:
            links_qs = obj.faq_links.all()
        # ensure faq_item + translations are prefetched in the view for performance
        out = []
        for link in links_qs.order_by('order'):
            item = link.faq_item
            tx = self._tx_for_lang(item, lang)
            q = link.override_question or (tx.question if tx else '')
            a = link.override_answer or (tx.answer if tx else '')
            out.append({
                "id": link.id,
                "order": link.order,
                "faq_item": item.id,
                "language": lang,
                "question": q,
                "answer": a,
                "is_expanded_by_default": item.is_expanded_by_default,
                "internal_identifier": item.internal_identifier,
                "key": item.key,
                "is_featured": item.is_featured,
            })
        return out
    

    # def _pick_trans(self, qs, lang, fallback):
    #     trans = qs.filter(language=lang).first()
    #     if trans:
    #         return trans, False, None
    #     if fallback:
    #         fb = qs.filter(language=fallback).first()
    #         if fb:
    #             return fb, True, fallback
    #     # as a last resort, use any translation
    #     any_t = qs.first()
    #     return (any_t, True, any_t.language) if any_t else (None, False, None)

    # def get_translation(self, obj):
    #     lang = self.context.get('lang')
    #     fallback = self.context.get('fallback_lang') or None
    #     trans_qs = obj.translations.all()
    #     trans, is_fb, fb_lang = self._pick_trans(trans_qs, lang, fallback)
    #     data = BlogPostTranslationModelSerializer(trans).data if trans else None
    #     if data is not None:
    #         data['is_fallback'] = is_fb
    #         data['fallback_language'] = fb_lang
    #     return data

    # def get_sections(self, obj):
    #     lang = self.context.get('lang')
    #     fallback = self.context.get('fallback_lang') or None
    #     data = []
    #     for section in obj.sections.all():
    #         sec_data = BlogSectionModelSerializer(section, context=self.context).data
    #         trans, is_fb, fb_lang = self._pick_trans(section.translations.all(), lang, fallback)
    #         sec_data['translations'] = [BlogSectionTranslationModelSerializer(trans, context=self.context).data] if trans else []
    #         sec_data['is_fallback'] = bool(trans) and is_fb
    #         sec_data['fallback_language'] = fb_lang if is_fb else None
    #         data.append(sec_data)
    #     return data

    # def get_available_languages(self, obj):
    #     # languages present at POST-level (title/slug)
    #     return list(obj.translations.values_list('language', flat=True).distinct())

    # def get_untranslated_section_ids(self, obj):
    #     lang = self.context.get('lang')
    #     return list(
    #         obj.sections.exclude(translations__language=lang).values_list('id', flat=True)
    #     )

    # def get_is_partial(self, obj):
    #     # partial if any section missing requested language
    #     return len(self.get_untranslated_section_ids(obj)) > 0




class PublicBlogPostLocalizedModelSerializer(serializers.ModelSerializer):
    translation = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    category = BlogCategoryModelSerializer(read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    thumbnail = serializers.ImageField(source='main_image_small', read_only=True)
    available_languages = serializers.SerializerMethodField()
    is_partial = serializers.SerializerMethodField()
    untranslated_section_ids = serializers.SerializerMethodField()

    # 🔥 New fields
    canonical_url = serializers.SerializerMethodField()
    hreflang_links = serializers.SerializerMethodField()
    word_count = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()

    resolved_faqs = serializers.SerializerMethodField()
    faq_links = BlogPostFaqLinkModelSerializer(many=True, read_only=True)  # optional

    video = BlogVideoModelSerializer(read_only=True)


    class Meta:
        model = BlogPost
        fields = [
            'id', 'is_published', 'created_at', 'updated_at', 'published_at',
            'main_image', 'thumbnail',
            'category', 'translation', 'sections', 
            'views_count', 'tags', 'featured', 'priority', 'is_translated_fully',
            'available_languages', 'is_partial', 'untranslated_section_ids',
            'canonical_url', 'hreflang_links', 'word_count', 'reading_time',
            'resolved_faqs', 
            'faq_links', 'video',       
        ]

    def get_resolved_faqs(self, obj):
        lang = self.context.get('lang') or 'en'
        links_qs = getattr(obj, 'faq_links', None)
        if links_qs is None:
            links_qs = obj.faq_links.all()
        # ensure faq_item + translations are prefetched in the view for performance
        out = []
        for link in links_qs.order_by('order'):
            item = link.faq_item
            tx = self._tx_for_lang(item, lang)
            q = link.override_question or (tx.question if tx else '')
            a = link.override_answer or (tx.answer if tx else '')

            out.append({
                "id": link.id,
                "order": link.order,
                "faq_item": item.id,
                "language": lang,
                "question": q,
                "answer": a,
                "is_expanded_by_default": item.is_expanded_by_default,
                "internal_identifier": item.internal_identifier,
                "key": item.key,
                "is_featured": item.is_featured,
            })
        return out
    # ----------------------------
    # Helpers
    # ----------------------------
    def _pick_trans(self, qs, lang: str, fallback: str | None):
        # 1) Exact requested language
        trans = qs.filter(language=lang).first()
        if trans:
            return trans, False, None

        # 2) Explicit fallback (if different from lang)
        if fallback and fallback != lang:
            fb = qs.filter(language=fallback).first()
            if fb:
                return fb, True, fallback

        # 3) Site default (more deterministic than qs.first())
        default_lang = getattr(settings, 'DEFAULT_LANGUAGE', None)
        if default_lang and default_lang not in {lang, fallback}:
            dl = qs.filter(language=default_lang).first()
            if dl:
                return dl, True, default_lang

        # 4) Last resort: any available translation (non-deterministic)
        any_t = qs.first()
        return (any_t, True, getattr(any_t, 'language', None)) if any_t else (None, False, None)
    
    @staticmethod
    def _tx_for_lang(item: FaqLibraryItem, lang: str):
        # simple helper to get translation; adjust fallbacks if you want
        tx = next((t for t in item.translations.all() if t.language == lang), None)
        if tx:
            return tx
        return next((t for t in item.translations.all() if t.language == 'en'), None)

    @staticmethod
    def _count_words(text: str) -> int:
        if not text:
            return 0
        # Simple word count; avoids bringing in regex edge cases
        return len([w for w in str(text).split() if w.strip()])

    def get_translation(self, obj):
        lang = self.context.get('lang')
        fallback = self.context.get('fallback_lang') or None
        trans_qs = obj.translations.all()
        trans, is_fb, fb_lang = self._pick_trans(trans_qs, lang, fallback)
        data = BlogPostTranslationModelSerializer(trans).data if trans else None
        if data is not None:
            data['is_fallback'] = is_fb
            data['fallback_language'] = fb_lang
        return data

    def get_sections(self, obj):
        lang = self.context.get('lang')
        fallback = self.context.get('fallback_lang') or None
        data = []
        for section in obj.sections.all():
            sec_data = BlogSectionModelSerializer(section, context=self.context).data
            trans, is_fb, fb_lang = self._pick_trans(section.translations.all(), lang, fallback)
            sec_data['translations'] = [BlogSectionTranslationModelSerializer(trans, context=self.context).data] if trans else []
            sec_data['is_fallback'] = bool(trans) and is_fb
            sec_data['fallback_language'] = fb_lang if is_fb else None
            data.append(sec_data)
        return data

    def get_available_languages(self, obj):
        # languages present at POST-level (title/slug)
        return list(obj.translations.values_list('language', flat=True).distinct())

    def get_untranslated_section_ids(self, obj):
        lang = self.context.get('lang')
        return list(
            obj.sections.exclude(translations__language=lang).values_list('id', flat=True)
        )

    def get_is_partial(self, obj):
        # partial if any section missing requested language
        return len(self.get_untranslated_section_ids(obj)) > 0
    
    # ----------------------------
    # New getters
    # ----------------------------
    def get_canonical_url(self, obj):
        """Public, frontend URL for the *selected* translation."""
        lang = self.context.get('lang')
        fallback = self.context.get('fallback_lang') or None
        trans, _, _ = self._pick_trans(obj.translations.all(), lang, fallback)
        if not trans:
            return None
        # Use your public site base, not API base
        base = getattr(settings, 'FRONTEND_BASE_URL', '').rstrip('/')
        return f"{base}/{trans.language}/turkey-airport-transfer-blogs/{trans.slug}"

    def get_hreflang_links(self, obj):
        """Map of language → public URL for all available translations."""
        base = getattr(settings, 'FRONTEND_BASE_URL', '').rstrip('/')
        links = {}
        for lang in obj.translations.values_list('language', flat=True).distinct():
            slug = obj.translations.filter(language=lang).values_list('slug', flat=True).first()
            if slug:
                links[lang] = f"{base}/{lang}/turkey-airport-transfer-blogs/{slug}"
        # Optionally add x-default to your preferred language:
        # default_lang = getattr(settings, 'DEFAULT_LANGUAGE', 'en')
        # if default_lang in links:
        #     links['x-default'] = links[default_lang]
        return links

    def get_word_count(self, obj):
        """Sum words from chosen post translation + chosen section translations."""
        lang = self.context.get('lang')
        fallback = self.context.get('fallback_lang') or None

        # Post-level
        trans, _, _ = self._pick_trans(obj.translations.all(), lang, fallback)
        wc = 0
        if trans:
            wc += self._count_words(getattr(trans, 'title', ''))
            wc += self._count_words(getattr(trans, 'short_description', ''))
            wc += self._count_words(getattr(trans, 'seo_description', ''))

        # Section-level (only the chosen translation per section)
        for section in obj.sections.all():
            s_trans, _, _ = self._pick_trans(section.translations.all(), lang, fallback)
            if not s_trans:
                continue
            wc += self._count_words(getattr(s_trans, 'heading', ''))
            wc += self._count_words(getattr(s_trans, 'body', ''))

        return wc

    def get_reading_time(self, obj):
        """Ceil of word_count / 200 wpm."""
        import math
        wc = self.get_word_count(obj)
        return max(1, math.ceil(wc / 200)) if wc else 1
    

# non-model serializer for resolved output
class ResolvedFaqSerializer(serializers.Serializer):
    id = serializers.IntegerField()           # link id
    order = serializers.IntegerField()
    faq_item = serializers.IntegerField()
    language = serializers.CharField()
    question = serializers.CharField(allow_blank=True)
    answer = serializers.CharField(allow_blank=True)
