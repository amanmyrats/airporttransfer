from decimal import Decimal

from django.db import models


class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True)
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=5, blank=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.is_default:
            Currency.objects.exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        display_symbol = self.symbol or self.code
        return f"{self.name} ({display_symbol})"


class Airport(models.Model):
    iata_code = models.CharField(max_length=5, unique=True)
    icao_code = models.CharField(max_length=10, blank=True)
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=255, blank=True)
    state = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=255, blank=True)
    timezone = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    elevation_meters = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['iata_code']

    def __str__(self):
        codes = [code for code in [self.iata_code, self.icao_code] if code]
        location = ", ".join(filter(None, [self.city, self.state, self.country]))
        label = "/".join(codes) if codes else self.name
        return f"{label} - {self.name}" + (f" ({location})" if location else "")


class EuroRate(models.Model):
    CURRENCY_CHOICES = (
        ('EUR', '€'),
        ('USD', '$'),
        ('GBP', '£'),
        ('RUB', '₽'),
        ('TRY', '₺'),
    )
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='rates',
        null=True,
        blank=True,
    )
    currency_code = models.CharField(max_length=3, choices=CURRENCY_CHOICES, unique=True)
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
    airport = models.ForeignKey(
        Airport,
        on_delete=models.PROTECT,
        related_name='popular_routes',
        null=True,
        blank=True,
    )
    main_location = models.CharField(max_length=10, choices=MAIN_LOCATION_CHOICES)
    destination = models.CharField(max_length=255)
    car_type = models.CharField(max_length=10, choices=CAR_TYPE_CHOICES)
    euro_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('main_location', 'destination', 'car_type')
        ordering = ['main_location', 'car_type', 'euro_price', 'destination']

    def save(self, *args, **kwargs):
        if self.airport:
            self.main_location = self.airport.iata_code or self.main_location
        super().save(*args, **kwargs)

    def __str__(self):
        airport_label = self.airport.iata_code if self.airport else self.main_location
        return f"{airport_label} - {self.destination} - {self.euro_price}"
