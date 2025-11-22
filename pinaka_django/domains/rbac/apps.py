"""RBAC Domain App Configuration"""
from django.apps import AppConfig


class RBACConfig(AppConfig):
    """RBAC domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.rbac'
    verbose_name = 'RBAC & User Management'

