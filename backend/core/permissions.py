from rest_framework.permissions import (
    BasePermission, IsAuthenticated, IsAdminUser
) 


class IsCompanyAdmin(IsAdminUser, BasePermission):
    """
    Permission class to restrict access to company admins for objects belonging to their company.
    """

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        # Check for authentication and company_admin role
        if not request.user.role == 'company_admin':
            return False
        return True  # Allow all actions for company admins (subject to object-level check)

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True
    

class IsCompanyYonetici(IsCompanyAdmin):
    """
    Permission class to restrict access to company yonetici for objects belonging to their company.
    """
    
    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        # Check for authentication and company_yonetici role
        if not request.user.role == 'company_yonetici':
            return False
        return True  # Allow all actions for company yonetici (subject to object-level check)

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True


class IsCompanyRezervasyoncu(IsCompanyYonetici):
    """
    Permission class to restrict access to company rezervasyoncu for objects belonging to their company.
    """
    
    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        # Check for authentication and company_rezervasyoncu role
        if not request.user.role == 'company_rezervasyoncu':
            return False
        return True  # Allow all actions for company rezervasyoncu (subject to object-level check)

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True


class IsCompanyOperasyoncu(IsCompanyRezervasyoncu):
    """
    Permission class to restrict access to company operasyoncu for objects belonging to their company.
    """
        
    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        # Check for authentication and company_operasyoncu role
        if not request.user.role == 'company_operasyoncu':
            return False
        return True  # Allow all actions for company operasyoncu (subject to object-level check)

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True
        return True
    

class IsCompanyEmployeeReadOnly(IsCompanyOperasyoncu):
    """
    Permission class to restrict access to company employees for objects belonging to their company.
    """

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True
        
        # Only allow GET requests for company employees
        if request.method != 'GET':
            return False
        
        # Check for authentication and company_employee role
        if not request.user.role == 'company_employee':
            return False
        return True  # Allow GET requests for company employees (subject to object-level check)


class IsCompanyDriverReadOnly(IsCompanyOperasyoncu):
    """
    Permission class to restrict access to company drivers for objects belonging to their company.
    """

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True
        
        # Only allow GET requests for company employees
        if request.method != 'GET':
            return False
        # Check for authentication and company_driver role
        if not request.user.role == 'company_driver':
            return False
        return True  # Allow all actions for company drivers (subject to object-level check)


