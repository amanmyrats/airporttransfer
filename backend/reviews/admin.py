from __future__ import annotations

from django.contrib import admin

from .models import Review, ReviewReply, ReviewAggregate, ReviewInvite


class ReviewReplyInline(admin.TabularInline):
    model = ReviewReply
    extra = 0
    fields = ("author", "body", "created_at")
    readonly_fields = ("author", "created_at")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "reservation", "user", "rating", "status", "is_public", "is_flagged", "created_at")
    list_filter = ("status", "route", "rating", "is_public", "is_flagged", "created_at")
    search_fields = ("title", "comment", "reservation__number", "user__email")
    autocomplete_fields = ("reservation", "user", "route")
    inlines = [ReviewReplyInline]
    ordering = ("-created_at",)


@admin.register(ReviewReply)
class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ("id", "review", "author", "created_at")
    search_fields = ("body", "review__reservation__number", "author__email")
    autocomplete_fields = ("review", "author")
    ordering = ("-created_at",)


@admin.register(ReviewAggregate)
class ReviewAggregateAdmin(admin.ModelAdmin):
    list_display = ("id", "route", "vendor", "review_count", "average_rating", "last_reviewed_at")
    search_fields = ("vendor", "route__destination")
    list_filter = ("route",)


@admin.register(ReviewInvite)
class ReviewInviteAdmin(admin.ModelAdmin):
    list_display = ("reservation", "user", "is_active", "last_sent_at", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("reservation__number", "user__email")
    autocomplete_fields = ("reservation", "user")

