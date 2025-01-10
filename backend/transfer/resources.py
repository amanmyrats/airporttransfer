import logging

from import_export import resources, fields
from import_export.widgets import (
    DateWidget, TimeWidget, BooleanWidget, 
)

from .models import (
    Reservation, 
)


logger = logging.getLogger('transfertakip')

class ReservationModelResource(resources.ModelResource):
        
    def for_delete(self, row, instance):
        return row["delete (1)"] == "1"
        
    number = fields.Field(
        column_name='Rezervasyon Numarası',
        attribute='number'
    )

    amount = fields.Field(
        column_name='Rezervasyon Tutarı',
        attribute='amount'
    )

    currency_code = fields.Field(
        column_name='Rezervasyon Tutarı Para Birimi',
        attribute='currency_code'
    )

    reservation_date = fields.Field(
        column_name='Rezervasyon Tarihi',
        attribute='reservation_date', 
        widget=DateWidget(format='%Y-%m-%d')
    )

    car_type = fields.Field(
        column_name='Araba Tipi',
        attribute='car_type',
    )

    transfer_date = fields.Field(
        column_name='Transfer Tarihi',
        attribute='transfer_date', 
        widget=DateWidget(format='%Y-%m-%d')
    )

    transfer_time = fields.Field(
        column_name='Transfer Saati',
        attribute='transfer_time', 
        widget=TimeWidget(format='%H:%M:%S')
    )

    flight_number = fields.Field(
        column_name='Uçuş Numarası',
        attribute='flight_number'
    )

    flight_date = fields.Field(
        column_name='Uçuş Tarihi',
        attribute='flight_date', 
        widget=DateWidget(format='%Y-%m-%d')
    )

    flight_time = fields.Field(
        column_name='Uçuş Saati',
        attribute='flight_time', 
        widget=TimeWidget(format='%H:%M:%S')
    )

    passenger_name = fields.Field(
        column_name='Yolcu Adı',
        attribute='passenger_name'
    )

    passenger_count = fields.Field(
        column_name='Yolcu Sayısı',
        attribute='passenger_count'
    )

    passenger_count_child = fields.Field(
        column_name='Çocuk Sayısı',
        attribute='passenger_count_child'
    )

    note = fields.Field(
        column_name='Not',
        attribute='note'
    )

    delete = fields.Field(
        column_name='delete (1)',  # The column name in your CSV/Excel file
        attribute=None,        # No direct model attribute
        widget=BooleanWidget() # Parses "True"/"False" or "Yes"/"No" as boolean
    )

    class Meta:
        model = Reservation
        import_id_fields = ('id',)

