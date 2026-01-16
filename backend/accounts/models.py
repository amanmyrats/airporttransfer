from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, first_name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, password=None, **extra_fields):
        extra_fields.setdefault('role', 'company_admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, first_name, password, **extra_fields)


class Account(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('company_admin', 'Admin'),
        ('company_yonetici', 'Yönetici'),
        ('company_rezervasyoncu', 'Rezervasyoncu'),
        ('company_employee', 'Çalışan'),
        ('blogger', 'Blogger'),
        ('seo', 'SEO'),
    )
    email = models.EmailField(unique=True)
    # username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_client = models.BooleanField(default=False, db_index=True)
    is_company_user = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='company_employee')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.email} - {self.first_name}"


class CustomerProfile(models.Model):
    user = models.OneToOneField('accounts.Account', on_delete=models.CASCADE, related_name='customer_profile')
    phone_e164 = models.CharField(max_length=20, blank=True)
    preferred_language = models.CharField(max_length=2, default='en')
    marketing_opt_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CustomerProfile({self.user_id})"


class UserColumn(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    table_name = models.CharField(max_length=255)
    field = models.CharField(max_length=255)
    header = models.CharField(max_length=255)
    width = models.IntegerField(default=200)
    min_width = models.IntegerField(default=50)
    max_width = models.IntegerField(default=500)
    index = models.IntegerField(default=10)
    is_visible = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'table_name', 'field'], name='unique_user_column'),
            models.UniqueConstraint(fields=['user', 'table_name', 'header'], name='unique_user_header'),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.table_name} - {self.field}"
