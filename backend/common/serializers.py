from rest_framework import serializers

from common.utils import transform_choices_to_key_value_pairs
from .models import (
    EuroRate, PopularRoute, Airport, Currency,
) 


class EuroRateModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EuroRate
        fields = '__all__'


class EuroRateSimpleSerializer(serializers.ModelSerializer):
    code = serializers.CharField(source='currency_code')
    rate = serializers.DecimalField(source='euro_rate', max_digits=10, decimal_places=4)

    class Meta:
        model = EuroRate
        fields = ('code', 'rate')


class CurrencyModelSerializer(serializers.ModelSerializer):
    euro_rate = serializers.SerializerMethodField()

    class Meta:
        model = Currency
        fields = (
            'id',
            'code',
            'name',
            'symbol',
            'is_active',
            'is_default',
            'euro_rate',
            'created_at',
            'updated_at',
        )

    def get_euro_rate(self, obj):
        rate = getattr(obj, 'current_rate', None)
        if rate is not None:
            return rate
        related_rates = getattr(obj, 'rates', None)
        if hasattr(related_rates, 'first'):
            instance = related_rates.order_by('-updated_at').first()
            if instance:
                return instance.euro_rate
        return None


class AirportModelSerializer(serializers.ModelSerializer):
    code = serializers.CharField(source='iata_code', read_only=True)

    class Meta:
        model = Airport
        fields = (
            'id',
            'code',
            'iata_code',
            'icao_code',
            'name',
            'city',
            'state',
            'country',
            'timezone',
            'latitude',
            'longitude',
            'elevation_meters',
            'website',
            'phone',
            'description',
            'is_active',
            'created_at',
            'updated_at',
        )


class PopularRouteModelSerializer(serializers.ModelSerializer):
    airport = serializers.SlugRelatedField(
        slug_field='iata_code',
        queryset=Airport.objects.all(),
        allow_null=True,
        required=False,
    )
    airport_detail = AirportModelSerializer(source='airport', read_only=True)

    class Meta:
        model = PopularRoute
        fields = (
            'id',
            'airport',
            'airport_detail',
            'main_location',
            'destination',
            'car_type',
            'euro_price',
        )
        read_only_fields = ('main_location',)
