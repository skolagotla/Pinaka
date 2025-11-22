"""Verifications Domain App Configuration"""
from django.apps import AppConfig


class VerificationsConfig(AppConfig):
    """Verifications domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.verification'
    verbose_name = 'Verifications'

