from django.contrib import admin
from .models import ManagerEmployee

@admin.register(ManagerEmployee)
class ManagerEmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'manager', 'employee', 'organization')
    search_fields = ('manager__username', 'employee__username')
