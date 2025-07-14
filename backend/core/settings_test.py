from .settings import *  # Import everything from base settings

# Override only the DATABASES setting to use SQLite in-memory DB
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "test-secret-key-for-airporttransferhub"