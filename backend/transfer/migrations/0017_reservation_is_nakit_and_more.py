# Generated by Django 5.1.4 on 2025-04-28 11:54

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transfer', '0016_alter_reservation_reservation_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='is_nakit',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='reservation_date',
            field=models.DateField(default=datetime.date(2025, 4, 28)),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='transfer_date',
            field=models.DateField(blank=True, default=datetime.date(2025, 4, 28), null=True),
        ),
    ]
