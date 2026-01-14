import logging

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.serializers import RegisterSerializer, AuthUserSerializer
from .serializers import (
    CustomTokenObtainPairSerializer,
    IntegrationTokenObtainPairSerializer,
    LogoutSerializer,
    ForgotPasswordSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationConfirmSerializer,
    ProfileUpdateSerializer,
    PasswordChangeSerializer,
    GoogleSocialLoginSerializer,
    AppleSocialLoginSerializer,
    login_success_payload,
    build_password_reset_payload,
    build_email_verification_token,
)
from .throttles import AuthBurstRateThrottle, AuthSensitiveRateThrottle
from .utils import frontend_url, send_templated_email


logger = logging.getLogger(__name__)
SUPPORTED_LANG_CODES = {'en', 'de', 'ru', 'tr'}
DEFAULT_LANG_CODE = 'en'


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]

    def post(self, request):
        print('RegisterView received data:', request.data)
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        print('RegisterView created user:', user)
        reservation_phone = None
        try:
            from transfer.models import Reservation
            reservation = (
                Reservation.objects.filter(passenger_email__iexact=user.email)
                .exclude(passenger_phone__isnull=True)
                .exclude(passenger_phone__exact='')
                .order_by('-created_at')
                .first()
            )
            if reservation:
                reservation_phone = reservation.passenger_phone
        except Exception:
            reservation_phone = None
        if reservation_phone:
            profile = getattr(user, 'customer_profile', None)
            if profile and not profile.phone_e164:
                profile.phone_e164 = reservation_phone
                profile.save(update_fields=['phone_e164', 'updated_at'])
        token = build_email_verification_token(user)
        print('RegisterView generated token:', token)
        profile = getattr(user, 'customer_profile', None)
        preferred_language = (getattr(profile, 'preferred_language', '') or '').strip().lower()
        preferred_language = preferred_language if preferred_language in SUPPORTED_LANG_CODES else DEFAULT_LANG_CODE
        verify_path = f'{preferred_language}/auth/verify-email'
        verification_url = frontend_url(verify_path, {'key': token}) or ''
        print('RegisterView generated verification URL:', verification_url)
        context = {
            'user': user,
            'verification_url': verification_url,
            'token': token,
        }
        print('RegisterView email context:', context)
        email_sent = send_templated_email(
            subject='Verify your email',
            template='verify_email',
            to_email=user.email,
            context=context,
        )
        if not email_sent:
            logger.warning('Verification email could not be sent for user_id=%s', user.id)
        return Response({'detail': 'verification_email_sent'}, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]
    serializer_class = CustomTokenObtainPairSerializer


class IntegrationTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]
    serializer_class = IntegrationTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AuthBurstRateThrottle]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'logout_success'})


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthSensitiveRateThrottle]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data.get('user')
        if user:
            payload = build_password_reset_payload(user)
            profile = getattr(user, 'customer_profile', None)
            preferred_language = (getattr(profile, 'preferred_language', '') or '').strip().lower()
            preferred_language = preferred_language if preferred_language in SUPPORTED_LANG_CODES else DEFAULT_LANG_CODE
            reset_path = f'{preferred_language}/auth/reset-password'
            reset_url = frontend_url(reset_path, payload) or ''
            context = {
                'user': user,
                'reset_url': reset_url,
                'token': payload['token'],
                'uid': payload['uid'],
            }
            send_templated_email(
                subject='Password reset request',
                template='password_reset',
                to_email=user.email,
                context=context,
            )
        return Response({'detail': 'if_exists_email_sent'})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthSensitiveRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'password_reset_ok'})


class EmailVerifyView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthSensitiveRateThrottle]

    def post(self, request):
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'email_verified'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AuthBurstRateThrottle]

    def get(self, request):
        return Response(AuthUserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [AuthSensitiveRateThrottle]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save(update_fields=['password'])

        return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class GoogleSocialLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]

    def post(self, request):
        serializer = GoogleSocialLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(login_success_payload(user))


class AppleSocialLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]

    def post(self, request):
        serializer = AppleSocialLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(login_success_payload(user))


class MicrosoftSocialLoginPlaceholderView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]

    def post(self, request):
        return Response({'detail': 'microsoft_login_not_implemented'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]
