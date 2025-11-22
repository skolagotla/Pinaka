"""Invitations Domain App Configuration"""
from django.apps import AppConfig


class InvitationsConfig(AppConfig):
    """Invitations domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.invitation'
    verbose_name = 'Invitations'

