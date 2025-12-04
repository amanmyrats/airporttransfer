import logging
import os

from django.utils.text import slugify
from django.core.files.storage import default_storage
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db import models
from django.db import transaction
from django.utils.translation import get_language
from django.db.models import Case, When, IntegerField, F
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import action, permission_classes, authentication_classes

from django.core.cache import cache
from .serializers_related import RelatedPostSerializer

from .models import (
    BlogPost, BlogPostTranslation, BlogSection,
    BlogSectionTranslation, BlogImage, BlogCategory, BlogTag, BlogCategoryTranslation, BlogTagTranslation,
    SectionType, BlogImageTranslation, FaqItem, FaqItemTranslation,
    FaqLibraryItem,
    FaqLibraryItemTranslation,
    BlogPostFaqLink,
)
from .serializers import (
    BlogPostModelSerializer, BlogPostTranslationModelSerializer,
    BlogSectionModelSerializer, BlogSectionTranslationModelSerializer,
    BlogImageModelSerializer, BlogCategoryModelSerializer,
    BlogPostLocalizedModelSerializer, 
    BlogTagModelSerializer, 
    PublicBlogPostLocalizedModelSerializer, 
    BlogImageTranslationModelSerializer, BlogCategoryTranslationModelSerializer, BlogTagTranslationModelSerializer,
    FaqItemModelSerializer, FaqItemTranslationModelSerializer, 
    FaqLibraryItemModelSerializer,
    FaqLibraryItemTranslationModelSerializer,
    BlogPostFaqLinkModelSerializer,
    ResolvedFaqSerializer,
)
from .filtersets import (
    BlogPostFilterSet, BlogPostTranslationFilterSet,
    BlogSectionFilterSet, BlogSectionTranslationFilterSet,
    BlogImageFilterSet
)
from .mixins import PublicReadMixin

logger = logging.getLogger("airporttransfer")


class BlogCategoryModelViewSet(PublicReadMixin, viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all().prefetch_related("translations")
    serializer_class = BlogCategoryModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["name", "slug", "translations__name", "translations__slug"]
    ordering_fields = ["name", "translations__name"]
    ordering = ["name"]


class BlogTagModelViewSet(viewsets.ModelViewSet):
    queryset = BlogTag.objects.all().prefetch_related("translations")
    serializer_class = BlogTagModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["name", "slug", "translations__name", "translations__slug"]
    ordering_fields = ["name", "translations__name"]
    ordering = ["name"]


class BlogCategoryTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = BlogCategoryTranslation.objects.all()
    serializer_class = BlogCategoryTranslationModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["name", "slug", "language", "category__name", "category__slug"]
    ordering_fields = ["language", "name"]
    ordering = ["language"]


class BlogTagTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = BlogTagTranslation.objects.all()
    serializer_class = BlogTagTranslationModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["name", "slug", "language", "tag__name", "tag__slug"]
    ordering_fields = ["language", "name"]
    ordering = ["language"]

class BlogImageModelViewSet(viewsets.ModelViewSet):
    queryset = BlogImage.objects.all()
    serializer_class = BlogImageModelSerializer
    filterset_class = BlogImageFilterSet
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["alt_text", "caption"]
    ordering_fields = ["is_primary", "caption"]
    ordering = ["-is_primary"]

    @action(detail=True, methods=["get"], url_path="resolved_translation")
    def resolved(self, request, pk=None):
        """
        GET /blogs/blogimages/<id>/resolved_translation/?lang=xx
        Returns:
        {
          id, src, width, height, mime_type, bytes, is_primary,
          focal_x, focal_y, dominant_color, blurhash,
          resolved: { alt, title, ariaLabel, caption, longDescription }
        }
        """
        image = self.get_object()

        # 1) pick language: ?lang=, X-Language header, request current lang, fallback 'en'
        lang = (
            request.query_params.get("lang")
            or request.headers.get("X-Language")
            or get_language()
            or "en"
        )
        lang = (lang or "en")[:2]
        from blog.models import LANGUAGE_CHOICES
        valid_langs = {code for code, _ in LANGUAGE_CHOICES}
        if lang not in valid_langs:
            lang = "en"

        # 2) section translation (fallback for alt if needed)
        section_tx = image.section.translations.filter(language=lang).first()

        # 3) resolved accessibility/SEO attrs
        resolved = image.get_resolved_attrs(lang=lang, section_fallback=section_tx)

        # 4) absolute image URL + tech/meta
        src = image.image.url if image.image else None

        data = {
            "id": image.pk,
            "src": src,
            "width": image.width,
            "height": image.height,
            "mime_type": image.mime_type or "",
            "bytes": image.bytes,
            "is_primary": image.is_primary,
            "focal_x": image.focal_x,
            "focal_y": image.focal_y,
            "dominant_color": image.dominant_color or "",
            "blurhash": image.blurhash or "",
            "resolved_translation": {
                "alt": resolved.get("alt", "")[:255],
                "title": resolved.get("title", "")[:255],
                "ariaLabel": resolved.get("ariaLabel", "")[:255],
                "caption": resolved.get("caption", ""),
                "longDescription": resolved.get("longDescription", ""),
            },
        }
        return Response(data)

    @action(detail=True, methods=['post'], url_path='upload-image')
    def upload_image(self, request, pk=None):
        blog_image = self.get_object()

        # 👇 Add this for debug
        blog_image.image.storage = default_storage
        if 'image' not in request.FILES:
            return Response({"detail": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        image = request.FILES['image']
        blog_image.image.save(image.name, image, save=True)

        # 🧠 Generate and save thumbnail manually
        try:

            from PIL import Image
            from io import BytesIO
            from django.core.files.base import ContentFile
            img = Image.open(blog_image.image)
            img.thumbnail((400, 200))
            if img.mode != 'RGB':
                img = img.convert('RGB')


            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=80)
            buffer.seek(0)
            filename = f"thumb_{os.path.basename(blog_image.image.name)}"

            # Replace existing thumbnail if needed
            if blog_image.image_small:
                blog_image.image_small.delete(save=False)

            blog_image.image_small.save(filename, ContentFile(buffer.read()), save=True)
        except Exception as e:
            return Response({"detail": f"Thumbnail generation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "detail": "Main image uploaded successfully",
            "thumbnail": blog_image.image_small.url if blog_image.image_small else None,
            "image": blog_image.image.url if blog_image.image else None
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["delete"], url_path="remove-image")
    def remove_image(self, request, pk=None):
        blog_image = self.get_object()
        blog_image.image.delete(save=True)
        blog_image.image_small.delete(save=True)
        return Response({"detail": "Image removed"})
    

    @action(detail=True, methods=['post'], url_path='change-image-name')
    def change_image_name(self, request, pk=None):
        blog_image = self.get_object()
        new_name_raw = (request.data.get('new_name') or '').strip()
        if not new_name_raw:
            return Response({"detail": "New name is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not blog_image.image:
            return Response({"detail": "No image to rename"}, status=status.HTTP_400_BAD_REQUEST)

        storage = blog_image.image.storage  # respects your configured default (e.g., S3Boto3Storage)
        old_key = blog_image.image.name

        # Build new key in the same directory, slugify the base, preserve extension
        base_dir = os.path.dirname(old_key)
        _, ext = os.path.splitext(old_key)
        safe_base = slugify(new_name_raw) or "image"
        new_key = os.path.join(base_dir, f"{safe_base}{ext}")

        # Avoid collisions
        i = 2
        base_candidate = safe_base
        while storage.exists(new_key):
            new_key = os.path.join(base_dir, f"{base_candidate}-{i}{ext}")
            i += 1

        try:
            # --- Rename main image (copy -> delete) ---
            renamed = self._copy_then_delete(storage, old_key, new_key)

            if not renamed:
                return Response({"detail": "Failed to rename image"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # (Optional) rename thumbnail similarly if present
            if blog_image.image_small:
                old_thumb_key = blog_image.image_small.name
                thumb_dir = os.path.dirname(old_thumb_key)
                thumb_base, thumb_ext = os.path.splitext(os.path.basename(old_thumb_key))
                # keep your existing prefix if you like; here we ensure it mirrors the main name
                new_thumb_key = os.path.join(thumb_dir, f"thumb_{os.path.basename(new_key)}")
                if old_thumb_key != new_thumb_key:
                    self._copy_then_delete(storage, old_thumb_key, new_thumb_key)
                    blog_image.image_small.name = new_thumb_key

            # Update model field paths (DB)
            blog_image.image.name = new_key
            blog_image.save(update_fields=['image', 'image_small'] if blog_image.image_small else ['image'])

            return Response({
                "detail": "Image name changed successfully",
                "image": blog_image.image.url if blog_image.image else None,
                "thumbnail": blog_image.image_small.url if blog_image.image_small else None
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": f"Rename failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def _copy_then_delete(self, storage, old_key: str, new_key: str) -> bool:
        """
        Copy object at old_key to new_key using the underlying storage.
        For S3: server-side copy (no download). For local/other: read&save.
        Returns True on success.
        """
        try:
            # S3Boto3Storage branch (no download)
            from storages.backends.s3boto3 import S3Boto3Storage  # type: ignore
            if isinstance(storage, S3Boto3Storage):
                bucket = storage.bucket
                # Normalize keys (django-storages uses these helpers internally)
                old_norm = storage._normalize_name(old_key)
                new_norm = storage._normalize_name(new_key)

                # Extra params (e.g., ContentType/ACL) from storage’s config
                extra_args = storage.get_object_parameters(name=new_norm) or {}

                # Use low-level client to copy within the same bucket
                client = storage.connection.meta.client
                client.copy(
                    {'Bucket': bucket.name, 'Key': old_norm},
                    bucket.name,
                    new_norm,
                    ExtraArgs=extra_args
                )
                # Delete old
                storage.delete(old_key)
                return True

        except Exception:
            # Fall back to generic approach below
            pass

        # Generic fallback (works for FileSystemStorage, etc.): download -> save -> delete
        try:
            with storage.open(old_key, 'rb') as f:
                storage.save(new_key, f)
            storage.delete(old_key)
            return True
        except Exception:
            return False


class BlogImageTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = BlogImageTranslation.objects.all()
    serializer_class = BlogImageTranslationModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["language", "caption"]
    ordering_fields = ["language", "created_at", "updated_at"]
    ordering = ["language", "-created_at"]


class BlogSectionTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = BlogSectionTranslation.objects.all()
    serializer_class = BlogSectionTranslationModelSerializer
    filterset_class = BlogSectionTranslationFilterSet
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["heading", "language"]
    ordering_fields = ["created_at", "updated_at", "language"]
    ordering = ["language", "created_at"]


class BlogSectionModelViewSet(viewsets.ModelViewSet):
    queryset = BlogSection.objects.all()
    # queryset = (BlogSection.objects
    #     .select_related('post', 'video')
    #     .prefetch_related('translations', 'video__translations', 'video__caption_tracks')
    # )
    serializer_class = BlogSectionModelSerializer
    filterset_class = BlogSectionFilterSet
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering_fields = ["order"]
    ordering = ["order"]

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder_sections(self, request):
        """
        Expects: [{id: 3, order: 0}, {id: 2, order: 1}, ...]
        """
        data = request.data
        for item in data:
            BlogSection.objects.filter(id=item["id"]).update(order=item["order"])
        return Response({"detail": "Order updated"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='types')
    def types(self, request):
        # returns: [{ "value": "text", "label": "Text Only" }, ...]
        data = [{"value": v, "label": l} for v, l in SectionType.choices]
        return Response(data)


class BlogPostTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = BlogPostTranslation.objects.all()
    serializer_class = BlogPostTranslationModelSerializer
    filterset_class = BlogPostTranslationFilterSet
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["title", "slug", "language"]
    ordering_fields = ["language", "created_at", "updated_at"]
    ordering = ["language", "-updated_at", "-created_at"]


class BlogPostModelViewSet(PublicReadMixin, viewsets.ModelViewSet):
    # queryset = BlogPost.objects.prefetch_related(
    #     "translations", "sections__translations", "sections__images"
    #     ).all()
    queryset = (BlogPost.objects
        .prefetch_related(
            'translations',
            'sections__translations',
            'sections__images', 'sections__images__translations',
            'sections__video', 
            'sections__video__translations',
            'sections__video__caption_tracks',
        )
    )

    serializer_class = BlogPostModelSerializer
    filterset_class = BlogPostFilterSet
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["slug", 
                    "translations__title",
                    "translations__short_description",
                    "translations__seo_title",
                    "translations__seo_description",
                    "sections__translations__heading",
                    "sections__translations__body",
                    "tags__name", 
                    "category__name",
                    "sections__video__translations__title",
                    "sections__video__translations__caption",
                    "sections__video__translations__description",
                    "tags__name",
                    "category__name",
                    ]
    ordering_fields = ["created_at", "updated_at", "published_at", "slug", "views_count", "priority"]  # +views_count,+priority

    ordering = ["-updated_at", "-created_at", "-published_at"]

    def filter_queryset(self, queryset):
        # Avoid pagination glitches from JOINs
        return super().filter_queryset(queryset).distinct()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        context["lang"] = self.request.query_params.get("lang", "en")
        # pass an optional fallback language (e.g. 'en'); omit or set to '' to disable
        context["fallback_lang"] = self.request.query_params.get("fallback", "en")
        return context

    @action(detail=False, methods=["get"], url_path="localized")
    def localized(self, request, *args, **kwargs):
        lang = request.query_params.get("lang")
        if not lang:
            return Response({"detail": "Language (?lang=xx) is required"}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.filter_queryset(self.get_queryset().filter(is_published=True))

        # ✅ use DRF pagination helpers
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = BlogPostLocalizedModelSerializer(page, many=True, context={"lang": lang, "request": request})
            return self.get_paginated_response(serializer.data)

        # no paginator configured -> fallback to full list
        serializer = BlogPostLocalizedModelSerializer(queryset, many=True, context={"lang": lang, "request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="localized")
    def localized_single(self, request, pk=None):
        lang = request.query_params.get("lang")
        if not lang:
            return Response({"detail": "Language (?lang=xx) is required"}, status=status.HTTP_400_BAD_REQUEST)

        post = self.get_object()
        serializer = BlogPostLocalizedModelSerializer(post, context={"lang": lang, "request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["get"], url_path="seo")
    def seo_metadata(self, request, pk=None):
        post = self.get_object()
        lang = request.query_params.get("lang", "en")
        trans = post.translations.filter(language=lang).first()

        title = getattr(trans, 'seo_title', '') or getattr(trans, 'title', '')
        description = getattr(trans, 'seo_description', '') or getattr(trans, 'short_description', '')

        data = {
            "title": title,
            "description": description,
            "image": post.main_image.url if post.main_image else None,  # S3 absolute
        }
        return Response(data)
    
    @action(detail=True, methods=['get'], url_path='increment-view')
    def increment_view(self, request, pk=None):
        post = self.get_object()
        post.views_count = models.F('views_count') + 1
        post.save(update_fields=['views_count'])
        post.refresh_from_db(fields=['views_count'])
        return Response({'views_count': post.views_count})
    
    @action(detail=True, methods=['post'], url_path='upload-main-image')
    def upload_main_image(self, request, pk=None):
        post = self.get_object()

        # 👇 Add this for debug
        post.main_image.storage = default_storage
        if 'main_image' not in request.FILES:
            return Response({"detail": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        main_image = request.FILES['main_image']
        post.main_image.save(main_image.name, main_image, save=True)

        # 🧠 Generate and save thumbnail manually
        try:

            from PIL import Image
            from io import BytesIO
            from django.core.files.base import ContentFile
            img = Image.open(post.main_image)
            img.thumbnail((400, 200))
            if img.mode != 'RGB':
                img = img.convert('RGB')


            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=80)
            buffer.seek(0)
            filename = f"thumb_{os.path.basename(post.main_image.name)}"

            # Replace existing thumbnail if needed
            if post.main_image_small:
                post.main_image_small.delete(save=False)

            post.main_image_small.save(filename, ContentFile(buffer.read()), save=True)
        except Exception as e:
            return Response({"detail": f"Thumbnail generation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "detail": "Main image uploaded successfully",
            "thumbnail": post.main_image_small.url if post.main_image_small else None,
            "main_image": post.main_image.url if post.main_image else None
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["delete"], url_path="remove-main-image")
    def remove_main_image(self, request, pk=None):
        post = self.get_object()
        post.main_image.delete(save=True)
        post.main_image_small.delete(save=True)
        return Response({"detail": "Main image removed"})
    
    # Public Blog Post Endpoints
    @action(detail=False, methods=['get'], url_path=r'by-translation-slug/(?P<slug>[^/]+)')
    def by_translation_slug(self, request, slug=None):
        lang = request.query_params.get("lang")
        if not lang:
            return Response({"detail": "Language (?lang=xx) is required"}, status=status.HTTP_400_BAD_REQUEST)

        qs = self.get_queryset().filter(is_published=True,
                      translations__slug=slug,
                      translations__language=lang)

        post = get_object_or_404(qs)
        # ensure serializer context carries the same lang/fallback
        ctx = self.get_serializer_context()
        ctx["lang"] = lang
        serializer = PublicBlogPostLocalizedModelSerializer(post, context=ctx)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='related')
    def related(self, request, pk=None):
        lang = request.query_params.get('lang', 'en')
        try:
            limit = int(request.query_params.get('limit', 4))
        except ValueError:
            limit = 4

        post = self.get_object()

        # key = f"related:{post.id}:{lang}:{limit}"
        # data = cache.get(key)
        # if data is not None:
        #     return Response(data, status=status.HTTP_200_OK)

        items = BlogPost.objects.get_related(post, lang, limit)  # <- manager handles fallbacks
        ser = RelatedPostSerializer(items, many=True, context={'lang': lang})
        data = ser.data

        # if data:  # don’t cache empty
        #     cache.set(key, data, 60 * 10)

        return Response(data, status=status.HTTP_200_OK)


class FaqItemModelViewSet(viewsets.ModelViewSet):
    queryset = FaqItem.objects.all()
    serializer_class = FaqItemModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["anchor", "internal_note", "translations__question", "translations__answer"]
    ordering_fields = ["order", "created_at", "updated_at", "is_expanded_by_default", "anchor", "is_featured"]
    ordering = ["order", "anchor"]

    @action(detail=False, methods=["POST"], url_path="bulk_reorder")
    def bulk_reorder(self, request, *args, **kwargs):
        """
        Reorder many items within a section in one shot.
        Expected payload:
        {
          "section": <int>,
          "items": [{"id": <int>, "order": <int>}, ...]
        }
        """
        section_id = request.data.get("section")
        items = request.data.get("items", [])

        if not section_id or not isinstance(items, list) or not items:
            return Response({"detail": "Provide 'section' and non-empty 'items'."},
                            status=status.HTTP_400_BAD_REQUEST)

        id_to_order = {}
        for row in items:
            try:
                _id = int(row["id"])
                _order = int(row["order"])
            except (KeyError, TypeError, ValueError):
                return Response({"detail": "Each item must have integer 'id' and 'order'."},
                                status=status.HTTP_400_BAD_REQUEST)
            id_to_order[_id] = _order

        with transaction.atomic():
            qs = FaqItem.objects.select_for_update().filter(section_id=section_id, id__in=id_to_order.keys())
            if qs.count() != len(id_to_order):
                return Response({"detail": "Some IDs do not belong to the specified section or do not exist."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Phase 1: assign temp orders to avoid unique-like clashes
            temp_case = Case(
                *[When(id=_id, then=(id_to_order[_id] + 100000)) for _id in id_to_order],
                output_field=IntegerField(),
            )
            qs.update(order=temp_case)

            # Phase 2: assign final orders
            final_case = Case(
                *[When(id=_id, then=id_to_order[_id]) for _id in id_to_order],
                output_field=IntegerField(),
            )
            qs.update(order=final_case)

        # Return the updated list (ordered)
        updated = FaqItem.objects.filter(section_id=section_id).order_by("order", "id")
        serializer = self.get_serializer(updated, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["POST"], url_path="move")
    def move(self, request, pk=None, *args, **kwargs):
        """
        Move a single item to a new order within its section.
        Expected payload: { "order": <int> }
        """
        try:
            new_order = int(request.data.get("order"))
        except (TypeError, ValueError):
            return Response({"detail": "Provide integer 'order'."},
                            status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            item = self.get_queryset().select_for_update().get(pk=pk)
            section_id = item.section_id

            siblings = FaqItem.objects.select_for_update().filter(section_id=section_id).order_by("order", "id")
            count = siblings.count()
            if count == 0:
                serializer = self.get_serializer(item)
                return Response(serializer.data)

            # clamp new_order to [0, count-1]
            new_order = max(0, min(new_order, count - 1))
            old_order = item.order

            if new_order == old_order:
                serializer = self.get_serializer(item)
                return Response(serializer.data, status=status.HTTP_200_OK)

            if new_order < old_order:
                # shift down: [new, old-1] +1
                FaqItem.objects.filter(
                    section_id=section_id,
                    order__gte=new_order,
                    order__lt=old_order
                ).update(order=F("order") + 1)
            else:
                # shift up: (old+1, new] -1
                FaqItem.objects.filter(
                    section_id=section_id,
                    order__gt=old_order,
                    order__lte=new_order
                ).update(order=F("order") - 1)

            item.order = new_order
            item.save(update_fields=["order", "updated_at"])

        serializer = self.get_serializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FaqItemTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = FaqItemTranslation.objects.all()
    serializer_class = FaqItemTranslationModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["language", "question", "answer"]
    ordering_fields = ["language", "created_at", "updated_at"]
    ordering = ["language", "-created_at"]



class FaqLibraryItemModelViewSet(viewsets.ModelViewSet):
    queryset = FaqLibraryItem.objects.all()
    serializer_class = FaqLibraryItemModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["internal_identifier", "key", "translations__question", "translations__answer"]
    ordering_fields = ["order", "created_at", "updated_at", "key", "id", "is_featured"]
    ordering = ["order", "id"]
    filterset_fields = ["key", "is_featured", "is_expanded_by_default"]

    def perform_create(self, serializer):
        """
        If 'order' is not provided, append to the end.
        """
        order = serializer.validated_data.get("order", None)
        if order is None:
            last = FaqLibraryItem.objects.order_by("-order").first()
            next_order = (last.order + 1) if last else 0
            serializer.save(order=next_order)
        else:
            serializer.save()

    @action(detail=False, methods=["POST"], url_path="bulk_reorder")
    def bulk_reorder(self, request, *args, **kwargs):
        """
        Reorder library items globally.
        Body:
        { "items": [ { "id": <int>, "order": <int> }, ... ] }
        """
        items = request.data.get("items", [])
        if not isinstance(items, list) or not items:
            return Response({"detail": "Provide non-empty 'items'."},
                            status=status.HTTP_400_BAD_REQUEST)

        id_to_order = {}
        try:
            for row in items:
                _id = int(row["id"])
                _order = int(row["order"])
                id_to_order[_id] = _order
        except (KeyError, TypeError, ValueError):
            return Response({"detail": "Each item must include integer 'id' and 'order'."},
                            status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            qs = FaqLibraryItem.objects.select_for_update().filter(id__in=id_to_order.keys())
            if qs.count() != len(id_to_order):
                return Response({"detail": "Some IDs do not exist."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Phase 1: shift far to avoid unique collisions
            temp_case = Case(
                *[When(id=_id, then=id_to_order[_id] + 100000) for _id in id_to_order],
                output_field=IntegerField(),
            )
            qs.update(order=temp_case)

            # Phase 2: final placement
            final_case = Case(
                *[When(id=_id, then=id_to_order[_id]) for _id in id_to_order],
                output_field=IntegerField(),
            )
            qs.update(order=final_case)

        updated = FaqLibraryItem.objects.order_by("order", "id")
        ser = self.get_serializer(updated, many=True)
        return Response(ser.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["POST"], url_path="move")
    def move(self, request, pk=None, *args, **kwargs):
        """
        Move a single item to a new order index. Returns the moved item.
        Body: { "order": <int> }
        """
        try:
            new_order = int(request.data.get("order"))
        except (TypeError, ValueError):
            return Response({"detail": "Body must include integer 'order'."},
                            status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # lock all to recalc safely
            items = list(FaqLibraryItem.objects.select_for_update().order_by("order", "id"))
            ids = [i.id for i in items]
            try:
                idx = ids.index(int(pk))
            except ValueError:
                return Response({"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

            target = items.pop(idx)
            clamped = max(0, min(new_order, len(items)))
            items.insert(clamped, target)

            # reassign sequential orders
            id_to_order = {itm.id: i for i, itm in enumerate(items)}
            order_case = Case(
                *[When(id=_id, then=pos) for _id, pos in id_to_order.items()],
                output_field=IntegerField(),
            )
            FaqLibraryItem.objects.filter(id__in=id_to_order.keys()).update(order=order_case)

        # return moved item fresh
        obj = FaqLibraryItem.objects.get(pk=pk)
        ser = self.get_serializer(obj)
        return Response(ser.data, status=status.HTTP_200_OK)


class FaqLibraryItemTranslationModelViewSet(viewsets.ModelViewSet):
    queryset = FaqLibraryItemTranslation.objects.all()
    serializer_class = FaqLibraryItemTranslationModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ["language", "question", "answer", "item__key", "item__internal_identifier"]
    ordering_fields = ["language", "id"]
    ordering = ["language", "id"]
    filterset_fields = ["item", "language"]
    

class BlogPostFaqLinkModelViewSet(viewsets.ModelViewSet):
    """
    Attach library FAQs to a blog post; maintain order.
    """
    queryset = BlogPostFaqLink.objects.select_related("faq_item", "blog_post")
    serializer_class = BlogPostFaqLinkModelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = [
        "faq_item__key",
        "faq_item__internal_identifier",
        "faq_item__translations__question",
        "faq_item__translations__answer",
    ]
    ordering_fields = ["order", "id"]
    ordering = ["order", "id"]
    filterset_fields = ["blog_post", "faq_item"]

    # @action(detail=False, methods=["POST"], url_path="bulk_reorder")
    # def bulk_reorder(self, request, *args, **kwargs):
    #     """
    #     Reorder many links within a single blog post.
    #     Body:
    #     {
    #       "blog_post": <int>,
    #       "items": [{"id": <int>, "order": <int>}, ...]
    #     }
    #     """
    #     blog_post_id = request.data.get("blog_post")
    #     items = request.data.get("items", [])

    #     if not blog_post_id or not isinstance(items, list) or not items:
    #         return Response({"detail": "Provide 'blog_post' and non-empty 'items'."},
    #                         status=status.HTTP_400_BAD_REQUEST)

    #     id_to_order = {}
    #     for row in items:
    #         try:
    #             _id = int(row["id"])
    #             _order = int(row["order"])
    #         except (KeyError, TypeError, ValueError):
    #             return Response({"detail": "Each item must have integer 'id' and 'order'."},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #         id_to_order[_id] = _order

    #     with transaction.atomic():
    #         qs = BlogPostFaqLink.objects.select_for_update().filter(
    #             blog_post_id=blog_post_id,
    #             id__in=id_to_order.keys()
    #         )
    #         if qs.count() != len(id_to_order):
    #             return Response({"detail": "Some IDs do not belong to the specified blog post or do not exist."},
    #                             status=status.HTTP_400_BAD_REQUEST)

    #         # two-phase to avoid collisions
    #         temp_case = Case(
    #             *[When(id=_id, then=(id_to_order[_id] + 100000)) for _id in id_to_order],
    #             output_field=IntegerField(),
    #         )
    #         qs.update(order=temp_case)

    #         final_case = Case(
    #             *[When(id=_id, then=id_to_order[_id]) for _id in id_to_order],
    #             output_field=IntegerField(),
    #         )
    #         qs.update(order=final_case)

    #     updated = BlogPostFaqLink.objects.filter(blog_post_id=blog_post_id).order_by("order", "id")
    #     ser = self.get_serializer(updated, many=True)
    #     return Response(ser.data, status=status.HTTP_200_OK)

    # @action(detail=False, methods=["GET"], url_path="resolved")
    # def resolved(self, request, *args, **kwargs):
    #     """
    #     Returns resolved Q/A for a given blog post & language using library translations.
    #     Query params: ?blog_post=<id>&language=en
    #     """
    #     blog_post_id = request.query_params.get("blog_post")
    #     lang = request.query_params.get("language") or "en"

    #     if not blog_post_id:
    #         return Response({"detail": "Query param 'blog_post' is required."},
    #                         status=status.HTTP_400_BAD_REQUEST)

    #     links = (BlogPostFaqLink.objects
    #              .filter(blog_post_id=blog_post_id)
    #              .select_related("faq_item")
    #              .prefetch_related("faq_item__translations")
    #              .order_by("order", "id"))

    #     resolved = []
    #     for link in links:
    #         translations = list(link.faq_item.translations.all())
    #         # exact language, else fallback to EN
    #         tx = next((t for t in translations if t.language == lang), None) or \
    #              next((t for t in translations if t.language == "en"), None)

    #         question = tx.question if tx else ""
    #         answer = tx.answer if tx else ""

    #         resolved.append({
    #             "id": link.id,
    #             "order": link.order,
    #             "faq_item": link.faq_item_id,
    #             "language": (tx.language if tx else lang),
    #             "question": question,
    #             "answer": answer,
    #         })

    #     serializer = ResolvedFaqSerializer(resolved, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Disallow: /private/",
        "Disallow: /passwordreset/",
        "Disallow: /passwordresetconfirm/",
        "Disallow: /unauthorized/",
        "",
        "Sitemap: https://airporttransferhub.com/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")
