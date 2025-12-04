from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='banktransferinstruction',
            name='phone_number',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AlterField(
            model_name='banktransferinstruction',
            name='iban',
            field=models.CharField(blank=True, max_length=64),
        ),
    ]
