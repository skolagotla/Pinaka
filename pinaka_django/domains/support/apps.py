"""Support Tickets Domain App Configuration"""
from django.apps import AppConfig


class SupportTicketsConfig(AppConfig):
    """Support tickets domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.support'
    verbose_name = 'Support Tickets'
