"""Expense Domain App Configuration"""
from django.apps import AppConfig


class ExpenseConfig(AppConfig):
    """Expense domain configuration"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'domains.expense'
    verbose_name = 'Expenses'

