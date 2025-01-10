import datetime

from rest_framework.serializers import ModelSerializer, TimeField, ValidationError

from .models import ( Reservation, ) 


class Time24HourField(TimeField):
    def to_representation(self, value):
        if value is None:
            return None
        return value.strftime('%H:%M')
    def from_representation(self, value):
        if value is None:
            return None
        try:
            return datetime.datetime.strptime(value, '%H:%M').time()
        except ValueError:
            raise ValidationError('Invalid time format. Use HH:MM (24-hour format).')
        

class ReservationModelSerializer(ModelSerializer):
    transfer_time = Time24HourField(format='%H:%M')
    flight_time = Time24HourField(format='%H:%M')

    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ('company',)
    

class ReservationStatusModelSerializer(ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'status')
        