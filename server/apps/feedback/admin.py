from django.contrib import admin
from .models import ManagerEmployee, Feedback, SwotAnalysis

@admin.register(ManagerEmployee)
class ManagerEmployeeAdmin(admin.ModelAdmin):
    list_display = ('id', 'manager', 'employee', 'organization')
    search_fields = ('manager__username', 'employee__username')

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'giver', 'receiver', 'feedback_type', 'is_submitted', 'created_at')
    list_filter = ('feedback_type',)
    search_fields = ('giver', 'receiver')
    readonly_fields = ('created_at',)

admin.site.register(SwotAnalysis)
