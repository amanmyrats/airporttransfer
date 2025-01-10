import datetime

from django.contrib.auth.hashers import make_password

from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.utils import timezone

from .serializers import (
    EuroRateModelSerializer, PopularRouteModelSerializer,
)
from .models import (
    EuroRate, PopularRoute,
)
from .filtersets import (
    EuroRateFilterSet, PopularRouteFilterSet
)


class EuroRateModelViewSet(viewsets.ModelViewSet):
    queryset = EuroRate.objects.all()
    serializer_class = EuroRateModelSerializer
    filterset_class = EuroRateFilterSet
    search_fields = ('currency_code', 'euro_rate',)
    ordering_fields = ('currency_code', 'euro_rate',)
    ordering = ('currency_code',)

    def get_permissions(self):
        if self.action == 'list':
            return []
        return [IsAdminUser()]
    

class PopularRouteModelViewSet(viewsets.ModelViewSet):
    queryset = PopularRoute.objects.all()
    serializer_class = PopularRouteModelSerializer
    filterset_class = PopularRouteFilterSet
    search_fields = ('main_location', 'to', 'euro_price',)
    ordering_fields = ('main_location', 'to', 'euro_price',)
    ordering = ('main_location',)

    def get_permissions(self):
        if self.action == 'list':
            return []
        return [IsAdminUser()]