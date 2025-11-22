"""
RBAC Permission Checking Utilities
Matches React app permission logic
"""
from domains.rbac.models import UserRole, Role, Permission, RolePermission
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)


def get_user_roles(user_id, user_type):
    """Get all active roles for a user"""
    return UserRole.objects.filter(
        user_id=str(user_id),
        user_type=user_type,
        is_active=True
    ).select_related('role')


def has_role(user_id, user_type, role_name):
    """Check if user has a specific role"""
    try:
        role = Role.objects.get(name=role_name, is_active=True)
        return UserRole.objects.filter(
            user_id=str(user_id),
            user_type=user_type,
            role=role,
            is_active=True
        ).exists()
    except Role.DoesNotExist:
        return False


def has_permission(user_id, user_type, category, resource, action):
    """
    Check if user has a specific permission
    Matches React app permission checking logic
    """
    # Get all roles for user
    user_roles = get_user_roles(user_id, user_type)
    
    if not user_roles.exists():
        return False
    
    # Check each role's permissions
    for user_role in user_roles:
        role = user_role.role
        
        # Get role permissions
        role_permissions = RolePermission.objects.filter(role=role).select_related('permission')
        
        for role_perm in role_permissions:
            perm = role_perm.permission
            
            # Check if permission matches
            if perm.category == category and perm.action == action:
                # Check resource match (wildcard or exact)
                if perm.resource == '*' or perm.resource == resource:
                    return True
    
    return False


def check_permission(user, category, resource, action):
    """
    Convenience function to check permission for a Django user
    Assumes user has user_type and user_id attributes
    """
    if not hasattr(user, 'user_type') or not hasattr(user, 'id'):
        return False
    
    # Get user_id from profile if available
    user_id = None
    if hasattr(user, 'admin_profile'):
        user_id = str(user.admin_profile.id)
        user_type = 'ADMIN'
    elif hasattr(user, 'landlord_profile'):
        user_id = str(user.landlord_profile.id)
        user_type = 'LANDLORD'
    elif hasattr(user, 'tenant_profile'):
        user_id = str(user.tenant_profile.id)
        user_type = 'TENANT'
    elif hasattr(user, 'pmc_profile'):
        user_id = str(user.pmc_profile.id)
        user_type = 'PMC'
    else:
        # Fallback to user.id
        user_id = str(user.id)
        user_type = getattr(user, 'user_type', 'ADMIN').upper()
    
    return has_permission(user_id, user_type, category, resource, action)


def get_user_permissions(user_id, user_type):
    """Get all permissions for a user across all their roles"""
    user_roles = get_user_roles(user_id, user_type)
    permissions = set()
    
    for user_role in user_roles:
        role = user_role.role
        role_permissions = RolePermission.objects.filter(role=role).select_related('permission')
        
        for role_perm in role_permissions:
            perm = role_perm.permission
            permissions.add((perm.category, perm.resource, perm.action))
    
    return list(permissions)

