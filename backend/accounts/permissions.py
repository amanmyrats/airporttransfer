from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS


class IsClient(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_client)


class IsOperatorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return user.role in {
            "company_admin",
            "company_yonetici",
            "company_rezervasyoncu",
            "company_employee",
        }


class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return user.role in {"company_admin", "company_yonetici"}


class IsReviewManagerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return user.role in {
            "company_admin",
            "company_yonetici",
            "company_rezervasyoncu",
            "company_employee",
        }


class IsBlogEditorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff or user.is_superuser:
            return True
        return user.role in {"company_admin", "company_yonetici", "blogger", "seo"}
