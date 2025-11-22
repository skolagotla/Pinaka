"""PMC Domain Admin Interface"""
from django.contrib import admin
from .models import PropertyManagementCompany


@admin.register(PropertyManagementCompany)
class PropertyManagementCompanyAdmin(admin.ModelAdmin):
    """Admin interface for Property Management Company"""
    
    list_display = [
        'company_id',
        'company_name',
        'email',
        'phone',
        'is_active',
        'approval_status',
        'is_approved',
        'created_at',
    ]
    
    list_filter = [
        'approval_status',
        'is_active',
        'country_code',
        'created_at',
    ]
    
    search_fields = [
        'company_id',
        'company_name',
        'email',
        'phone',
    ]
    
    readonly_fields = [
        'company_id',
        'is_approved',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('company_id', 'company_name', 'is_active', 'approval_status', 'is_approved')
        }),
        ('Contact Information', {
            'fields': (
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
        ('Commission Structure', {
            'fields': (
                'default_commission_rate',
                'commission_structure',
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

