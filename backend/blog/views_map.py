# apps/blog/views_map.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models_map import BlogSectionMap, BlogSectionMapTranslation
from .serializers_map import BlogSectionMapSerializer, BlogSectionMapTranslationSerializer


class BlogSectionMapViewSet(viewsets.ModelViewSet):
    """
    CRUD for maps attached to sections (1:1). Public read.
    """
    queryset = (
        BlogSectionMap.objects
        .select_related("section", "section__post")
        .prefetch_related("translations")
    )
    serializer_class = BlogSectionMapSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ["section", "is_active"]     # if you use django-filter
    ordering_fields = ["updated_at", "section"]
    search_fields = ["section__post__internal_title", "section__post__slug"]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        lang = self.request.query_params.get("lang") or self.request.headers.get("X-Lang")
        if lang:
            ctx["lang"] = lang.lower()
        return ctx

    @action(detail=False, url_path=r"for-section/(?P<section_id>\d+)")
    def for_section(self, request, section_id: int = None):
        """
        GET /api/v1/section-maps/for-section/<section_id>/?lang=tr
        Returns the single map for a section (if active) with resolved URL.
        """
        try:
            smap = self.get_queryset().get(section_id=section_id, is_active=True)
        except BlogSectionMap.DoesNotExist:
            return Response(status=404)
        ser = self.get_serializer(smap)
        return Response(ser.data)


class BlogSectionMapTranslationViewSet(viewsets.ModelViewSet):
    """
    Manage per-language embed URLs for a section map.
    """
    queryset = BlogSectionMapTranslation.objects.select_related("section_map")
    serializer_class = BlogSectionMapTranslationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ["section_map", "language"]
    ordering_fields = ["updated_at", "id"]
    search_fields = ["embed_url"]
