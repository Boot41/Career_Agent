from django.contrib.auth.backends import BaseBackend
from .models import AuthUser

class AuthUserBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            user = AuthUser.objects.get(username=username)
            if user.check_password(password):
                return user
        except AuthUser.DoesNotExist:
            return None
        return None

    def get_user(self, user_id):
        try:
            return AuthUser.objects.get(pk=user_id)
        except AuthUser.DoesNotExist:
            return None
