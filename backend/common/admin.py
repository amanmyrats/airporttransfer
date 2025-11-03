from django.contrib import admin

from .models import EuroRate, PopularRoute


@admin.register(EuroRate)
class EuroRateAdmin(admin.ModelAdmin):
    search_fields = ("currency_code",)
    list_display = ("currency_code", "euro_rate", "updated_at")


@admin.register(PopularRoute)
class PopularRouteAdmin(admin.ModelAdmin):
    search_fields = ("main_location", "destination", "car_type")
    list_display = ("main_location", "destination", "car_type", "euro_price")
    list_filter = ("main_location", "car_type")
