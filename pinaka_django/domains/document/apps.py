"""Document Domain App Configuration"""
from django.apps import AppConfig


class DocumentConfig(AppConfig):
    """Document domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.document'
    verbose_name = 'Document Management'

