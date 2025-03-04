from django.urls import path
from . import views

urlpatterns = [
    path('check-user/', views.check_user_exists, name='check_user_exists'),
    path('login/', views.login, name='login'),
]
