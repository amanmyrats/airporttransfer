from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('transfer', '0024_alter_reservation_status_reservationchangerequest'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReservationPassenger',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('is_child', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('reservation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='passengers', to='transfer.reservation')),
            ],
            options={
                'ordering': ['order', 'id'],
            },
        ),
        migrations.AddConstraint(
            model_name='reservationpassenger',
            constraint=models.UniqueConstraint(fields=('reservation', 'order'), name='unique_passenger_order_per_reservation'),
        ),
    ]
