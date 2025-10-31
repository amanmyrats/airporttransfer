from django.conf import settings
from django.core import signing


EMAIL_VERIFICATION_SALT = 'authentication.email_verification'
PASSWORD_RESET_SALT = 'authentication.password_reset'


def _max_age(setting_name, default):
    return getattr(settings, setting_name, default)


def generate_email_verification_token(user):
    data = {'user_id': user.pk, 'email': user.email}
    return signing.dumps(data, salt=EMAIL_VERIFICATION_SALT)


def parse_email_verification_token(token):
    max_age = _max_age('AUTH_EMAIL_TOKEN_MAX_AGE', 60 * 60 * 24)
    return signing.loads(token, salt=EMAIL_VERIFICATION_SALT, max_age=max_age)


def generate_password_reset_token(user):
    data = {'user_id': user.pk, 'email': user.email}
    return signing.dumps(data, salt=PASSWORD_RESET_SALT)


def parse_password_reset_token(token):
    max_age = _max_age('AUTH_PASSWORD_RESET_TOKEN_MAX_AGE', 60 * 60 * 2)
    return signing.loads(token, salt=PASSWORD_RESET_SALT, max_age=max_age)
