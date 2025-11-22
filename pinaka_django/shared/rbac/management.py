"""
RBAC Management Utilities
"""
from domains.rbac.models import Role, Permission, RolePermission, UserRole, Admin
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany
import logging

logger = logging.getLogger(__name__)


# Default role definitions
DEFAULT_ROLES = {
    # Admin roles
    'SUPER_ADMIN': {
        'display_name': 'Super Admin',
        'description': 'Full system access with all permissions',
        'is_system': True,
    },
    'PLATFORM_ADMIN': {
        'display_name': 'Platform Admin',
        'description': 'Platform administration and user management',
        'is_system': True,
    },
    'SUPPORT_ADMIN': {
        'display_name': 'Support Admin',
        'description': 'Support ticket management and customer service',
        'is_system': True,
    },
    'BILLING_ADMIN': {
        'display_name': 'Billing Admin',
        'description': 'Billing and payment management',
        'is_system': True,
    },
    'AUDIT_ADMIN': {
        'display_name': 'Audit Admin',
        'description': 'Audit logs and compliance monitoring',
        'is_system': True,
    },
    # PMC roles
    'PMC_ADMIN': {
        'display_name': 'PMC Admin',
        'description': 'Property Management Company administrator',
        'is_system': True,
    },
    'PROPERTY_MANAGER': {
        'display_name': 'Property Manager',
        'description': 'Property and unit management',
        'is_system': True,
    },
    'LEASING_AGENT': {
        'display_name': 'Leasing Agent',
        'description': 'Lease and tenant management',
        'is_system': True,
    },
    'MAINTENANCE_TECH': {
        'display_name': 'Maintenance Technician',
        'description': 'Maintenance request management',
        'is_system': True,
    },
    'ACCOUNTANT': {
        'display_name': 'Accountant',
        'description': 'Financial reporting and accounting',
        'is_system': True,
    },
    # User roles
    'OWNER_LANDLORD': {
        'display_name': 'Owner/Landlord',
        'description': 'Property owner with full property access',
        'is_system': True,
    },
    'TENANT': {
        'display_name': 'Tenant',
        'description': 'Tenant with limited access to own data',
        'is_system': True,
    },
    'VENDOR_SERVICE_PROVIDER': {
        'display_name': 'Vendor/Service Provider',
        'description': 'Service provider with maintenance access',
        'is_system': True,
    },
}

# Default permissions for each role
ROLE_PERMISSIONS = {
    'SUPER_ADMIN': [
        # Full access to everything
        ('ADMIN', '*', 'MANAGE'),
        ('PROPERTY', '*', 'MANAGE'),
        ('TENANT', '*', 'MANAGE'),
        ('LEASE', '*', 'MANAGE'),
        ('PAYMENT', '*', 'MANAGE'),
        ('MAINTENANCE', '*', 'MANAGE'),
        ('LANDLORD', '*', 'MANAGE'),
        ('PMC', '*', 'MANAGE'),
        ('SETTINGS', '*', 'MANAGE'),
    ],
    'PLATFORM_ADMIN': [
        ('ADMIN', 'users', 'MANAGE'),
        ('ADMIN', 'roles', 'MANAGE'),
        ('ADMIN', 'settings', 'READ'),
        ('PROPERTY', '*', 'READ'),
        ('TENANT', '*', 'READ'),
        ('LEASE', '*', 'READ'),
        ('PAYMENT', '*', 'READ'),
        ('MAINTENANCE', '*', 'READ'),
    ],
    'PMC_ADMIN': [
        ('PROPERTY', '*', 'MANAGE'),
        ('TENANT', '*', 'MANAGE'),
        ('LEASE', '*', 'MANAGE'),
        ('PAYMENT', '*', 'MANAGE'),
        ('MAINTENANCE', '*', 'MANAGE'),
        ('LANDLORD', '*', 'READ'),
        ('PMC', 'own', 'MANAGE'),
    ],
    'PROPERTY_MANAGER': [
        ('PROPERTY', '*', 'MANAGE'),
        ('UNIT', '*', 'MANAGE'),
        ('TENANT', '*', 'READ'),
        ('LEASE', '*', 'READ'),
        ('MAINTENANCE', '*', 'MANAGE'),
    ],
    'LEASING_AGENT': [
        ('PROPERTY', '*', 'READ'),
        ('TENANT', '*', 'MANAGE'),
        ('LEASE', '*', 'MANAGE'),
        ('PAYMENT', '*', 'READ'),
    ],
    'MAINTENANCE_TECH': [
        ('MAINTENANCE', '*', 'MANAGE'),
        ('PROPERTY', '*', 'READ'),
        ('UNIT', '*', 'READ'),
    ],
    'ACCOUNTANT': [
        ('PAYMENT', '*', 'READ'),
        ('PAYMENT', '*', 'WRITE'),
        ('LEASE', '*', 'READ'),
        ('PROPERTY', '*', 'READ'),
        ('FINANCIAL', '*', 'READ'),
        ('FINANCIAL', '*', 'WRITE'),
    ],
    'OWNER_LANDLORD': [
        ('PROPERTY', 'own', 'MANAGE'),
        ('UNIT', 'own', 'MANAGE'),
        ('TENANT', 'own', 'READ'),
        ('LEASE', 'own', 'READ'),
        ('PAYMENT', 'own', 'READ'),
        ('MAINTENANCE', 'own', 'READ'),
    ],
    'TENANT': [
        ('PROPERTY', 'own', 'READ'),
        ('UNIT', 'own', 'READ'),
        ('LEASE', 'own', 'READ'),
        ('PAYMENT', 'own', 'READ'),
        ('MAINTENANCE', 'own', 'MANAGE'),
    ],
    'VENDOR_SERVICE_PROVIDER': [
        ('MAINTENANCE', 'assigned', 'MANAGE'),
        ('PROPERTY', 'assigned', 'READ'),
    ],
}


def initialize_roles():
    """Initialize all system roles"""
    created = 0
    updated = 0
    
    for role_name, role_data in DEFAULT_ROLES.items():
        role, created_flag = Role.objects.get_or_create(
            name=role_name,
            defaults={
                'display_name': role_data['display_name'],
                'description': role_data['description'],
                'is_system': role_data['is_system'],
                'is_active': True,
            }
        )
        
        if created_flag:
            created += 1
            logger.info(f"Created role: {role_name}")
        else:
            # Update existing role
            role.display_name = role_data['display_name']
            role.description = role_data['description']
            role.is_system = role_data['is_system']
            role.is_active = True
            role.save()
            updated += 1
            logger.info(f"Updated role: {role_name}")
    
    return created, updated


def initialize_permissions():
    """Initialize permissions for all roles"""
    total_permissions = 0
    
    for role_name, permissions in ROLE_PERMISSIONS.items():
        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            logger.warning(f"Role {role_name} not found, skipping permissions")
            continue
        
        # Clear existing permissions
        RolePermission.objects.filter(role=role).delete()
        
        # Add new permissions
        for category, resource, action in permissions:
            permission, _ = Permission.objects.get_or_create(
                category=category,
                resource=resource,
                action=action,
                defaults={}
            )
            
            RolePermission.objects.get_or_create(
                role=role,
                permission=permission
            )
            total_permissions += 1
    
    return total_permissions


def assign_role_to_user(user_id, user_type, role_name, assigned_by=None, scope=None):
    """Assign a role to a user"""
    try:
        role = Role.objects.get(name=role_name, is_active=True)
    except Role.DoesNotExist:
        raise ValueError(f"Role {role_name} not found")
    
    user_role, created = UserRole.objects.get_or_create(
        user_id=user_id,
        user_type=user_type,
        role=role,
        defaults={
            'assigned_by': assigned_by,
            'scope': scope or {},
        }
    )
    
    if not created:
        # Update existing assignment
        user_role.assigned_by = assigned_by
        if scope is not None:
            user_role.scope = scope
        user_role.save()
    
    return user_role


def get_user_roles(user_id, user_type):
    """Get all roles for a user"""
    return UserRole.objects.filter(
        user_id=user_id,
        user_type=user_type
    ).select_related('role')


def has_permission(user_id, user_type, category, resource, action):
    """Check if user has a specific permission"""
    # Get all roles for user
    user_roles = get_user_roles(user_id, user_type)
    
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


def initialize_rbac_system():
    """Initialize the entire RBAC system"""
    logger.info("Initializing RBAC system...")
    
    # Initialize roles
    created, updated = initialize_roles()
    logger.info(f"Roles initialized: {created} created, {updated} updated")
    
    # Initialize permissions
    total_perms = initialize_permissions()
    logger.info(f"Permissions initialized: {total_perms} permissions assigned")
    
    return {
        'roles_created': created,
        'roles_updated': updated,
        'permissions_assigned': total_perms,
    }

