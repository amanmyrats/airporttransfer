import logging

from import_export import resources, fields
from import_export.widgets import (
    DateWidget, TimeWidget, BooleanWidget, 
)

from .models import (
    PopularRoute, 
)


logger = logging.getLogger('airporttransfer')

class PopularRouteModelResource(resources.ModelResource):
        
    def for_delete(self, row, instance):
        return row["delete (1)"] == "1"
        
    main_location = fields.Field(
        column_name='Havaalanı',
        attribute='main_location'
    )

    destination = fields.Field(
        column_name='Gidilecek Yer',
        attribute='destination'
    )

    car_type = fields.Field(
        column_name='Araba Tipi',
        attribute='car_type'
    )

    euro_price = fields.Field(
        column_name='EURO Cinsinden Fiyatı',
        attribute='euro_price', 
    )

    delete = fields.Field(
        column_name='delete (1)',  # The column name in your CSV/Excel file
        attribute=None,        # No direct model attribute
        widget=BooleanWidget() # Parses "True"/"False" or "Yes"/"No" as boolean
    )

    class Meta:
        model = PopularRoute
        import_id_fields = ('id',)

