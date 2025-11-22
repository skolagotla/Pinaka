"""Payment Domain App Configuration"""
from django.apps import AppConfig


class PaymentConfig(AppConfig):
    """Payment domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.payment'
    verbose_name = 'Payment Management'

