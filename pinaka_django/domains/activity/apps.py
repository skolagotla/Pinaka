"""Activity Domain App Configuration"""
from django.apps import AppConfig


class ActivityConfig(AppConfig):
    """Activity domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.activity'
    verbose_name = 'Activity Logs'

