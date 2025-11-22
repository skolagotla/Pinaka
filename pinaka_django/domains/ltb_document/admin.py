"""
LTB Document Admin
"""
from django.contrib import admin
from .models import LTBDocument


@admin.register(LTBDocument)
class LTBDocumentAdmin(admin.ModelAdmin):
    """Admin interface for LTB Documents"""
    list_display = ['form_number', 'name', 'category', 'audience', 'country', 'province', 'is_active']
    list_filter = ['category', 'audience', 'country', 'province', 'is_active']
    search_fields = ['form_number', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Form Information', {
            'fields': ('form_number', 'name', 'description', 'category', 'audience')
        }),
        ('URLs', {
            'fields': ('pdf_url', 'instruction_url')
        }),
        ('Region', {
            'fields': ('country', 'province')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

