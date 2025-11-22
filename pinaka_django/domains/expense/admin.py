"""Expense Domain Admin Interface"""
from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Admin interface for Expense"""
    
    list_display = [
        'category',
        'amount',
        'date',
        'property',
        'description',
        'created_at',
    ]
    
    list_filter = [
        'category',
        'date',
        'is_recurring',
        'created_by_pmc',
        'created_at',
    ]
    
    search_fields = [
        'description',
        'category',
        'paid_to',
        'property__property_name',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]

