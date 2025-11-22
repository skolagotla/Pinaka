"""
Maintenance Domain Admin Interface
"""
from django.contrib import admin
from .models import MaintenanceRequest, MaintenanceComment


class MaintenanceCommentInline(admin.TabularInline):
    """Inline admin for maintenance comments"""
    model = MaintenanceComment
    extra = 1
    fields = ['author_name', 'author_email', 'author_role', 'comment', 'is_status_update', 'created_at']
    readonly_fields = ['created_at']


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    """Admin interface for Maintenance Requests"""
    
    list_display = [
        'request_id',
        'ticket_number',
        'title',
        'property',
        'tenant',
        'category',
        'priority',
        'status',
        'requested_date',
    ]
    
    list_filter = [
        'status',
        'priority',
        'category',
        'initiated_by',
        'tenant_approved',
        'landlord_approved',
        'requested_date',
    ]
    
    search_fields = [
        'request_id',
        'ticket_number',
        'title',
        'description',
        'property__property_name',
        'tenant__first_name',
        'tenant__last_name',
    ]
    
    readonly_fields = [
        'request_id',
        'requested_date',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('request_id', 'ticket_number', 'status')
        }),
        ('Request Details', {
            'fields': (
                'property',
                'tenant',
                'title',
                'description',
                'category',
                'priority',
                'initiated_by',
            )
        }),
        ('Scheduling', {
            'fields': (
                'requested_date',
                'scheduled_date',
                'completed_date',
            )
        }),
        ('Assignment', {
            'fields': (
                'assigned_to_vendor_id',
                'assigned_to_provider_id',
            ),
            'classes': ('collapse',)
        }),
        ('Financial', {
            'fields': (
                'estimated_cost',
                'actual_cost',
            ),
            'classes': ('collapse',)
        }),
        ('Approval', {
            'fields': (
                'tenant_approved',
                'landlord_approved',
            ),
            'classes': ('collapse',)
        }),
        ('PMC Tracking', {
            'fields': (
                'created_by_pmc',
                'pmc_id',
            ),
            'classes': ('collapse',)
        }),
        ('Documentation', {
            'fields': (
                'photos',
                'before_photos',
                'after_photos',
                'completion_notes',
            ),
            'classes': ('collapse',)
        }),
        ('Feedback', {
            'fields': (
                'rating',
                'tenant_feedback',
            ),
            'classes': ('collapse',)
        }),
        ('View Tracking', {
            'fields': (
                'last_viewed_by_landlord',
                'last_viewed_by_tenant',
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
    
    inlines = [MaintenanceCommentInline]
    
    ordering = ['-requested_date']
    date_hierarchy = 'requested_date'


@admin.register(MaintenanceComment)
class MaintenanceCommentAdmin(admin.ModelAdmin):
    """Admin interface for Maintenance Comments"""
    
    list_display = [
        'comment_id',
        'maintenance_request',
        'author_name',
        'author_role',
        'is_status_update',
        'created_at',
    ]
    
    list_filter = [
        'author_role',
        'is_status_update',
        'created_at',
    ]
    
    search_fields = [
        'comment_id',
        'maintenance_request__ticket_number',
        'author_name',
        'author_email',
        'comment',
    ]
    
    readonly_fields = [
        'comment_id',
        'created_at',
    ]
    
    fieldsets = (
        ('Identification', {
            'fields': ('comment_id', 'maintenance_request')
        }),
        ('Author', {
            'fields': (
                'author_name',
                'author_email',
                'author_role',
            )
        }),
        ('Comment', {
            'fields': ('comment',)
        }),
        ('Status Update', {
            'fields': (
                'is_status_update',
                'old_status',
                'new_status',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['created_at']
    date_hierarchy = 'created_at'

