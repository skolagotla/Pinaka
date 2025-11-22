"""
Admin Frontend URLs
Platform Admin interface at /admin/
"""
from django.urls import path
from . import admin_views, admin_api

urlpatterns = [
    # Admin Dashboard
    path('admin/', admin_views.admin_dashboard, name='admin_dashboard'),
    path('admin/dashboard/', admin_views.admin_dashboard, name='admin_dashboard_alt'),
    
    # User Management
    path('admin/users/', admin_views.admin_users, name='admin_users'),
    
    # Admin API Endpoints
    path('admin/api/users/<str:user_id>/<str:user_type>/', admin_api.get_user, name='admin_api_get_user'),
    path('admin/api/users/<str:user_id>/', admin_api.update_user, name='admin_api_update_user'),
    path('admin/api/invitations/', admin_api.send_invitation, name='admin_api_send_invitation'),
    path('admin/api/users/<str:user_id>/roles/<str:user_type>/', admin_api.get_user_roles_api, name='admin_api_get_user_roles'),
    path('admin/api/users/<str:user_id>/roles/<str:user_type>/assign/', admin_api.assign_role, name='admin_api_assign_role'),
    path('admin/api/roles/', admin_api.get_roles_api, name='admin_api_get_roles'),
    path('admin/api/roles/create/', admin_api.create_role, name='admin_api_create_role'),
    path('admin/api/roles/<str:role_id>/', admin_api.update_role, name='admin_api_update_role'),
    path('admin/api/pmcs/', admin_api.get_pmcs_api, name='admin_api_get_pmcs'),
    
    # Settings API
    path('admin/api/settings/', admin_api.get_settings, name='admin_api_get_settings'),
    path('admin/api/settings/update/', admin_api.update_settings, name='admin_api_update_settings'),
    
    # LTB Documents API
    path('admin/api/ltb-documents/', admin_api.get_ltb_documents, name='admin_api_get_ltb_documents'),
    
    # RBAC
    path('admin/rbac/', admin_views.admin_rbac, name='admin_rbac'),
    
    # System & Monitoring
    path('admin/system/', admin_views.admin_system, name='admin_system'),
    path('admin/audit-logs/', admin_views.admin_audit_logs, name='admin_audit_logs'),
    path('admin/analytics/', admin_views.admin_analytics, name='admin_analytics'),
    
    # Settings & Configuration
    path('admin/platform-settings/', admin_views.admin_settings, name='admin_platform_settings'),
    path('admin/settings/', admin_views.admin_user_settings, name='admin_user_settings'),
    path('admin/security/', admin_views.admin_security, name='admin_security'),
    path('admin/api-keys/', admin_views.admin_api_keys, name='admin_api_keys'),
    path('admin/database/', admin_views.admin_database, name='admin_database'),
    
    # Content & Data
    path('admin/content/', admin_views.admin_content, name='admin_content'),
    path('admin/data-export/', admin_views.admin_data_export, name='admin_data_export'),
    path('admin/notifications/', admin_views.admin_notifications, name='admin_notifications'),
    path('admin/user-activity/', admin_views.admin_user_activity, name='admin_user_activity'),
    
    # Support
    path('admin/support-tickets/', admin_views.admin_support_tickets, name='admin_support_tickets'),
    
    # Verifications
    path('admin/verifications/', admin_views.admin_verifications, name='admin_verifications'),
    
    # Library/Documents
    path('admin/library/', admin_views.admin_library, name='admin_library'),
]
