from django_filters import rest_framework as filters

from .models import (
    EuroRate,
    PopularRoute,
    Currency,
) 


class EuroRateFilterSet(filters.FilterSet):
    class Meta:
        model = EuroRate
        fields = '__all__'


class PopularRouteFilterSet(filters.FilterSet):
    main_location = filters.CharFilter(field_name='airport__iata_code', lookup_expr='iexact')
    airport = filters.CharFilter(field_name='airport__iata_code', lookup_expr='iexact')

    class Meta:
        model = PopularRoute
        fields = (
            'airport',
            'main_location',
            'destination',
            'car_type',
        )


class CurrencyFilterSet(filters.FilterSet):
    class Meta:
        model = Currency
        fields = (
            'code',
            'is_active',
            'is_default',
        )
