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
    GoogleSocialLoginSerializer,
    AppleSocialLoginSerializer,
    login_success_payload,
    build_password_reset_payload,
    build_email_verification_token,
)
from .throttles import AuthBurstRateThrottle, AuthSensitiveRateThrottle
from .utils import frontend_url, send_templated_email


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle]

    def post(self, request):
        print('RegisterView received data:', request.data)
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        print('RegisterView created user:', user)
        token = build_email_verification_token(user)
        print('RegisterView generated token:', token)
        verification_url = frontend_url('email/verify', {'token': token}) or ''
        print('RegisterView generated verification URL:', verification_url)
        context = {
            'user': user,
            'verification_url': verification_url,
            'token': token,
        }
        print('RegisterView email context:', context)
        try:
            send_templated_email(
                subject='Verify your email',
                template='verify_email',
                to_email=user.email,
                context=context,
            )
        except Exception as e:
            print('RegisterView email sending failed:', e)
            raise e
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
            reset_url = frontend_url('password/reset', payload) or ''
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
