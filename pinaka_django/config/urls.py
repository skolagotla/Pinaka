"""
Main URL Configuration for Pinaka
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin Frontend (Platform Admin interface at /admin/)
    path('', include('frontend.admin_urls')),
    
    # Frontend (PMC, Landlord, Tenant interface at /)
    path('', include('frontend.urls')),
    
    # Django Admin (moved to /django-admin/ to avoid conflict)
    path('django-admin/', admin.site.urls),
    
    # API v1 - All Domain APIs
    path('api/v1/', include('domains.property.urls')),
    path('api/v1/', include('domains.tenant.urls')),
    path('api/v1/', include('domains.lease.urls')),
    path('api/v1/', include('domains.payment.urls')),
    path('api/v1/', include('domains.maintenance.urls')),
    path('api/v1/', include('domains.landlord.urls')),
    path('api/v1/', include('domains.pmc.urls')),
    path('api/v1/', include('domains.rbac.urls')),
    path('api/v1/', include('domains.document.urls')),
    path('api/v1/', include('domains.ltb_document.urls')),
    path('api/v1/', include('domains.message.urls')),
    path('api/v1/', include('domains.support.urls')),
    path('api/v1/', include('domains.notification.urls')),
    path('api/v1/', include('domains.verification.urls')),
    path('api/v1/', include('domains.invitation.urls')),
    path('api/v1/', include('domains.service_provider.urls')),
    path('api/v1/', include('domains.application.urls')),
    path('api/v1/', include('domains.activity.urls')),
    path('api/v1/', include('domains.expense.urls')),
    path('api/v1/', include('domains.financials.urls')),
    
    # RBAC API (legacy /api/rbac routes for React app compatibility)
    path('api/rbac/', include('domains.rbac.legacy_urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Customize admin site
admin.site.site_header = "Pinaka Property Management"
admin.site.site_title = "Pinaka Admin"
admin.site.index_title = "Welcome to Pinaka Property Management"
