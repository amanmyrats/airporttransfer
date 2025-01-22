from django.urls import path, include
from rest_framework import routers

from .views import (
    ReservationModelViewSet, StatusChoicesAPIView, 
    BookingCreateAPIView, 
    ContactUsModelViewSet, 
    SendMessageAPIView, 
)


app_name = 'transfer'

router = routers.DefaultRouter()
router.register(r'reservations', ReservationModelViewSet)
router.register(r'contactusmessages', ContactUsModelViewSet)


urlpatterns = [
    path('', include(router.urls)), 
    path('statuschoices/', StatusChoicesAPIView.as_view(), name='status-choices'), 
    path('bookingcreate/', BookingCreateAPIView.as_view(), name='booking-create'), 
    path('sendmessage/', SendMessageAPIView.as_view(), name='send-message'),
]
