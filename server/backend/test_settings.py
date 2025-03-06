from .settings import *

# Override database settings for testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'test_djangoproject',
        'USER': 'djangouser',
        'PASSWORD': 'djangopassword',
        'HOST': 'localhost',
        'PORT': '5432',
        'TEST': {
            'NAME': 'test_djangoproject',
        },
    }
} 