from django.urls import path

from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    LogoutView,
    ForgotPasswordView,
    PasswordResetConfirmView,
    EmailVerifyView,
    MeView,
    PasswordChangeView,
    GoogleSocialLoginView,
    AppleSocialLoginView,
    FacebookSocialLoginView,
    MicrosoftSocialLoginPlaceholderView,
    IntegrationTokenObtainPairView,
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('integration-token/', IntegrationTokenObtainPairView.as_view(), name='integration_token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('password/forgot/', ForgotPasswordView.as_view(), name='auth_password_forgot'),
    path('password/change/', PasswordChangeView.as_view(), name='auth_password_change'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='auth_password_reset_confirm'),
    path('email/verify/', EmailVerifyView.as_view(), name='auth_email_verify'),
    path('me/', MeView.as_view(), name='auth_me'),
    path('social/google/', GoogleSocialLoginView.as_view(), name='auth_social_google'),
    path('social/apple/', AppleSocialLoginView.as_view(), name='auth_social_apple'),
    path('social/facebook/', FacebookSocialLoginView.as_view(), name='auth_social_facebook'),
    path('social/microsoft/', MicrosoftSocialLoginPlaceholderView.as_view(), name='auth_social_microsoft'),
]
