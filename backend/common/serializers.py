from rest_framework import serializers

from common.utils import transform_choices_to_key_value_pairs
from .models import (
    EuroRate, PopularRoute, 
) 


class EuroRateModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EuroRate
        fields = '__all__'

class PopularRouteModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopularRoute
        fields = '__all__'

