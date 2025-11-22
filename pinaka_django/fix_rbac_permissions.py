#!/usr/bin/env python
"""
RBAC Permission Audit and Fix Script
Checks and fixes RBAC permissions to match React app structure
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from domains.rbac.models import Role, Permission, RolePermission, UserRole, Admin
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany
from django.db import transaction

def check_rbac_structure():
    """Check current RBAC structure"""
    print("=" * 80)
    print("RBAC STRUCTURE AUDIT")
    print("=" * 80)
    
    # Check roles
    print("\n1. ROLES:")
    roles = Role.objects.all().order_by('name')
    for role in roles:
        perm_count = RolePermission.objects.filter(role=role).count()
        user_count = UserRole.objects.filter(role=role, is_active=True).count()
        print(f"  {role.name:25} | {role.display_name:30} | {perm_count:3} perms | {user_count:3} users")
    
    # Check permissions
    print("\n2. PERMISSIONS:")
    perms = Permission.objects.all().order_by('category', 'resource', 'action')
    categories = {}
    for perm in perms:
        if perm.category not in categories:
            categories[perm.category] = []
        categories[perm.category].append(perm)
    
    for category, category_perms in sorted(categories.items()):
        print(f"\n  {category}:")
        for perm in category_perms[:10]:  # Show first 10
            print(f"    - {perm.resource}.{perm.action}")
        if len(category_perms) > 10:
            print(f"    ... and {len(category_perms) - 10} more")
    
    # Check user roles
    print("\n3. USER ROLE ASSIGNMENTS:")
    user_roles = UserRole.objects.filter(is_active=True).select_related('role')
    user_types = {}
    for ur in user_roles:
        if ur.user_type not in user_types:
            user_types[ur.user_type] = []
        user_types[ur.user_type].append(ur)
    
    for user_type, assignments in sorted(user_types.items()):
        print(f"\n  {user_type}:")
        role_counts = {}
        for ur in assignments:
            role_name = ur.role.name
            role_counts[role_name] = role_counts.get(role_name, 0) + 1
        
        for role_name, count in sorted(role_counts.items()):
            print(f"    {role_name:25} | {count:3} users")
    
    # Check role-permission mappings
    print("\n4. ROLE-PERMISSION MAPPINGS:")
    for role in roles:
        perms = RolePermission.objects.filter(role=role).select_related('permission')
        if perms.exists():
            print(f"\n  {role.name} ({role.display_name}):")
            perm_summary = {}
            for rp in perms:
                key = f"{rp.permission.category}.{rp.permission.resource}"
                if key not in perm_summary:
                    perm_summary[key] = []
                perm_summary[key].append(rp.permission.action)
            
            for resource, actions in sorted(perm_summary.items()):
                print(f"    {resource}: {', '.join(sorted(actions))}")
    
    print("\n" + "=" * 80)

def check_user_permissions():
    """Check what permissions specific users have"""
    print("\n5. USER PERMISSION CHECK:")
    print("-" * 80)
    
    # Check admins
    print("\n  Admins:")
    admins = Admin.objects.all()[:5]
    for admin in admins:
        user_roles = UserRole.objects.filter(
            user_id=str(admin.id),
            user_type='ADMIN',
            is_active=True
        ).select_related('role')
        
        roles = [ur.role.name for ur in user_roles]
        print(f"    {admin.email:40} | Roles: {', '.join(roles) if roles else 'NONE'}")
    
    # Check landlords
    print("\n  Landlords (sample):")
    landlords = Landlord.objects.all()[:5]
    for landlord in landlords:
        user_roles = UserRole.objects.filter(
            user_id=str(landlord.landlord_id),
            user_type='LANDLORD',
            is_active=True
        ).select_related('role')
        
        roles = [ur.role.name for ur in user_roles]
        print(f"    {landlord.email:40} | Roles: {', '.join(roles) if roles else 'NONE'}")
    
    # Check tenants
    print("\n  Tenants (sample):")
    tenants = Tenant.objects.all()[:5]
    for tenant in tenants:
        user_roles = UserRole.objects.filter(
            user_id=str(tenant.tenant_id),
            user_type='TENANT',
            is_active=True
        ).select_related('role')
        
        roles = [ur.role.name for ur in user_roles]
        print(f"    {tenant.email:40} | Roles: {', '.join(roles) if roles else 'NONE'}")

def identify_issues():
    """Identify RBAC issues"""
    print("\n6. IDENTIFIED ISSUES:")
    print("-" * 80)
    
    issues = []
    
    # Check if all users have roles
    admin_user_ids = UserRole.objects.filter(
        user_type='ADMIN',
        is_active=True
    ).values_list('user_id', flat=True)
    
    admins_without_roles = []
    for admin in Admin.objects.filter(is_active=True):
        if str(admin.id) not in admin_user_ids and admin.email not in admin_user_ids:
            admins_without_roles.append(admin)
    
    if admins_without_roles:
        count = len(admins_without_roles)
        issues.append(f"  - {count} active Admin(s) without roles assigned")
        for admin in admins_without_roles[:3]:
            issues.append(f"    * {admin.email}")
    
    landlords_without_roles = Landlord.objects.filter(
        approval_status='APPROVED'
    ).exclude(
        landlord_id__in=UserRole.objects.filter(
            user_type='LANDLORD',
            is_active=True
        ).values_list('user_id', flat=True)
    )
    
    if landlords_without_roles.exists():
        count = landlords_without_roles.count()
        issues.append(f"  - {count} approved Landlord(s) without roles assigned")
    
    tenants_without_roles = Tenant.objects.filter(
        status='ACTIVE',
        approval_status='APPROVED'
    ).exclude(
        tenant_id__in=UserRole.objects.filter(
            user_type='TENANT',
            is_active=True
        ).values_list('user_id', flat=True)
    )
    
    if tenants_without_roles.exists():
        count = tenants_without_roles.count()
        issues.append(f"  - {count} active Tenant(s) without roles assigned")
    
    # Check if roles have permissions
    roles_without_perms = Role.objects.filter(
        is_active=True
    ).exclude(
        id__in=RolePermission.objects.values_list('role_id', flat=True)
    )
    
    if roles_without_perms.exists():
        count = roles_without_perms.count()
        issues.append(f"  - {count} active Role(s) without permissions assigned")
        for role in roles_without_perms:
            issues.append(f"    * {role.name}")
    
    if issues:
        for issue in issues:
            print(issue)
    else:
        print("  No issues found!")
    
    print("\n" + "=" * 80)
    
    return issues

if __name__ == '__main__':
    check_rbac_structure()
    check_user_permissions()
    issues = identify_issues()
    
    print("\n" + "=" * 80)
    print("AUDIT COMPLETE")
    print("=" * 80)
    print(f"\nFound {len(issues)} issue(s) to address.")
    print("\nNext steps:")
    print("1. Review the issues above")
    print("2. Run fix script to assign missing roles/permissions")
    print("3. Verify permissions match React app structure")

