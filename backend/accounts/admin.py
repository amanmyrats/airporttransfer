from django.contrib import admin

from .models import Account, UserColumn


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    search_fields = ("email", "first_name", "last_name")
    list_display = ("email", "first_name", "last_name", "is_active", "is_staff")
    list_filter = ("is_active", "is_staff", "is_client", "role")


@admin.register(UserColumn)
class UserColumnAdmin(admin.ModelAdmin):
    list_display = ("user", "table_name", "field", "header", "is_visible")
    search_fields = ("user__email", "table_name", "field", "header")
