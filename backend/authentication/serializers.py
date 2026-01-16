from django.contrib.auth.password_validation import validate_password
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Account
from accounts.serializers import (
    AuthUserSerializer,
    AccountProfileUpdateSerializer,
)
from .tokens import (
    generate_email_verification_token,
    parse_email_verification_token,
    generate_password_reset_token,
    parse_password_reset_token,
)
from .utils import (
    mark_email_as_verified,
    upsert_social_user,
    verify_google_id_token,
    verify_apple_identity_token,
    verify_facebook_access_token,
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.pk
        token['email'] = user.email
        token['role'] = user.role
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active:
            raise AuthenticationFailed({'detail': 'email_not_verified'})
        data['user'] = AuthUserSerializer(self.user).data
        return data


class IntegrationTokenObtainPairSerializer(CustomTokenObtainPairSerializer):
    pass


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except Exception:
            raise serializers.ValidationError({'detail': 'invalid_token'})


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs['email']
        attrs['user'] = Account.objects.filter(email__iexact=email).first()
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=5)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
        except (TypeError, ValueError, OverflowError):
            raise serializers.ValidationError({'detail': 'invalid_token'})
        user = Account.objects.filter(pk=uid).first()
        if not user:
            raise serializers.ValidationError({'detail': 'invalid_token'})
        try:
            payload = parse_password_reset_token(attrs['token'])
        except Exception:
            raise serializers.ValidationError({'detail': 'invalid_token'})
        if str(payload.get('user_id')) != str(user.pk):
            raise serializers.ValidationError({'detail': 'invalid_token'})
        password = attrs['new_password']
        validate_password(password, user)
        attrs['user'] = user
        attrs['password'] = password
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        user.set_password(self.validated_data['password'])
        if not user.is_active:
            user.is_active = True
        user.save(update_fields=['password', 'is_active'])
        return user


class EmailVerificationConfirmSerializer(serializers.Serializer):
    key = serializers.CharField()

    def validate(self, attrs):
        try:
            payload = parse_email_verification_token(attrs['key'])
        except Exception:
            raise serializers.ValidationError({'detail': 'invalid_token'})
        user = Account.objects.filter(pk=payload.get('user_id'), email__iexact=payload.get('email')).first()
        if not user:
            raise serializers.ValidationError({'detail': 'invalid_token'})
        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=['is_active'])
        mark_email_as_verified(user)
        return user


class ProfileUpdateSerializer(AccountProfileUpdateSerializer):
    pass


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    default_error_messages = {
        'password_mismatch': 'New password and confirmation do not match.',
        'invalid_old_password': 'Current password is incorrect.',
        'not_authenticated': 'Authentication required.',
        'password_too_short': 'New password must be at least 6 characters long.',
    }

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            raise serializers.ValidationError({'detail': self.error_messages['not_authenticated']})

        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        if new_password != confirm_password:
            raise serializers.ValidationError({'confirm_password': self.error_messages['password_mismatch']})

        if new_password and len(new_password) < 6:
            raise serializers.ValidationError({'new_password': self.error_messages['password_too_short']})

        old_password = attrs.get('old_password')
        if not user.check_password(old_password):
            raise serializers.ValidationError({'old_password': self.error_messages['invalid_old_password']})

        return attrs


class GoogleSocialLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()

    def validate(self, attrs):
        verifier = self.context.get('verify_google_id_token', verify_google_id_token)
        try:
            payload = verifier(attrs['id_token'])
        except ValueError as exc:
            raise serializers.ValidationError({'detail': str(exc)}) from exc
        attrs['payload'] = payload
        return attrs

    def save(self, **kwargs):
        payload = self.validated_data['payload']
        email = payload.get('email')
        first_name = payload.get('given_name') or payload.get('name', '').split(' ')[0]
        family_name = payload.get('family_name')
        user = upsert_social_user(
            email=email,
            first_name=first_name or '',
            last_name=family_name,
            provider='google',
            uid=payload.get('sub'),
            extra_data=payload,
        )
        return user


class AppleSocialLoginSerializer(serializers.Serializer):
    identity_token = serializers.CharField()
    full_name = serializers.DictField(required=False)

    def validate(self, attrs):
        verifier = self.context.get('verify_apple_identity_token', verify_apple_identity_token)
        try:
            payload = verifier(attrs['identity_token'])
        except ValueError as exc:
            raise serializers.ValidationError({'detail': str(exc)}) from exc
        attrs['payload'] = payload
        return attrs

    def save(self, **kwargs):
        payload = self.validated_data['payload']
        full_name = self.validated_data.get('full_name') or {}
        first_name = full_name.get('givenName') or payload.get('given_name') or ''
        last_name = full_name.get('familyName') or payload.get('family_name')
        user = upsert_social_user(
            email=payload.get('email'),
            first_name=first_name,
            last_name=last_name,
            provider='apple',
            uid=payload.get('sub'),
            extra_data=payload,
        )
        return user


class FacebookSocialLoginSerializer(serializers.Serializer):
    access_token = serializers.CharField()

    def validate(self, attrs):
        verifier = self.context.get('verify_facebook_access_token', verify_facebook_access_token)
        try:
            payload = verifier(attrs['access_token'])
        except ValueError as exc:
            raise serializers.ValidationError({'detail': str(exc)}) from exc
        attrs['payload'] = payload
        return attrs

    def save(self, **kwargs):
        payload = self.validated_data['payload']
        email = payload.get('email')
        first_name = payload.get('first_name') or payload.get('name', '').split(' ')[0]
        last_name = payload.get('last_name') or payload.get('name', '').split(' ')[-1] if payload.get('name') else None
        user = upsert_social_user(
            email=email,
            first_name=first_name or '',
            last_name=last_name,
            provider='facebook',
            uid=payload.get('id'),
            extra_data=payload,
        )
        return user


def login_success_payload(user: Account) -> dict:
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    return {
        'access': str(access),
        'refresh': str(refresh),
        'user': AuthUserSerializer(user).data,
    }


def build_password_reset_payload(user: Account) -> dict:
    token = generate_password_reset_token(user)
    uid = urlsafe_base64_encode(str(user.pk).encode())
    return {'uid': uid, 'token': token}


def build_email_verification_token(user: Account) -> str:
    return generate_email_verification_token(user)
