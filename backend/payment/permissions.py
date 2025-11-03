from __future__ import annotations

from rest_framework import permissions


class IsPaymentStaff(permissions.BasePermission):
    message = "Only payment staff can perform this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return user.has_perm("payment.manage_payments")


class IsAuthenticatedPaymentUser(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

