"""
Lease Domain Admin Interface
"""
from django.contrib import admin
from .models import Lease, LeaseTenant, LeaseDocument, LeaseTermination


class LeaseTenantInline(admin.TabularInline):
    """Inline admin for lease tenants"""
    model = LeaseTenant
    extra = 1
    fields = ['tenant', 'is_primary_tenant', 'added_at']
    readonly_fields = ['added_at']


@admin.register(Lease)
class LeaseAdmin(admin.ModelAdmin):
    """Admin interface for Lease"""
    
    list_display = [
        'lease_id',
        'unit',
        'rent_amount',
        'lease_start',
        'lease_end',
        'status',
        'is_active',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'lease_start',
        'lease_end',
        'renewal_reminder_sent',
        'renewal_decision',
    ]
    
    search_fields = [
        'lease_id',
        'unit__unit_number',
        'unit__property__property_name',
    ]
    
    readonly_fields = [
        'lease_id',
        'is_active',
        'is_expired',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('lease_id', 'unit', 'status')
        }),
        ('Lease Period', {
            'fields': (
                'lease_start',
                'lease_end',
                'is_active',
                'is_expired',
            )
        }),
        ('Financial Terms', {
            'fields': (
                'rent_amount',
                'rent_due_day',
                'security_deposit',
                'payment_method',
            )
        }),
        ('Renewal Tracking', {
            'fields': (
                'renewal_reminder_sent',
                'renewal_reminder_sent_at',
                'renewal_decision',
                'renewal_decision_at',
                'renewal_decision_by',
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
    
    inlines = [LeaseTenantInline]
    
    ordering = ['-lease_start']
    date_hierarchy = 'lease_start'


@admin.register(LeaseTenant)
class LeaseTenantAdmin(admin.ModelAdmin):
    """Admin interface for Lease-Tenant relationships"""
    
    list_display = [
        'lease',
        'tenant',
        'is_primary_tenant',
        'added_at',
    ]
    
    list_filter = [
        'is_primary_tenant',
        'added_at',
    ]
    
    search_fields = [
        'lease__lease_id',
        'tenant__first_name',
        'tenant__last_name',
        'tenant__email',
    ]
    
    readonly_fields = ['added_at']
    
    ordering = ['-added_at']


@admin.register(LeaseDocument)
class LeaseDocumentAdmin(admin.ModelAdmin):
    """Admin interface for Lease Documents"""
    
    list_display = [
        'document_id',
        'lease',
        'original_name',
        'file_type',
        'file_size',
        'uploaded_at',
    ]
    
    list_filter = [
        'file_type',
        'uploaded_at',
    ]
    
    search_fields = [
        'document_id',
        'lease__lease_id',
        'original_name',
        'file_name',
    ]
    
    readonly_fields = [
        'document_id',
        'file_size',
        'uploaded_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('document_id', 'lease')
        }),
        ('File Information', {
            'fields': (
                'file_name',
                'original_name',
                'file_type',
                'file_size',
                'storage_path',
            )
        }),
        ('Details', {
            'fields': ('description',)
        }),
        ('Metadata', {
            'fields': (
                'uploaded_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-uploaded_at']
    date_hierarchy = 'uploaded_at'


@admin.register(LeaseTermination)
class LeaseTerminationAdmin(admin.ModelAdmin):
    """Admin interface for Lease Terminations"""
    
    list_display = [
        'termination_id',
        'lease',
        'form_type',
        'termination_date',
        'status',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'form_type',
        'termination_date',
        'created_at',
    ]
    
    search_fields = [
        'termination_id',
        'lease__lease_id',
        'reason',
    ]
    
    readonly_fields = [
        'termination_id',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('termination_id', 'lease', 'status')
        }),
        ('Termination Details', {
            'fields': (
                'form_type',
                'termination_date',
                'initiated_by',
                'reason',
                'actual_loss',
            )
        }),
        ('Approval Workflow', {
            'fields': (
                'approved_by',
                'approved_at',
                'rejected_by',
                'rejected_at',
                'rejection_reason',
                'completed_at',
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
    date_hierarchy = 'termination_date'
