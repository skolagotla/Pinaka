"""
Tenant Domain Admin Interface
"""
from django.contrib import admin
from .models import Tenant, TenantInvitation


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    """Admin interface for Tenant"""
    
    list_display = [
        'tenant_id',
        'full_name',
        'email',
        'phone',
        'status',
        'approval_status',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'approval_status',
        'created_at',
    ]
    
    search_fields = [
        'tenant_id',
        'first_name',
        'last_name',
        'email',
        'phone',
    ]
    
    readonly_fields = [
        'tenant_id',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('tenant_id', 'status', 'approval_status')
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
            )
        }),
        ('Emergency Contact', {
            'fields': (
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relationship',
            ),
            'classes': ('collapse',)
        }),
        ('Employment', {
            'fields': (
                'employer_name',
                'employer_phone',
                'employer_address',
                'occupation',
                'annual_income',
            ),
            'classes': ('collapse',)
        }),
        ('Approval Workflow', {
            'fields': (
                'approved_at',
                'rejected_at',
                'rejection_reason',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'signature_file_name',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'


@admin.register(TenantInvitation)
class TenantInvitationAdmin(admin.ModelAdmin):
    """Admin interface for Tenant Invitations"""
    
    list_display = [
        'email',
        'unit',
        'status',
        'sent_at',
        'expires_at',
        'is_expired',
    ]
    
    list_filter = [
        'status',
        'sent_at',
        'expires_at',
    ]
    
    search_fields = [
        'email',
        'token',
    ]
    
    readonly_fields = [
        'sent_at',
        'accepted_at',
        'rejected_at',
        'is_expired',
    ]
    
    fieldsets = (
        ('Invitation Details', {
            'fields': (
                'email',
                'unit',
                'invited_by_landlord_id',
                'status',
            )
        }),
        ('Security', {
            'fields': ('token', 'expires_at'),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': (
                'sent_at',
                'accepted_at',
                'rejected_at',
                'is_expired',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-sent_at']
    date_hierarchy = 'sent_at'
