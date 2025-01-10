from rest_framework import serializers

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