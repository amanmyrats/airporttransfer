# blog/serializers_related.py
from rest_framework import serializers
from .models import BlogPost, BlogTag, BlogCategory, BlogPostTranslation

class TagMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ('id', 'name',)

class CategoryMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ('id', 'name',)

class TranslationMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPostTranslation
        fields = ('language', 'title', 'slug', 'seo_title')

class RelatedPostSerializer(serializers.ModelSerializer):
    tags = TagMiniSerializer(many=True, read_only=True)
    category = CategoryMiniSerializer(read_only=True)
    translations = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            'id', 'published_at', 'main_image_small', 'category', 'tags', 'translations'
        )

    def get_translations(self, obj):
        lang = self.context.get('lang')
        tx = obj.translations.filter(language=lang).only('language','title','slug','seo_title').first()
        if tx:
            return [TranslationMiniSerializer(tx).data]
        # optional fallback to EN or first available
        en = obj.translations.filter(language='en').only('language','title','slug','seo_title').first()
        if en:
            return [TranslationMiniSerializer(en).data]
        any_tx = obj.translations.only('language','title','slug','seo_title').first()
        return [TranslationMiniSerializer(any_tx).data] if any_tx else []
