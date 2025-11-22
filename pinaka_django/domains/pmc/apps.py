"""PMC Domain App Configuration"""
from django.apps import AppConfig


class PMCConfig(AppConfig):
    """PMC domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.pmc'
    verbose_name = 'Property Management Company'

