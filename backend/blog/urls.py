from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.contrib.sitemaps.views import sitemap
from blog.sitemaps import BlogPostTranslationSitemap
from .views import (
    BlogPostModelViewSet,
    BlogPostTranslationModelViewSet,
    BlogSectionModelViewSet,
    BlogSectionTranslationModelViewSet,
    BlogImageModelViewSet,
    BlogCategoryModelViewSet,
    BlogTagModelViewSet, 
    BlogImageTranslationModelViewSet, 
    FaqItemModelViewSet, FaqItemTranslationModelViewSet, 
    FaqLibraryItemModelViewSet,
    FaqLibraryItemTranslationModelViewSet,
    BlogPostFaqLinkModelViewSet,
)

from .views_video import (
    BlogVideoModelViewSet,
    BlogVideoTranslationModelViewSet,
    BlogVideoCaptionModelViewSet,
)

sitemaps = {
    'blog': BlogPostTranslationSitemap,
}
from .views_map import BlogSectionMapViewSet, BlogSectionMapTranslationViewSet


router = DefaultRouter()
router.register(r'blogposts', BlogPostModelViewSet, basename='blogpost')
router.register(r'blogposttranslations', BlogPostTranslationModelViewSet, basename='blogposttranslation')
router.register(r'blogsections', BlogSectionModelViewSet, basename='blogsection')
router.register(r'blogsectiontranslations', BlogSectionTranslationModelViewSet, basename='blogsectiontranslation')
router.register(r'blogimages', BlogImageModelViewSet, basename='blogimage')
router.register(r'blogcategories', BlogCategoryModelViewSet, basename='blogcategory')
router.register(r'blogtags', BlogTagModelViewSet, basename='blogtag')
router.register(r'blogimagetranslations', BlogImageTranslationModelViewSet, basename='blogimagetranslation')
router.register(r'faqitems', FaqItemModelViewSet, basename='faqitem')
router.register(r'faqitemtranslations', FaqItemTranslationModelViewSet, basename='faqitemtranslation')
router.register(r'faqlibraryitems', FaqLibraryItemModelViewSet, basename='faqlibraryitem')
router.register(r'faqlibraryitemtranslations', FaqLibraryItemTranslationModelViewSet, basename='faqlibraryitemtranslation')
router.register(r'blogpostfaqlinks', BlogPostFaqLinkModelViewSet, basename='blogpostfaqlink')
# urls.py (extend your existing router registrations)
router.register(r'blogvideos', BlogVideoModelViewSet, basename='blogvideo')
router.register(r'blogvideotranslations', BlogVideoTranslationModelViewSet, basename='blogvideotranslation')
router.register(r'blogvideocaptions', BlogVideoCaptionModelViewSet, basename='blogvideocaption')
# map
router.register(r'section-maps', BlogSectionMapViewSet, basename='sectionmap')
router.register(r'section-map-translations', BlogSectionMapTranslationViewSet, basename='sectionmaptranslation')

urlpatterns = [
    path('', include(router.urls)),
    path("sitemap.xml", sitemap, {'sitemaps': sitemaps}, name="django_sitemap"),

]
