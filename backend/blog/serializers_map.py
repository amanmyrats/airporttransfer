# apps/blog/serializers_map.py
from rest_framework import serializers
from .models_map import BlogSectionMap, BlogSectionMapTranslation


class BlogSectionMapTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogSectionMapTranslation
        fields = ["id", "language", "embed_url", "created_at", "updated_at"]


class BlogSectionMapSerializer(serializers.ModelSerializer):
    translations = BlogSectionMapTranslationSerializer(many=True, read_only=True)
    resolved_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogSectionMap
        fields = [
            "section",            # PK == section id
            "provider",
            "is_active",
            "iframe_height",
            "translations",
            "resolved_url",
            "created_at",
            "updated_at", 
            "internal_identifier", 
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_resolved_url(self, obj: BlogSectionMap) -> str | None:
        """
        Pick the best embed URL for the requested language (context['lang']),
        fallback to 'en', then any available translation.
        """
        lang = (self.context.get("lang") or "en").lower()
        txs = list(getattr(obj, "translations").all())
        tx = next((t for t in txs if t.language == lang), None)
        if tx:
            return tx.embed_url
        tx = next((t for t in txs if t.language == "en"), None) or (txs[0] if txs else None)
        return tx.embed_url if tx else None
