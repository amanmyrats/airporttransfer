from django.urls import path, include
from rest_framework import routers

from .views import (
    ReservationModelViewSet, StatusChoicesAPIView, 
)


app_name = 'transfer'

router = routers.DefaultRouter()
router.register(r'reservations', ReservationModelViewSet)


urlpatterns = [
    path('', include(router.urls)), 
    path('statuschoices/', StatusChoicesAPIView.as_view(), name='status-choices'),
]
