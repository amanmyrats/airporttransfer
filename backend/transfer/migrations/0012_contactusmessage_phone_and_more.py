# Generated by Django 5.1.4 on 2025-01-23 04:35

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transfer', '0011_contactusmessage_alter_reservation_reservation_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='contactusmessage',
            name='phone',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='reservation_date',
            field=models.DateField(default=datetime.date(2025, 1, 23)),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='transfer_date',
            field=models.DateField(blank=True, default=datetime.date(2025, 1, 23), null=True),
        ),
    ]
