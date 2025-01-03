from django.urls import path, include

from rest_framework import routers

from .views import (
    AccountModelViewSet, RoleModelViewSet, AccountRoleModelViewSet, 
    PublicAccountModelViewSet, UserColumnModelViewSet, 
)


router = routers.DefaultRouter()
router.register(r'accounts', AccountModelViewSet, basename='account')
router.register(r'publicaccounts', PublicAccountModelViewSet, basename='publicaccount')
router.register(r'roles', RoleModelViewSet)
router.register(r'accountroles', AccountRoleModelViewSet)
router.register(r'usercolumns', UserColumnModelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
