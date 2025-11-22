"""Maintenance Domain App Configuration"""
from django.apps import AppConfig


class MaintenanceConfig(AppConfig):
    """Maintenance domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.maintenance'
    verbose_name = 'Maintenance Management'

