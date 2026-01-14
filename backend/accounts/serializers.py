from rest_framework import serializers

from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password

from .models import Account, CustomerProfile, UserColumn
from .utils import sendpassword_task, make_random_password


class AccountModelSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)

    class Meta:
        model = Account
        fields = (
            'id', 'email', 'first_name', 'last_name', 
            'phone', 'is_client', 'is_company_user',
            'is_active', 'is_staff', 'is_superuser', 'date_joined', 
            'role')
        read_only_fields = ('is_active', 'is_staff', 'is_superuser', 'date_joined', 'is_client', 'is_company_user',)

    def create(self, validated_data):
        try:
            password = make_random_password()
            # password = make_password(validated_data.get('email'))
            validated_data['password'] = make_password(password)
            account = super().create(validated_data)
            sendpassword_task(account.email, password)

        except Exception as e:
            print(e)
            raise serializers.ValidationError('Failed to create account.')
        return account
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'date_joined', )
        read_only_fields = ('email', 'is_active', 'is_staff', 'is_superuser', 'date_joined', )


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    uid = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)


class UserColumnModelSerializer(serializers.ModelSerializer):
    user_obj = AccountModelSerializer(read_only=True, source='user')
    
    class Meta:
        model = UserColumn
        fields = '__all__'


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ('phone_e164', 'preferred_language', 'marketing_opt_in')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=5)
    preferred_language = serializers.CharField(write_only=True, max_length=2, default='en')

    class Meta:
        model = Account
        fields = ('email', 'password', 'first_name', 'last_name', 'preferred_language')

    def validate_email(self, value):
        email = Account.objects.normalize_email(value)
        if Account.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_password(self, value):
        if len(value) < 5:
            raise serializers.ValidationError('Password must be at least 5 characters long.')
        validate_password(value)
        return value

    def create(self, validated_data):
        preferred_language = validated_data.pop('preferred_language', 'en')
        password = validated_data.pop('password')
        account = Account.objects.create_user(
            password=password,
            role='client',
            is_active=False,
            **validated_data,
        )
        reservation_phone = None
        try:
            from transfer.models import Reservation
            reservation = (
                Reservation.objects.filter(passenger_email__iexact=account.email)
                .exclude(passenger_phone__isnull=True)
                .exclude(passenger_phone__exact='')
                .order_by('-created_at')
                .first()
            )
            if reservation:
                reservation_phone = reservation.passenger_phone
        except Exception:
            reservation_phone = None
        if reservation_phone and not account.phone:
            account.phone = reservation_phone
            account.save(update_fields=['phone'])
        profile = getattr(account, 'customer_profile', None)
        if profile is None:
            profile, _ = CustomerProfile.objects.get_or_create(user=account)
        profile.preferred_language = preferred_language
        profile.marketing_opt_in = True
        profile.save(update_fields=['preferred_language', 'marketing_opt_in', 'updated_at'])
        return account


class AuthUserSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(source='customer_profile')

    class Meta:
        model = Account
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_client', 'is_company_user', 'profile')


class AccountProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=False, max_length=30)
    last_name = serializers.CharField(required=False, allow_null=True, allow_blank=True, max_length=30)
    profile = CustomerProfileSerializer(required=False)

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if validated_data:
            instance.save(update_fields=list(validated_data.keys()))
        if profile_data:
            profile = getattr(instance, 'customer_profile', None)
            if profile is None:
                profile = CustomerProfile.objects.create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save(update_fields=list(profile_data.keys()) + ['updated_at'])
        return instance

    def to_representation(self, instance):
        return AuthUserSerializer(instance).data
