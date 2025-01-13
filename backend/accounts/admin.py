from django.contrib import admin

from .models import Account, UserColumn


admin.site.register(Account)
admin.site.register(UserColumn)