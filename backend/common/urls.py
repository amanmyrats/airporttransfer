

from django.urls import path, include
from rest_framework import routers

from .views import (
    EuroRateModelViewSet, PopularRouteModelViewSet,
)


app_name = 'common'

router = routers.DefaultRouter()
router.register(r'eurorates', EuroRateModelViewSet)
router.register(r'popularroutes', PopularRouteModelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
