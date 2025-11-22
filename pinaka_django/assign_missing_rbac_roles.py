#!/usr/bin/env python
"""
Assign Missing RBAC Roles
Assigns roles to users who are missing them
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from domains.rbac.models import Role, UserRole
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from django.db import transaction
from django.utils import timezone

@transaction.atomic
def assign_roles():
    """Assign missing roles to users"""
    print("=" * 80)
    print("ASSIGNING MISSING RBAC ROLES")
    print("=" * 80)
    
    # Get roles
    owner_landlord_role = Role.objects.get(name='OWNER_LANDLORD')
    tenant_role = Role.objects.get(name='TENANT')
    
    # Assign OWNER_LANDLORD role to landlords without roles
    print("\n1. Assigning OWNER_LANDLORD role to landlords...")
    landlord_user_ids = set(
        UserRole.objects.filter(
            user_type='LANDLORD',
            is_active=True
        ).values_list('user_id', flat=True)
    )
    
    landlords_to_fix = Landlord.objects.filter(
        approval_status='APPROVED'
    ).exclude(
        landlord_id__in=landlord_user_ids
    )
    
    count = 0
    for landlord in landlords_to_fix:
        UserRole.objects.get_or_create(
            user_id=str(landlord.landlord_id),
            user_type='LANDLORD',
            role=owner_landlord_role,
            defaults={
                'is_active': True,
                'assigned_at': timezone.now(),
            }
        )
        count += 1
    
    print(f"   ✓ Assigned OWNER_LANDLORD role to {count} landlord(s)")
    
    # Assign TENANT role to tenants without roles
    print("\n2. Assigning TENANT role to tenants...")
    tenant_user_ids = set(
        UserRole.objects.filter(
            user_type='TENANT',
            is_active=True
        ).values_list('user_id', flat=True)
    )
    
    tenants_to_fix = Tenant.objects.filter(
        status='ACTIVE',
        approval_status='APPROVED'
    ).exclude(
        tenant_id__in=tenant_user_ids
    )
    
    count = 0
    for tenant in tenants_to_fix:
        UserRole.objects.get_or_create(
            user_id=str(tenant.tenant_id),
            user_type='TENANT',
            role=tenant_role,
            defaults={
                'is_active': True,
                'assigned_at': timezone.now(),
            }
        )
        count += 1
    
    print(f"   ✓ Assigned TENANT role to {count} tenant(s)")
    
    print("\n" + "=" * 80)
    print("ROLE ASSIGNMENT COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    assign_roles()

