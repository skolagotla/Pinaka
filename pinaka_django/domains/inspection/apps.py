"""Inspection Domain App Configuration"""
from django.apps import AppConfig


class InspectionConfig(AppConfig):
    """Inspection domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.inspection'
    verbose_name = 'Inspections'

