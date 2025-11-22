#!/usr/bin/env python
"""
Assign Missing Permissions to Roles
Adds appropriate permissions to roles that are missing them
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from domains.rbac.models import Role, Permission, RolePermission
from django.db import transaction

@transaction.atomic
def assign_permissions():
    """Assign missing permissions to roles"""
    print("=" * 80)
    print("ASSIGNING MISSING PERMISSIONS TO ROLES")
    print("=" * 80)
    
    # Define permissions for each role based on React app structure
    role_permissions = {
        'AUDIT_ADMIN': [
            ('ADMIN', 'audit_logs', 'READ'),
            ('ADMIN', 'audit_logs', 'EXPORT'),
            ('ADMIN', 'users', 'READ'),
        ],
        'BILLING_ADMIN': [
            ('PAYMENT', '*', 'READ'),
            ('PAYMENT', '*', 'WRITE'),
            ('FINANCIAL', '*', 'READ'),
            ('FINANCIAL', '*', 'WRITE'),
            ('LEASE', '*', 'READ'),
        ],
        'SUPPORT_ADMIN': [
            ('ADMIN', 'users', 'READ'),
            ('ADMIN', 'users', 'UPDATE'),
            ('TENANT', '*', 'READ'),
            ('LANDLORD', '*', 'READ'),
            ('MAINTENANCE', '*', 'READ'),
            ('MAINTENANCE', '*', 'UPDATE'),
        ],
    }
    
    for role_name, perms in role_permissions.items():
        try:
            role = Role.objects.get(name=role_name)
            print(f"\n{role_name} ({role.display_name}):")
            
            existing_count = RolePermission.objects.filter(role=role).count()
            if existing_count > 0:
                print(f"  Already has {existing_count} permissions, skipping...")
                continue
            
            added = 0
            for category, resource, action in perms:
                # Get or create permission
                permission, _ = Permission.objects.get_or_create(
                    category=category,
                    resource=resource,
                    action=action,
                    defaults={}
                )
                
                # Assign to role
                rp, created = RolePermission.objects.get_or_create(
                    role=role,
                    permission=permission
                )
                
                if created:
                    added += 1
                    print(f"  ✓ Added: {category}.{resource}.{action}")
            
            print(f"  Total: Added {added} permission(s)")
            
        except Role.DoesNotExist:
            print(f"\n{role_name}: Role not found, skipping...")
    
    print("\n" + "=" * 80)
    print("PERMISSION ASSIGNMENT COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    assign_permissions()

