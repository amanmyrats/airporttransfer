from django_filters import rest_framework as filters

from .models import (
    Reservation,
    ContactUsMessage,
) 


class ReservationFilterSet(filters.FilterSet):
    year = filters.NumberFilter(field_name='transfer_date', lookup_expr='year')
    month = filters.NumberFilter(field_name='transfer_date', lookup_expr='month')
    start_date = filters.DateFilter(field_name='transfer_date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='transfer_date', lookup_expr='lte')
    transfer_date_time_from = filters.IsoDateTimeFilter(
        field_name='transfer_date_time',
        lookup_expr='gte',
    )
    transfer_date_time_to = filters.IsoDateTimeFilter(
        field_name='transfer_date_time',
        lookup_expr='lte',
    )
    reservation_year = filters.NumberFilter(field_name='reservation_date', lookup_expr='year')
    reservation_month = filters.NumberFilter(field_name='reservation_date', lookup_expr='month')
    reservation_start_date = filters.DateFilter(field_name='reservation_date', lookup_expr='gte')
    reservation_end_date = filters.DateFilter(field_name='reservation_date', lookup_expr='lte')
    latest_change_request_status = filters.CharFilter(field_name='latest_change_request_status', lookup_expr='exact')
    has_change_request = filters.BooleanFilter(field_name='has_change_request')

    class Meta:
        model = Reservation
        # Explicitly list fields including the custom filters
        fields = [
            'year',
            'month',
            'start_date',
            'end_date',
            'reservation_year',
            'reservation_month',
            'reservation_start_date',
            'reservation_end_date',
            'latest_change_request_status',
            'has_change_request',
        ] + [field.name for field in Reservation._meta.get_fields()]


class ContactUsMessageFilterSet(filters.FilterSet):
    created_at_date = filters.DateFilter(field_name='created_at', lookup_expr='date')

    class Meta:
        model = ContactUsMessage
        fields = [field.name for field in ContactUsMessage._meta.get_fields()] + ['created_at_date']
