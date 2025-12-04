# Authentication API Guide

This document describes the new client-facing authentication stack that powers email/password, social login, and account management for AirportTransfer.

## Features
- JWT authentication with 30-day access tokens and rotating 180-day refresh tokens
- Email verification workflow with signed tokens
- Password reset with signed tokens and UI/API support
- Google and Apple social login (Microsoft placeholder ready)
- Shared user base for company and client roles with role claims exposed in JWTs
- Rate-limited, CORS-restricted endpoints hardened for production

## Environment Variables
Configure the variables below (sample values shown).

```
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=False
ALLOWED_HOSTS=api.example.com

DB_NAME=airporttransfer
DB_USER=airporttransfer
DB_PASSWORD=secret
DB_HOST=postgres
DB_PORT=5432

DEFAULT_FROM_EMAIL=noreply@airporttransferhub.com
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=smtp-user
EMAIL_HOST_PASSWORD=smtp-password

CORS_ALLOWED_ORIGINS=https://airporttransferhub.com,https://www.airporttransferhub.com
CSRF_TRUSTED_ORIGINS=https://airporttransferhub.com,https://www.airporttransferhub.com
AUTH_FRONTEND_URL=https://airporttransferhub.com

ACCESS_TOKEN_LIFETIME_DAYS=30
REFRESH_TOKEN_LIFETIME_DAYS=180
AUTH_EMAIL_TOKEN_MAX_AGE=86400
AUTH_PASSWORD_RESET_TOKEN_MAX_AGE=7200

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=google-secret
SOCIAL_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

APPLE_CLIENT_ID=com.example.airporttransfer
APPLE_TEAM_ID=TEAMID1234
APPLE_KEY_ID=ABCDEF1234
APPLE_PRIVATE_KEY="""-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"""
SOCIAL_APPLE_CLIENT_ID=${APPLE_CLIENT_ID}

ACCOUNT_LOGIN_ATTEMPTS_LIMIT=5
ACCOUNT_LOGIN_ATTEMPTS_TIMEOUT=300
AUTH_PASSWORD_MIN_LENGTH=5
```

> **Note:** Run `python manage.py check --deploy` after configuring the environment to validate critical settings.

## Installation
1. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Run migrations (performed manually by the ops team):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. Create a superuser for administration:
   ```bash
   python manage.py createsuperuser
   ```
4. Seed a demo client user (optional):
   ```bash
   python manage.py seed_auth_demo
   ```

## Google Sign-In Configuration
1. In the Google Cloud Console create an OAuth 2.0 Web client ID.
2. Add authorized JavaScript origins for each SPA host (e.g. `https://airporttransferhub.com`).
3. Add authorized redirect URIs pointing to the SPA (e.g. `https://airporttransferhub.com/auth/callback/google`).
4. Copy the client ID and secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. The frontend obtains an ID token via Google One Tap or OAuth and POSTs it to `/api/v1/auth/social/google/`.

## Apple Sign-In Configuration
1. In Apple Developer portal register a services ID (Sign in with Apple) and enable the web domain.
2. Create a new private key under **Keys → Sign in with Apple** using the same services ID.
3. Record the **Team ID**, **Key ID**, and generated private key (PEM). Store the PEM in the `APPLE_PRIVATE_KEY` multi-line environment variable.
4. Set `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `SOCIAL_APPLE_CLIENT_ID`.
5. Frontend obtains an `identity_token` (JWT) and POSTs it to `/api/v1/auth/social/apple/`.

## API Endpoints

| Endpoint | Description |
| --- | --- |
| `POST /api/v1/auth/register/` | Register a client account (inactive until email verified) |
| `POST /api/v1/auth/email/verify/` | Activate an account using the email token |
| `POST /api/v1/auth/login/` | Email/password login, returns access + refresh JWT |
| `POST /api/v1/auth/token/refresh/` | Rotate refresh token |
| `POST /api/v1/auth/logout/` | Blacklist a refresh token |
| `POST /api/v1/auth/password/forgot/` | Send password reset email (generic response) |
| `POST /api/v1/auth/password/reset/confirm/` | Set a new password with `uid` and `token` |
| `GET /api/v1/auth/me/` | Fetch authenticated user and customer profile |
| `PATCH /api/v1/auth/me/` | Update profile fields |
| `POST /api/v1/auth/social/google/` | Google social login via ID token |
| `POST /api/v1/auth/social/apple/` | Apple social login via identity token |
| `POST /api/v1/auth/social/microsoft/` | Placeholder (501 Not Implemented) |

### Example Requests

```bash
# Register
curl -X POST https://api.example.com/api/v1/auth/register/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"Secret123!","first_name":"Demo","preferred_language":"en","marketing_opt_in":true}'

# Verify email
curl -X POST https://api.example.com/api/v1/auth/email/verify/ \
  -H 'Content-Type: application/json' \
  -d '{"key":"<token-from-email>"}'

# Login
curl -X POST https://api.example.com/api/v1/auth/login/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"Secret123!"}'

# Refresh
curl -X POST https://api.example.com/api/v1/auth/token/refresh/ \
  -H 'Content-Type: application/json' \
  -d '{"refresh":"<refresh-token>"}'

# Logout
curl -X POST https://api.example.com/api/v1/auth/logout/ \
  -H 'Authorization: Bearer <access-token>' \
  -H 'Content-Type: application/json' \
  -d '{"refresh":"<refresh-token>"}'

# Forgot password
curl -X POST https://api.example.com/api/v1/auth/password/forgot/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com"}'

# Password reset confirm
curl -X POST https://api.example.com/api/v1/auth/password/reset/confirm/ \
  -H 'Content-Type: application/json' \
  -d '{"uid":"<uid-from-email>","token":"<token>","new_password":"NewSecret123!"}'

# Social login (Google)
curl -X POST https://api.example.com/api/v1/auth/social/google/ \
  -H 'Content-Type: application/json' \
  -d '{"id_token":"<google-id-token>"}'
```

## Testing
- Run backend tests: `python manage.py test authentication accounts`
- Throttle behaviour is verified in `authentication/tests/test_auth.py` and uses scopes `auth_burst` and `auth_sensitive`.

## Deployment Checklist
- Set all environment variables above, including SMTP and social credentials.
- Ensure `django.contrib.sites` site domain matches the public API host.
- Review CORS and CSRF host lists before going live.
- Configure HTTPS termination at the load balancer or reverse proxy.

For additional questions, ping the backend team in Slack.
