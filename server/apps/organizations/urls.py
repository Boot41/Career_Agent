from django.urls import path
from . import views

urlpatterns = [
    path('hierarchy/', views.get_organization_hierarchy, name='get_organization_hierarchy'),
    path('total-employees/', views.get_total_employees, name='get_total_employees'),
]
