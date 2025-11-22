"""Organization Domain App Configuration"""
from django.apps import AppConfig


class OrganizationConfig(AppConfig):
    """Organization domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.organization'
    verbose_name = 'Organization Management'

