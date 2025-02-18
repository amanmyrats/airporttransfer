# Generated by Django 5.1.4 on 2025-01-13 13:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transfer', '0007_alter_reservation_dest_lat_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reservation',
            name='dest_lat',
            field=models.DecimalField(blank=True, decimal_places=10, max_digits=20, null=True),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='dest_lng',
            field=models.DecimalField(blank=True, decimal_places=10, max_digits=20, null=True),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='pickup_lat',
            field=models.DecimalField(blank=True, decimal_places=10, max_digits=20, null=True),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='pickup_lng',
            field=models.DecimalField(blank=True, decimal_places=10, max_digits=20, null=True),
        ),
    ]
