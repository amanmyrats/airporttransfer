from .settings import *  # Import everything from base settings

# Override only the DATABASES setting to use SQLite in-memory DB
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
