import logging

from decimal import Decimal

from django.utils import timezone
from django.db import models

from .utils import (
    get_autogenerated_reservation_number, 
)


logger = logging.getLogger('airporttransfer')

class Reservation(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Beklemede'),
        ('confirmed', 'Onaylandı'),
    ]

    number = models.CharField(max_length=255, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency_code = models.CharField(max_length=3)

    reservation_date = models.DateField(default=timezone.now().date())

    car_type = models.CharField(max_length=255)

    transfer_date = models.DateField(default=timezone.now().date(), null=True, blank=True)
    transfer_time = models.TimeField(null=True, blank=True)
    transfer_date_time = models.DateTimeField(null=True, blank=True)
    flight_number = models.CharField(max_length=25, null=True, blank=True)
    flight_date = models.DateField(null=True, blank=True)
    flight_time = models.TimeField(null=True, blank=True)
    flight_date_time = models.DateTimeField(null=True, blank=True)

    passenger_name = models.CharField(max_length=255, null=True, blank=True)
    passenger_phone = models.CharField(max_length=255, null=True, blank=True)
    passenger_email = models.CharField(max_length=255, null=True, blank=True)
    passenger_count = models.IntegerField(default=1, null=True, blank=True)
    passenger_count_child = models.IntegerField(default=0, null=True, blank=True)
    note = models.TextField(blank=True, null=True)

    is_round_trip = models.BooleanField(default=False)

    pickup_short = models.CharField(max_length=255, null=True, blank=True)
    pickup_full = models.CharField(max_length=1024, null=True, blank=True)
    dest_short = models.CharField(max_length=255, null=True, blank=True)
    dest_full = models.CharField(max_length=1024, null=True, blank=True)
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_lon = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dest_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dest_lon = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Extra services
    need_child_seat = models.BooleanField(default=False)
    child_seat_count = models.IntegerField(default=0)
    
    need_greet_sign = models.BooleanField(default=False)

    status = models.CharField(max_length=255, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-transfer_date', 'transfer_time']

    def save(self, *args, **kwargs):
        logger.debug(f"Inside Reservation save: {self.id}")
                
        # Handle date time fields
        if self.transfer_date and self.transfer_time:
            naive_transfer_datetime = timezone.datetime.combine(self.transfer_date, self.transfer_time)
            if not timezone.is_aware(naive_transfer_datetime):
                self.transfer_date_time = timezone.make_aware(naive_transfer_datetime)
            else:
                self.transfer_date_time = naive_transfer_datetime

        if self.flight_date and self.flight_time:
            naive_flight_datetime = timezone.datetime.combine(self.flight_date, self.flight_time)
            if not timezone.is_aware(naive_flight_datetime):
                self.flight_date_time = timezone.make_aware(naive_flight_datetime)
            else:
                self.flight_date_time = naive_flight_datetime
        
        # Handle decimal amounts
        if not isinstance(self.amount, Decimal):
            self.amount = Decimal(self.amount)
        
        if not self.number:
            self.number = get_autogenerated_reservation_number(company_code='HVT')

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transfer_date} - [{self.pickup_short}-{self.dest_short}] - {self.transfer_time}"
