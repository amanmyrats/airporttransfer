# Generated by Django 5.1.4 on 2025-03-05 05:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0004_rename_to_popularroute_destination_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='popularroute',
            options={'ordering': ['main_location', 'car_type', '-euro_price', 'destination']},
        ),
    ]
