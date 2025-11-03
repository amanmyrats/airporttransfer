from django.contrib import admin

from .models import Reservation, ContactUsMessage


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    search_fields = (
        "number",
        "passenger_name",
        "passenger_email",
        "pickup_short",
        "dest_short",
    )
    list_display = ("number", "passenger_name", "status", "transfer_date", "transfer_time")
    list_filter = ("status", "transfer_date")


@admin.register(ContactUsMessage)
class ContactUsMessageAdmin(admin.ModelAdmin):
    search_fields = ("name", "email", "phone")
    list_display = ("name", "email", "created_at")
