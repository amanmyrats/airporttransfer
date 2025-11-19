

from django.urls import path, include
from rest_framework import routers

from .views import (
    EuroRateModelViewSet,
    PopularRouteModelViewSet,
    AirportModelViewSet,
    CurrencyModelViewSet,
    CurrencyChoicesAPIView,
    MainLocationChoicesAPIView,
    CarTypeChoicesAPIView,
)


app_name = 'common'

router = routers.DefaultRouter()
router.register(r'eurorates', EuroRateModelViewSet)
router.register(r'popularroutes', PopularRouteModelViewSet)
router.register(r'airports', AirportModelViewSet)
router.register(r'currencies', CurrencyModelViewSet)

urlpatterns = [
    path('', include(router.urls)), 
    path('currencychoices/', CurrencyChoicesAPIView.as_view(), name='currency-choices'),
    path('mainlocationchoices/', MainLocationChoicesAPIView.as_view(), name='main-location-choices'),
    path('cartypechoices/', CarTypeChoicesAPIView.as_view(), name='car-type-choices'),
]
