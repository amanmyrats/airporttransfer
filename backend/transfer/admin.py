from django.contrib import admin

from .models import Reservation, ContactUsMessage


admin.site.register(Reservation)
admin.site.register(ContactUsMessage)
