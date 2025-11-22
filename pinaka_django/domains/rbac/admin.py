"""RBAC Domain Admin Interface"""
from django.contrib import admin
from .models import Admin, Role, Permission, RolePermission, UserRole, AdminAuditLog


@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    """Admin interface for Admin users"""
    
    list_display = [
        'email',
        'full_name',
        'role',
        'is_active',
        'is_locked',
        'last_login_at',
    ]
    
    list_filter = [
        'role',
        'is_active',
        'is_locked',
        'created_at',
    ]
    
    search_fields = [
        'email',
        'first_name',
        'last_name',
        'google_id',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Personal Information', {
            'fields': (
                'email',
                'google_id',
                'first_name',
                'last_name',
                'phone',
            )
        }),
        ('Role & Status', {
            'fields': (
                'role',
                'is_active',
                'is_locked',
            )
        }),
        ('Security Settings', {
            'fields': (
                'allowed_google_domains',
                'ip_whitelist',
                'require_ip_whitelist',
            ),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': (
                'last_login_at',
                'last_login_ip',
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


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Admin interface for Roles"""
    
    list_display = [
        'name',
        'display_name',
        'is_active',
        'is_system',
        'created_at',
    ]
    
    list_filter = [
        'is_active',
        'is_system',
    ]
    
    search_fields = [
        'name',
        'display_name',
        'description',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """Admin interface for Permissions"""
    
    list_display = [
        'category',
        'resource',
        'action',
        'created_at',
    ]
    
    list_filter = [
        'category',
        'action',
    ]
    
    search_fields = [
        'category',
        'resource',
        'action',
    ]


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    """Admin interface for Role-Permission mappings"""
    
    list_display = [
        'role',
        'permission',
    ]
    
    list_filter = [
        'role',
        'permission__category',
    ]


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """Admin interface for User-Role assignments"""
    
    list_display = [
        'user_type',
        'user_id',
        'role',
        'assigned_at',
        'assigned_by',
    ]
    
    list_filter = [
        'user_type',
        'role',
        'assigned_at',
    ]
    
    search_fields = [
        'user_id',
    ]


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    """Admin interface for Audit Logs"""
    
    list_display = [
        'admin',
        'action',
        'resource',
        'success',
        'created_at',
    ]
    
    list_filter = [
        'action',
        'success',
        'created_at',
    ]
    
    search_fields = [
        'admin__email',
        'action',
        'resource',
    ]
    
    readonly_fields = [
        'admin',
        'action',
        'resource',
        'resource_id',
        'target_user_id',
        'target_user_role',
        'target_entity_type',
        'target_entity_id',
        'approval_type',
        'approval_entity_id',
        'before_state',
        'after_state',
        'changed_fields',
        'details',
        'ip_address',
        'user_agent',
        'success',
        'error_message',
        'google_email',
        'created_at',
    ]
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        """Audit logs are read-only"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Audit logs are read-only"""
        return False

