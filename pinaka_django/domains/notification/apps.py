"""Notifications Domain App Configuration"""
from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    """Notifications domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.notification'
    verbose_name = 'Notifications'

