"""Service Providers Domain Admin Interface"""
from django.contrib import admin
from .models import ServiceProvider, ServiceProviderRating


class ServiceProviderRatingInline(admin.TabularInline):
    """Inline admin for service provider ratings"""
    model = ServiceProviderRating
    extra = 0
    readonly_fields = [
        'rated_by',
        'rated_by_type',
        'rated_by_email',
        'rated_by_name',
        'overall_rating',
        'created_at',
    ]


@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    """Admin interface for Service Provider"""
    
    list_display = [
        'provider_id',
        'company_name',
        'contact_name',
        'email',
        'provider_type',
        'is_active',
        'approval_status',
        'is_approved',
        'average_rating',
        'created_at',
    ]
    
    list_filter = [
        'provider_type',
        'is_active',
        'is_verified',
        'approval_status',
        'created_at',
    ]
    
    search_fields = [
        'provider_id',
        'company_name',
        'contact_name',
        'email',
        'phone',
    ]
    
    inlines = [ServiceProviderRatingInline]
    
    readonly_fields = [
        'provider_id',
        'is_approved',
        'average_rating',
        'total_ratings',
        'created_at',
        'updated_at',
    ]


@admin.register(ServiceProviderRating)
class ServiceProviderRatingAdmin(admin.ModelAdmin):
    """Admin interface for Service Provider Rating"""
    
    list_display = [
        'service_provider',
        'rated_by_name',
        'rated_by_type',
        'overall_rating',
        'quality',
        'timeliness',
        'communication',
        'professionalism',
        'created_at',
    ]
    
    list_filter = [
        'rated_by_type',
        'is_public',
        'created_at',
    ]
    
    search_fields = [
        'service_provider__company_name',
        'service_provider__contact_name',
        'rated_by_name',
        'rated_by_email',
        'review_text',
    ]
    
    readonly_fields = [
        'overall_rating',
        'created_at',
        'updated_at',
    ]

