from django.contrib import admin

from .models import Reservation, ContactUsMessage, ReservationChangeRequest


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


@admin.register(ReservationChangeRequest)
class ReservationChangeRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "reservation",
        "status",
        "cutoff_ok",
        "requires_manual_review",
        "created_by",
        "decided_by",
        "created_at",
    )
    list_filter = ("status", "cutoff_ok", "requires_manual_review", "created_at")
    search_fields = ("reservation__number", "created_by__email", "decided_by__email", "reason_code")
