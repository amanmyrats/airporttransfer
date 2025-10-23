from django.contrib.sitemaps import Sitemap
from .models import BlogPostTranslation


class BlogPostTranslationSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return BlogPostTranslation.objects.filter(
            section__post__is_published=True,
            section__post__slug__isnull=False,
            slug__isnull=False
        ).select_related("section", "section__post")

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f"/{obj.language}/blogs/{obj.section.post.slug}"
