"""Activity Domain Admin Interface"""
from django.contrib import admin
from .models import ActivityLog, UserActivity


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """Admin interface for Activity Log"""
    
    list_display = [
        'user_name',
        'user_role',
        'action',
        'entity_type',
        'entity_name',
        'created_at',
    ]
    
    list_filter = [
        'user_role',
        'action',
        'entity_type',
        'created_at',
    ]
    
    search_fields = [
        'user_name',
        'user_email',
        'entity_name',
        'description',
    ]
    
    readonly_fields = [
        'created_at',
    ]
    
    date_hierarchy = 'created_at'


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """Admin interface for User Activity"""
    
    list_display = [
        'user_name',
        'user_role',
        'action',
        'resource',
        'created_at',
    ]
    
    list_filter = [
        'user_role',
        'action',
        'created_at',
    ]
    
    search_fields = [
        'user_name',
        'user_email',
        'resource',
    ]
    
    readonly_fields = [
        'created_at',
    ]

