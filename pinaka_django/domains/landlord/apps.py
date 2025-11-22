"""Landlord Domain App Configuration"""
from django.apps import AppConfig


class LandlordConfig(AppConfig):
    """Landlord domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.landlord'
    verbose_name = 'Landlord Management'

