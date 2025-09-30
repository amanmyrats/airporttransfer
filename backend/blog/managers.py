from django.db import models
from django.db.models import (
    Count, Q, Case, When, Value, IntegerField, FloatField, F, ExpressionWrapper
)

class BlogPostQuerySet(models.QuerySet):
    def related_to(self, post, lang: str):
        """Primary relevance scorer (queryset)."""
        post_tag_ids = list(post.tags.values_list('id', flat=True))
        # print("Post tag IDs:", post_tag_ids)  # Debugging line
        return (
            self.exclude(id=post.id)
            .filter(
                is_published=True,
                # published_at__isnull=False,
                translations__language=lang,  # must have this language
            )
            .annotate(
                tag_overlap=Count('tags', filter=Q(tags__in=post_tag_ids), distinct=True),
                category_match=Case(
                    When(category=post.category, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
                featured_boost=Case(
                    When(featured=True, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
                priority_weight=ExpressionWrapper(
                    (F('priority') * 1.0) / Value(10.0),
                    output_field=FloatField(),
                ),
            )
            .annotate(
                relevance=F('tag_overlap') * 2
                          + F('category_match') * 1
                          + F('featured_boost') * 0.5
                          + F('priority_weight')
            )
            .order_by('-relevance', '-published_at', '-views_count')
            .distinct()
        )

    def get_related(self, post, lang: str, limit: int = 4):
        """
        Tiered fallback that never returns empty:
        1) relevance (related_to)
        2) recent in same category (in lang)
        3) recent in any category (in lang)
        Returns a Python list to preserve chosen order without DB UNION quirks.
        """
        # print(f"Getting related posts for Post ID {post.id} in language '{lang}' with limit {limit}")
        # Tier 1
        tier1_qs = (
            self.related_to(post, lang)
            .select_related('category')
            .prefetch_related('tags', 'translations')
        )
        # print("Tier 1 QS:", tier1_qs)  # Debugging line

        result = []
        seen = set()

        def extend_unique(qs, needed):
            nonlocal result
            if needed <= 0:
                return
            for obj in qs:
                if obj.id in seen:
                    continue
                seen.add(obj.id)
                result.append(obj)
                if len(result) >= limit:
                    break

        extend_unique(tier1_qs[:limit], limit)
        # print(f"After Tier 1, found {len(result)} items.")  # Debugging line

        # Tier 2 + Tier 3 base
        if len(result) < limit:
            base_recent = (
                self.exclude(id=post.id)
                .filter(
                    is_published=True,
                    # published_at__isnull=False,
                    translations__language=lang,
                )
                .select_related('category')
                .prefetch_related('tags', 'translations')
                .order_by('-published_at', '-views_count')
            )

            # Tier 2: same category
            if post.category_id and len(result) < limit:
                extend_unique(base_recent.filter(category_id=post.category_id)[: (limit - len(result))],
                              limit - len(result))

            # Tier 3: any category (excluding same category to diversify if tier2 was used)
            if len(result) < limit:
                qs_any = base_recent
                if post.category_id:
                    qs_any = qs_any.exclude(category_id=post.category_id)
                extend_unique(qs_any[: (limit - len(result))], limit - len(result))
        # print(f"After Tier 2 and 3, found {len(result)} items.")  # Debugging line
        return result


# class BlogPostManager(models.Manager.from_queryset(BlogPostQuerySet)):
#     pass
