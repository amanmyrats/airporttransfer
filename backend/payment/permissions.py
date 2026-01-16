from __future__ import annotations

from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS


class IsPaymentStaff(permissions.BasePermission):
    message = "Only payment staff can perform this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        if user.role in {
            "company_admin",
            "company_yonetici",
            "company_rezervasyoncu",
            "company_employee",
        }:
            return True
        return user.has_perm("payment.manage_payments")


class IsPaymentBankAccountDetailAccess(permissions.BasePermission):
    message = "Only payment staff can perform this action."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            if user.is_staff or user.is_superuser:
                return True
            return user.role in {
                "company_admin",
                "company_yonetici",
                "company_rezervasyoncu",
                "company_employee",
            }
        if user.is_staff or user.is_superuser:
            return True
        return user.role in {
            "company_admin",
            "company_yonetici",
        }


class IsAuthenticatedPaymentUser(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)
