from django.contrib import admin
from .models import AuthUser

@admin.register(AuthUser)
class AuthUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'name', 'email', 'role', 'is_active')
    search_fields = ('username', 'name', 'email')
    list_filter = ('role', 'is_active')
    readonly_fields = ('id', 'created_at')
