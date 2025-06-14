# Generated by Django 5.1.4 on 2025-04-28 14:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transfer', '0017_reservation_is_nakit_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='direction_type',
            field=models.CharField(blank=True, choices=[('ARR', 'Arrival'), ('DEP', 'Departure'), ('ARA', 'Round Trip')], default='ARR', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='reservation',
            name='transfer_type',
            field=models.CharField(blank=True, choices=[('PRIVATE', 'Özel Transfer'), ('SHUTTLE', 'Paylaşımlı Transfer')], default='PRIVATE', max_length=255, null=True),
        ),
    ]
