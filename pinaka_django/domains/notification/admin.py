"""Notifications Domain Admin Interface"""
from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification"""
    
    list_display = [
        'title',
        'user_email',
        'user_role',
        'notification_type',
        'priority',
        'is_read',
        'created_at',
    ]
    
    list_filter = [
        'notification_type',
        'priority',
        'is_read',
        'user_role',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'message',
        'user_email',
        'user_id',
    ]
    
    readonly_fields = [
        'created_at',
    ]


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """Admin interface for Notification Preference"""
    
    list_display = [
        'user_email',
        'user_role',
        'notification_type',
        'email_enabled',
        'sms_enabled',
        'push_enabled',
    ]
    
    list_filter = [
        'user_role',
        'notification_type',
        'email_enabled',
        'sms_enabled',
        'push_enabled',
    ]
    
    search_fields = [
        'user_email',
        'user_id',
        'notification_type',
    ]

