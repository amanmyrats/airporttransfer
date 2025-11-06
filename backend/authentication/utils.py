import json
import logging
from urllib.parse import urlencode, urljoin

import requests
import jwt

from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.template.exceptions import TemplateDoesNotExist
from django.utils import timezone

from accounts.models import Account, CustomerProfile

try:
    from allauth.account.models import EmailAddress
    from allauth.socialaccount.models import SocialAccount
except ImportError:  # pragma: no cover
    EmailAddress = None
    SocialAccount = None


APPLE_KEYS_CACHE_KEY = 'authentication.apple_keys'
APPLE_KEYS_TTL = 60 * 60
logger = logging.getLogger(__name__)


def frontend_url(path: str = '', query: dict | None = None) -> str:
    base_url = getattr(settings, 'AUTH_FRONTEND_URL', '').rstrip('/')
    if not base_url:
        return ''
    url = urljoin(f"{base_url}/", path.lstrip('/'))
    if query:
        return f"{url}?{urlencode(query)}"
    return url


def _smtp_details_configured() -> bool:
    backend = getattr(settings, 'EMAIL_BACKEND', '')
    host = getattr(settings, 'EMAIL_HOST', '')
    if 'smtp' not in backend.lower():
        return True
    if not host:
        logger.warning('EMAIL_HOST is not configured; skipping SMTP email send')
        return False
    return True


def send_templated_email(subject: str, template: str, to_email: str, context: dict) -> bool:
    """
    Render a template pair and send it via the configured email backend.
    Returns True if the message is handed off to the backend successfully.
    """
    try:
        plaintext = render_to_string(f'emails/{template}.txt', context)
        html = render_to_string(f'emails/{template}.html', context)
    except TemplateDoesNotExist:
        logger.exception('Email template "%s" is missing', template)
        return False
    except Exception:
        logger.exception('Failed to render email template "%s"', template)
        return False

    if not _smtp_details_configured():
        return False

    message = EmailMultiAlternatives(
        subject=subject,
        body=plaintext,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
        to=[to_email],
    )
    message.attach_alternative(html, 'text/html')

    try:
        with get_connection(fail_silently=True) as connection:
            message.connection = connection
            sent = message.send(fail_silently=True)
    except Exception:
        logger.exception('Unexpected failure getting connection for email "%s" to %s', template, to_email)
        return False

    if sent == 0:
        logger.warning('Email backend returned 0 for message "%s" to %s', template, to_email)
        return False
    return True


def mark_email_as_verified(user: Account) -> None:
    if EmailAddress is None:
        return
    EmailAddress.objects.update_or_create(
        user=user,
        email=user.email,
        defaults={'verified': True, 'primary': True},
    )


def ensure_social_account(user: Account, provider: str, uid: str, extra_data: dict) -> None:
    if SocialAccount is None:
        return
    SocialAccount.objects.update_or_create(
        user=user,
        provider=provider,
        uid=uid,
        defaults={'last_login': timezone.now(), 'extra_data': extra_data},
    )


def verify_google_id_token(id_token: str) -> dict:
    try:
        response = requests.get(
            'https://oauth2.googleapis.com/tokeninfo',
            params={'id_token': id_token},
            timeout=5,
        )
    except requests.RequestException as exc:  # pragma: no cover - network failure
        raise ValueError('google_verification_failed') from exc
    if response.status_code != 200:
        raise ValueError('invalid_google_token')
    payload = response.json()
    client_id = getattr(settings, 'SOCIAL_GOOGLE_CLIENT_ID', None)
    if client_id and payload.get('aud') != client_id:
        raise ValueError('invalid_google_audience')
    if payload.get('iss') not in {'accounts.google.com', 'https://accounts.google.com'}:
        raise ValueError('invalid_google_issuer')
    if not payload.get('email'):
        raise ValueError('missing_email')
    return payload


def _fetch_apple_keys() -> list[dict]:
    cached = cache.get(APPLE_KEYS_CACHE_KEY)
    if cached:
        return cached
    try:
        response = requests.get('https://appleid.apple.com/auth/keys', timeout=5)
        response.raise_for_status()
    except requests.RequestException as exc:  # pragma: no cover - network failure
        raise ValueError('apple_key_fetch_failed') from exc
    keys = response.json().get('keys', [])
    cache.set(APPLE_KEYS_CACHE_KEY, keys, APPLE_KEYS_TTL)
    return keys


def verify_apple_identity_token(identity_token: str) -> dict:
    unverified_header = jwt.get_unverified_header(identity_token)
    key_id = unverified_header.get('kid')
    keys = _fetch_apple_keys()
    key_data = next((k for k in keys if k.get('kid') == key_id), None)
    if not key_data:
        raise ValueError('invalid_apple_token')
    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key_data))
    audience = getattr(settings, 'SOCIAL_APPLE_CLIENT_ID', None)
    try:
        payload = jwt.decode(
            identity_token,
            key=public_key,
            audience=audience,
            algorithms=[unverified_header.get('alg', 'RS256')],
            issuer='https://appleid.apple.com',
        )
    except jwt.PyJWTError as exc:
        raise ValueError('invalid_apple_token') from exc
    if not payload.get('email'):
        raise ValueError('missing_email')
    return payload


def upsert_social_user(email: str, first_name: str, last_name: str | None, provider: str, uid: str, extra_data: dict) -> Account:
    account_defaults = {
        'first_name': first_name or '',
        'last_name': last_name,
        'role': 'client',
        'is_active': True,
    }
    account, created = Account.objects.get_or_create(
        email=email.lower(),
        defaults=account_defaults,
    )
    if not created:
        updated = {}
        if first_name and account.first_name != first_name:
            updated['first_name'] = first_name
        if last_name and account.last_name != last_name:
            updated['last_name'] = last_name
        if not account.is_active:
            updated['is_active'] = True
        if updated:
            for attr, value in updated.items():
                setattr(account, attr, value)
            account.save(update_fields=list(updated.keys()))
    profile = getattr(account, 'customer_profile', None)
    if profile is None:
        profile, _ = CustomerProfile.objects.get_or_create(user=account)
    profile.save(update_fields=['updated_at'])
    mark_email_as_verified(account)
    ensure_social_account(account, provider, uid, extra_data)
    return account
