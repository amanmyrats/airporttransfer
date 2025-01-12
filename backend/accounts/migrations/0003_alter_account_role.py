# Generated by Django 5.1.4 on 2025-01-11 18:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_account_role_delete_accountrole_delete_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='role',
            field=models.CharField(choices=[('company_admin', 'Admin'), ('company_yonetici', 'Yönetici'), ('company_muhasebeci', 'Muhasabeci'), ('company_employee', 'Çalışan'), ('company_rezervasyoncu', 'Rezervasyoncu'), ('company_operasyoncu', 'Operasyoncu'), ('company_driver', 'Sürücü')], default='company_employee', max_length=50),
        ),
    ]
