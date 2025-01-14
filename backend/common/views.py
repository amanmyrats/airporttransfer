import datetime

from django.contrib.auth.hashers import make_password

from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.utils import timezone

from common.utils import transform_choices_to_key_value_pairs
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

    def get_authenticators(self):
        if self.request.resolver_match.view_name.endswith('list'):
            # Skip authentication for 'list' action
            return []
        # Use default authentication classes for other actions
        return super().get_authenticators()
    

class PopularRouteModelViewSet(viewsets.ModelViewSet):
    queryset = PopularRoute.objects.all()
    serializer_class = PopularRouteModelSerializer
    filterset_class = PopularRouteFilterSet
    search_fields = ('main_location', 'destination', 'car_type',)
    ordering_fields = ('main_location', 'destination', 'car_type',)
    ordering = ('main_location', 'destination', 'car_type',)

    def get_authenticators(self):
        if self.request.resolver_match.view_name.endswith('list'):
            # Skip authentication for 'list' action
            return []
        # Use default authentication classes for other actions
        return super().get_authenticators()


class CurrencyChoicesAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response(
            transform_choices_to_key_value_pairs(EuroRate.CURRENCY_CHOICES), 
            status=status.HTTP_200_OK)


class MainLocationChoicesAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response(
            transform_choices_to_key_value_pairs(PopularRoute.MAIN_LOCATION_CHOICES), 
            status=status.HTTP_200_OK)
    

class CarTypeChoicesAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        return Response(
            transform_choices_to_key_value_pairs(PopularRoute.CAR_TYPE_CHOICES), 
            status=status.HTTP_200_OK)