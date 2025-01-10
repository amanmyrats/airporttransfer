from decimal import Decimal

from django.db import models


class EuroRate(models.Model):
    CURRENCY_CHOICES = (
        ('EUR', '€'),
        ('USD', '$'),
        ('GBP', '£'),
    )
    currency_code = models.CharField(max_length=3, choices=CURRENCY_CHOICES)
    euro_rate = models.DecimalField(max_digits=10, decimal_places=4, default=1.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.currency_code == 'EUR':
            self.euro_rate = Decimal('1.00')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.currency_code} - {self.euro_rate}"


class PopularRoute(models.Model):
    MAIN_LOCATION_CHOICES = (
        ('AYT', 'Antalya Airport Transfer'),
        ('DLM', 'Dalaman Airport Transfer'),
        ('IST', 'Istanbul Airport Transfer'),
        ('SAW', 'Sabiha Gokcen Airport Transfer'),
        ('ESB', 'Ankara Esenboga Airport Transfer'),
        ('ADB', 'Izmir Adnan Menderes Airport Transfer'),
        ('BJV', 'Bodrum Milas Airport Transfer'),
        ('GZP', 'Gazipasa Airport Transfer'),
    )
    CAR_TYPE_CHOICES = (
        ('VITO', 'Mercedes Vito'),
        ('SPRINTER', 'Mercedes Sprinter'),
        ('MAYBACH', 'Mercedes Maybach S class'),
        ('MINIBUS', 'Minibus'),
    )
    main_location = models.CharField(max_length=10, choices=MAIN_LOCATION_CHOICES)
    car_type = models.CharField(max_length=10, choices=CAR_TYPE_CHOICES)
    to = models.CharField(max_length=255)
    euro_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.main_location} - {self.to} - {self.euro_price}"


