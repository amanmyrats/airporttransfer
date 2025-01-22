from django_filters import rest_framework as filters

from .models import (
    Reservation, ContactUsMessage, 
) 


class ReservationFilterSet(filters.FilterSet):
    year = filters.NumberFilter(field_name='transfer_date', lookup_expr='year')
    month = filters.NumberFilter(field_name='transfer_date', lookup_expr='month')
    start_date = filters.DateFilter(field_name='transfer_date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='transfer_date', lookup_expr='lte')

    class Meta:
        model = Reservation
        # Explicitly list fields including the custom filters
        fields = ['year', 'month', 'start_date', 'end_date'] + [field.name for field in Reservation._meta.get_fields()]


class ContactUsMessageFilterSet(filters.FilterSet):
    class Meta:
        model = ContactUsMessage
        fields = [field.name for field in ContactUsMessage._meta.get_fields()]