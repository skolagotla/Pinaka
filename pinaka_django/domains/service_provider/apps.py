"""Service Providers Domain App Configuration"""
from django.apps import AppConfig


class ServiceProvidersConfig(AppConfig):
    """Service providers domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.service_provider'
    verbose_name = 'Service Providers'

