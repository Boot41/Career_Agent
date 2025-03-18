from django.urls import path
from . import views
# from django.views.decorators.csrf import csrf_exempt
import json

urlpatterns = [
    path('check-user/', views.check_user_exists, name='check_user_exists'),
    path('login/', views.login, name='login'),
    path('send-mail/', views.send_mail_page, name='send_mail_page'),
]
