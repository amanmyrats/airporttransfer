from django.urls import path, include

from rest_framework import routers

from .views import (
    AccountModelViewSet, 
    PublicAccountModelViewSet, UserColumnModelViewSet, 
    RoleChoicesAPIView, 
)


router = routers.DefaultRouter()
router.register(r'accounts', AccountModelViewSet, basename='account')
router.register(r'publicaccounts', PublicAccountModelViewSet, basename='publicaccount')
router.register(r'usercolumns', UserColumnModelViewSet)

urlpatterns = [
    path('', include(router.urls)), 
    path('rolechoices/', RoleChoicesAPIView.as_view(), name='role-choices'),
]
