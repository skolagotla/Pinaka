"""Application Domain App Configuration"""
from django.apps import AppConfig


class ApplicationConfig(AppConfig):
    """Application domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.application'
    verbose_name = 'Applications'

