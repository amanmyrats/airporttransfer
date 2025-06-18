import datetime

from rest_framework.serializers import (
    ModelSerializer, TimeField, ValidationError, DateField, 
    DecimalField, CharField, 
)

from .models import ( Reservation, ContactUsMessage ) 


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
    transfer_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    flight_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    return_transfer_date = DateField(required=False, allow_null=True)
    return_transfer_time = Time24HourField(format='%H:%M', required=False, allow_null=True)
    return_flight_number = CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    return_trip_amount = DecimalField(max_digits=10, decimal_places=2, default=0, required=False, allow_null=True)

    def create(self, validated_data):
        # Extract the extra fields
        return_transfer_date = validated_data.pop('return_transfer_date', None)
        return_transfer_time = validated_data.pop('return_transfer_time', None)
        return_flight_number = validated_data.pop('return_flight_number', None)
        return_trip_amount = validated_data.pop('return_trip_amount', None)
        reservation = super().create(validated_data)
        return reservation
    class Meta:
        model = Reservation
        fields = '__all__'
    

class ReservationStatusModelSerializer(ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'status')
        

class ContactUsMessageModelSerializer(ModelSerializer):
    class Meta:
        model = ContactUsMessage
        fields = '__all__'