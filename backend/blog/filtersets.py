from django_filters import rest_framework as filters
from .models import (
    BlogPost, BlogPostTranslation,
    BlogSection, BlogSectionTranslation,
    BlogImage, BlogCategory, SectionType, 
)


class BlogPostFilterSet(filters.FilterSet):
    start_date = filters.DateFilter(field_name='published_at', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='published_at', lookup_expr='lte')
    tag = filters.CharFilter(field_name='tags__name', lookup_expr='iexact')
    has_video = filters.BooleanFilter(method='filter_has_video')

    class Meta:
        model = BlogPost
        fields = ['is_published', 'category', 'start_date', 'end_date', 'has_video'] + [
            field.name for field in BlogPost._meta.fields if field.name not in ['main_image', 'main_image_small']
        ]

    def filter_has_video(self, qs, name, value):
        if value:
            return qs.filter(sections__section_type=SectionType.VIDEO).distinct()
        return qs


class BlogPostTranslationFilterSet(filters.FilterSet):
    class Meta:
        model = BlogPostTranslation
        fields = ['language', 'slug', 'title']


class BlogSectionFilterSet(filters.FilterSet):
    class Meta:
        model = BlogSection
        fields = ['post', 'section_type', 'order']


class BlogSectionTranslationFilterSet(filters.FilterSet):
    class Meta:
        model = BlogSectionTranslation
        fields = ['language', 'heading']


class BlogImageFilterSet(filters.FilterSet):
    class Meta:
        model = BlogImage
        fields = ['section', 'is_primary']
