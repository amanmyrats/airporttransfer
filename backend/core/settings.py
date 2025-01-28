"""
Django settings for core project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

import os
from pathlib import Path
from datetime import timedelta

from logging.handlers import RotatingFileHandler

from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = ['*', 'backend.airporttransfer.transfertakip.com']

AUTH_USER_MODEL = 'accounts.Account'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',

    'rest_framework',
    'django_filters',

    'authentication',
    'accounts', 
    'common', 
    'transfer', 


]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRESQL_DB_NAME'),
        'USER': os.getenv('POSTGRESQL_USER'),
        'PASSWORD': os.getenv('POSTGRESQL_PASSWORD'),
        'HOST': os.getenv('POSTGRESQL_HOST'),
        'PORT': os.getenv('POSTGRESQL_PORT'),
    }
    # 'default': {
    #     'ENGINE': 'django.db.backends.sqlite3',
    #     'NAME': BASE_DIR / 'db.sqlite3',
    # }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

USE_I18N = True

USE_TZ = True
TIME_ZONE = 'Europe/Istanbul'

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

CORS_ALLOW_HEADERS = [
    "Content-type",
    "Authorization",
    "x-csrftoken",
    "accept",
    "origin",
    "user-agent",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',

        'rest_framework.authentication.SessionAuthentication',
    ),
    'EXCEPTION_HANDLER': 'core.utils.custom_exception_handler',
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend', 
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.CustomPageNumberPagination',
    'PAGE_SIZE': 50,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

JWT_AUTH_USER_SERIALIZER = 'authentication.serializers.CustomTokenUserSerializer'


DEFAULT_FROM_EMAIL = 'info@airporttransferhub.com'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST_AIRPORTTRANSFERHUB')
EMAIL_PORT = os.getenv('EMAIL_PORT_AIRPORTTRANSFERHUB')
# EMAIL_USE_TLS = True
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER_AIRPORTTRANSFERHUB')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD_AIRPORTTRANSFERHUB')

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/' 
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'airporttransfer.log'),
            'maxBytes': 1 * 1024 * 1024,  # 1 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },

        # Handlers for different log levels of the airporttransfer logger
        'airporttransfer_debug_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'airporttransfer.debug.log'),
            'maxBytes': 1 * 1024 * 1024,  # 1 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'airporttransfer_info_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'airporttransfer.info.log'),
            'maxBytes': 1 * 1024 * 1024,  # 1 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'airporttransfer_error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'airporttransfer.error.log'),
            'maxBytes': 1 * 1024 * 1024,  # 1 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'DEBUG',
    },
    'loggers': {
        'airporttransfer': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'airporttransfer': {
            'handlers': ['airporttransfer_debug_file', 'airporttransfer_info_file', 'airporttransfer_error_file'],
            'level': 'DEBUG',
            'propagate': False,  # Prevent messages from propagating to the root logger
        },
    },
}

if DEBUG:
    FRONTEND_URL = 'http://localhost:4200'
    BACKEND_URL = 'http://localhost:8000'
else:
    FRONTEND_URL = 'https://airporttransferhub.com'
    BACKEND_URL = 'https://backend.airporttransfer.transfertakip.com'
