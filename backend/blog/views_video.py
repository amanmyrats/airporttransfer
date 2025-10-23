# --- VIDEO ---

from django.utils.translation import get_language
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from .models_video import BlogVideo, BlogVideoTranslation, BlogVideoCaption
from .serializers_video import (
    BlogVideoModelSerializer, BlogVideoTranslationModelSerializer, 
    BlogVideoCaptionModelSerializer,
    PublicBlogVideoSerializer
)


class BlogVideoModelViewSet(viewsets.ModelViewSet):
    """
    Admin/editor CRUD for the single video attached to a BlogSection.

    Extra actions:
    - POST /blogvideos/{id}/upload-poster/
    - GET  /blogvideos/{id}/public/?lang=xx
    """
    queryset = (BlogVideo.objects
        .select_related('section', 'section__post')
        .prefetch_related('translations', 'caption_tracks')
    )
    serializer_class = BlogVideoModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = [
        'provider', 'provider_video_id', 'source_url',
        'translations__title', 'translations__caption', 'translations__description'
    ]
    filterset_fields = ['section', 'provider']  # no is_primary/order for one-to-one
    ordering_fields = ['created_at', 'updated_at', 'id']
    ordering = ['-updated_at', '-created_at', 'id']

    def perform_create(self, serializer):
        """
        Enforce one-to-one: a section can have only one video.
        """
        section = serializer.validated_data.get('section')
        if not section:
            raise ValidationError({"section": "Section is required."})
        if BlogVideo.objects.filter(section=section).exists():
            raise ValidationError({"section": "This section already has a video."})
        serializer.save()

    @action(detail=True, methods=['POST'], url_path='upload-poster')
    def upload_poster(self, request, pk=None):
        """Upload/replace poster image for the video."""
        video = self.get_object()
        if 'poster' not in request.FILES:
            return Response({"detail": "No poster file provided (field name 'poster')."},
                            status=status.HTTP_400_BAD_REQUEST)

        from django.core.files.storage import default_storage
        poster = request.FILES['poster']
        video.poster.storage = default_storage
        video.poster.save(poster.name, poster, save=True)
        return Response({
            "detail": "Poster uploaded successfully",
            "poster": (video.poster.url if video.poster else None)
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'], url_path='public', permission_classes=[AllowAny])
    def public(self, request, pk=None):
        """Compact, language-resolved payload for a single video."""
        obj = self.get_object()
        lang = request.query_params.get("lang") or get_language() or "en"
        data = PublicBlogVideoSerializer(obj, context={"request": request, "lang": lang}).data
        return Response(data, status=status.HTTP_200_OK)


class BlogVideoTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = (BlogVideoTranslation.objects
        .select_related('video', 'video__section', 'video__section__post')
    )
    serializer_class = BlogVideoTranslationModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['language', 'title', 'caption', 'description', 'seo_title', 'seo_description']
    filterset_fields = ['video', 'language']
    ordering_fields = ['language', 'created_at', 'updated_at', 'id']
    ordering = ['language', '-created_at', 'id']


class BlogVideoCaptionModelViewSet(viewsets.ModelViewSet):
    queryset = (BlogVideoCaption.objects
        .select_related('video', 'video__section', 'video__section__post')
    )
    serializer_class = BlogVideoCaptionModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['language', 'label', 'mime_type', 'kind']
    filterset_fields = ['video', 'language', 'kind', 'is_default']
    ordering_fields = ['language', 'id']
    ordering = ['language', 'id']
