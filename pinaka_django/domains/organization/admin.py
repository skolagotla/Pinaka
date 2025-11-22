"""Organization Domain Admin Interface"""
from django.contrib import admin
from .models import Organization, OrganizationSettings


class OrganizationSettingsInline(admin.StackedInline):
    """Inline admin for organization settings"""
    model = OrganizationSettings
    can_delete = False
    verbose_name_plural = 'Settings'


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """Admin interface for Organization"""
    
    list_display = [
        'name',
        'subdomain',
        'plan',
        'status',
        'max_properties',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'plan',
        'subscription_status',
        'created_at',
    ]
    
    search_fields = [
        'name',
        'subdomain',
        'billing_email',
    ]
    
    inlines = [OrganizationSettingsInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'subdomain', 'plan', 'status')
        }),
        ('Subscription', {
            'fields': (
                'subscription_id',
                'subscription_status',
                'current_period_start',
                'current_period_end',
                'cancel_at_period_end',
            ),
            'classes': ('collapse',)
        }),
        ('Usage Limits', {
            'fields': (
                'max_properties',
                'max_tenants',
                'max_users',
                'max_storage_gb',
                'max_api_calls_per_month',
            ),
            'classes': ('collapse',)
        }),
        ('Billing', {
            'fields': (
                'billing_email',
                'billing_address',
                'billing_city',
                'billing_state',
                'billing_postal_code',
                'billing_country',
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'trial_ends_at',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'

