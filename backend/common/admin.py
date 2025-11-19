from django.contrib import admin

from .models import EuroRate, PopularRoute, Airport


@admin.register(EuroRate)
class EuroRateAdmin(admin.ModelAdmin):
    search_fields = ("currency_code",)
    list_display = ("currency_code", "euro_rate", "updated_at")


@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display = ("iata_code", "icao_code", "name", "city", "country", "is_active")
    search_fields = ("iata_code", "icao_code", "name", "city", "country")
    list_filter = ("is_active", "country")


@admin.register(PopularRoute)
class PopularRouteAdmin(admin.ModelAdmin):
    search_fields = ("airport__iata_code", "airport__name", "destination", "car_type")
    list_display = ("get_airport_label", "destination", "car_type", "euro_price")
    list_filter = ("airport", "car_type")
    list_select_related = ("airport",)

    @admin.display(description="Airport")
    def get_airport_label(self, obj):
        if obj.airport:
            return f"{obj.airport.iata_code} - {obj.airport.name}"
        return obj.main_location
