"""Message Domain App Configuration"""
from django.apps import AppConfig


class MessageConfig(AppConfig):
    """Message domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.message'
    verbose_name = 'Messaging System'

