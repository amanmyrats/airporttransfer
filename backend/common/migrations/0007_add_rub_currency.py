from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("common", "0006_alter_popularroute_options"),
    ]

    operations = [
        migrations.AlterField(
            model_name="eurorate",
            name="currency_code",
            field=models.CharField(
                choices=[("EUR", "€"), ("USD", "$"), ("GBP", "£"), ("RUB", "₽")],
                max_length=3,
                unique=True,
            ),
        ),
    ]
