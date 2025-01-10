from django_filters import rest_framework as filters

from .models import (
   EuroRate, PopularRoute
) 


class EuroRateFilterSet(filters.FilterSet):
    class Meta:
        model = EuroRate
        fields = '__all__'


class PopularRouteFilterSet(filters.FilterSet):
    class Meta:
        model = PopularRoute
        fields = '__all__'