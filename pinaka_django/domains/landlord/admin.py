"""Landlord Domain Admin Interface"""
from django.contrib import admin
from .models import Landlord


@admin.register(Landlord)
class LandlordAdmin(admin.ModelAdmin):
    """Admin interface for Landlord"""
    
    list_display = [
        'landlord_id',
        'full_name',
        'email',
        'phone',
        'approval_status',
        'is_approved',
        'created_at',
    ]
    
    list_filter = [
        'approval_status',
        'country_code',
        'created_at',
    ]
    
    search_fields = [
        'landlord_id',
        'first_name',
        'last_name',
        'email',
        'phone',
    ]
    
    readonly_fields = [
        'landlord_id',
        'is_approved',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('landlord_id', 'approval_status', 'is_approved')
        }),
        ('Personal Information', {
            'fields': (
                'first_name',
                'middle_name',
                'last_name',
                'email',
                'phone',
            )
        }),
        ('Address', {
            'fields': (
                'address_line1',
                'address_line2',
                'city',
                'province_state',
                'postal_zip',
                'country',
                'country_code',
                'region_code',
            )
        }),
        ('Settings', {
            'fields': (
                'timezone',
                'theme',
                'signature_file_name',
                'organization_id',
            ),
            'classes': ('collapse',)
        }),
        ('Approval Workflow', {
            'fields': (
                'approved_by',
                'approved_at',
                'rejected_by',
                'rejected_at',
                'rejection_reason',
            ),
            'classes': ('collapse',)
        }),
        ('Invitation', {
            'fields': (
                'invited_by',
                'invited_at',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'

