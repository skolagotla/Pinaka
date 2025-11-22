#!/usr/bin/env python
"""
Migrate Landlords, PMCs, and RBAC data
"""
import os
import sys
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection, transaction
from domains.landlord.models import Landlord
from domains.pmc.models import PropertyManagementCompany
from domains.rbac.models import Admin, Role, Permission, UserRole


def execute_query(query):
    """Execute SQL and return results"""
    with connection.cursor() as cursor:
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


@transaction.atomic
def migrate_landlords():
    """Migrate Landlord data"""
    print("\n📦 Migrating Landlords...")
    
    query = '''
        SELECT 
            id, "landlordId", "firstName", "middleName", "lastName",
            email, phone, "addressLine1", "addressLine2", city,
            "provinceState", "postalZip", country, "countryCode", "regionCode",
            "organizationId", timezone, theme, "signatureFileName",
            "approvalStatus", "approvedBy", "approvedAt", "rejectedBy",
            "rejectedAt", "rejectionReason", "invitedBy", "invitedAt",
            "createdAt", "updatedAt"
        FROM "Landlord"
        ORDER BY "createdAt"
    '''
    
    prisma_landlords = execute_query(query)
    count = 0
    
    for l in prisma_landlords:
        # Map Prisma approval status to Django
        status_map = {
            'PENDING': 'PENDING',
            'APPROVED': 'APPROVED',
            'REJECTED': 'REJECTED',
        }
        django_status = status_map.get(l.get('approvalStatus', 'PENDING'), 'PENDING')
        
        landlord_obj, created = Landlord.objects.get_or_create(
            landlord_id=l['landlordId'],
            defaults={
                'first_name': l['firstName'],
                'middle_name': l.get('middleName'),
                'last_name': l['lastName'],
                'email': l['email'],
                'phone': l.get('phone'),
                'address_line1': l.get('addressLine1'),
                'address_line2': l.get('addressLine2'),
                'city': l.get('city'),
                'province_state': l.get('provinceState'),
                'postal_zip': l.get('postalZip'),
                'country': l.get('country'),
                'country_code': l.get('countryCode'),
                'region_code': l.get('regionCode'),
                'organization_id': l.get('organizationId'),
                'timezone': l.get('timezone', 'America/Toronto'),
                'theme': l.get('theme', 'default'),
                'signature_file_name': l.get('signatureFileName'),
                'approval_status': django_status,
                'approved_by': l.get('approvedBy'),
                'approved_at': l.get('approvedAt'),
                'rejected_by': l.get('rejectedBy'),
                'rejected_at': l.get('rejectedAt'),
                'rejection_reason': l.get('rejectionReason'),
                'invited_by': l.get('invitedBy'),
                'invited_at': l.get('invitedAt'),
            }
        )
        if created:
            count += 1
    
    print(f"✅ Migrated {count} landlords")
    return count


@transaction.atomic
def migrate_pmcs():
    """Migrate Property Management Company data"""
    print("\n📦 Migrating Property Management Companies...")
    
    query = '''
        SELECT 
            id, "companyId", "companyName", email, phone,
            "addressLine1", "addressLine2", city, "provinceState",
            "postalZip", country, "countryCode", "regionCode",
            "defaultCommissionRate", "commissionStructure",
            "approvalStatus", "approvedBy", "approvedAt", "rejectedBy",
            "rejectedAt", "rejectionReason", "invitedBy", "invitedAt",
            "isActive", "createdAt", "updatedAt"
        FROM "PropertyManagementCompany"
        ORDER BY "createdAt"
    '''
    
    prisma_pmcs = execute_query(query)
    count = 0
    
    for p in prisma_pmcs:
        # Map Prisma approval status to Django
        status_map = {
            'PENDING': 'PENDING',
            'APPROVED': 'APPROVED',
            'REJECTED': 'REJECTED',
        }
        django_status = status_map.get(p.get('approvalStatus', 'PENDING'), 'PENDING')
        
        pmc_obj, created = PropertyManagementCompany.objects.get_or_create(
            company_id=p['companyId'],
            defaults={
                'company_name': p['companyName'],
                'email': p['email'],
                'phone': p.get('phone'),
                'address_line1': p.get('addressLine1'),
                'address_line2': p.get('addressLine2'),
                'city': p.get('city'),
                'province_state': p.get('provinceState'),
                'postal_zip': p.get('postalZip'),
                'country': p.get('country'),
                'country_code': p.get('countryCode'),
                'region_code': p.get('regionCode'),
                'default_commission_rate': p.get('defaultCommissionRate'),
                'commission_structure': p.get('commissionStructure'),
                'is_active': p.get('isActive', True),
                'approval_status': django_status,
                'approved_by': p.get('approvedBy'),
                'approved_at': p.get('approvedAt'),
                'rejected_by': p.get('rejectedBy'),
                'rejected_at': p.get('rejectedAt'),
                'rejection_reason': p.get('rejectionReason'),
                'invited_by': p.get('invitedBy'),
                'invited_at': p.get('invitedAt'),
            }
        )
        if created:
            count += 1
    
    print(f"✅ Migrated {count} PMCs")
    return count


@transaction.atomic
def migrate_admins():
    """Migrate Admin/RBAC data"""
    print("\n📦 Migrating Admins...")
    
    query = '''
        SELECT 
            id, email, "googleId", "firstName", "lastName", phone,
            role, "isActive", "isLocked", "lastLoginAt", "lastLoginIp",
            "allowedGoogleDomains", "ipWhitelist", "requireIpWhitelist",
            "createdAt", "updatedAt"
        FROM "Admin"
        ORDER BY "createdAt"
    '''
    
    prisma_admins = execute_query(query)
    count = 0
    
    for a in prisma_admins:
        # Map Prisma role to Django
        role_map = {
            'PLATFORM_ADMIN': 'PLATFORM_ADMIN',
            'SUPPORT': 'SUPPORT',
            'VIEWER': 'VIEWER',
        }
        django_role = role_map.get(a.get('role', 'PLATFORM_ADMIN'), 'PLATFORM_ADMIN')
        
        admin_obj, created = Admin.objects.get_or_create(
            email=a['email'],
            defaults={
                'google_id': a.get('googleId'),
                'first_name': a['firstName'],
                'last_name': a['lastName'],
                'phone': a.get('phone'),
                'role': django_role,
                'is_active': a.get('isActive', True),
                'is_locked': a.get('isLocked', False),
                'last_login_at': a.get('lastLoginAt'),
                'last_login_ip': a.get('lastLoginIp'),
                'allowed_google_domains': a.get('allowedGoogleDomains', []),
                'ip_whitelist': a.get('ipWhitelist', []),
                'require_ip_whitelist': a.get('requireIpWhitelist', False),
            }
        )
        if created:
            count += 1
    
    print(f"✅ Migrated {count} admins")
    return count


def main():
    """Main migration function"""
    print("\n" + "="*70)
    print("🚀 MIGRATING LANDLORDS, PMCs, AND RBAC DATA")
    print("="*70)
    print(f"\n📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    stats = {}
    
    try:
        stats['landlords'] = migrate_landlords()
        stats['pmcs'] = migrate_pmcs()
        stats['admins'] = migrate_admins()
        
        print("\n" + "="*70)
        print("✅ MIGRATION COMPLETED!")
        print("="*70)
        print("\n📊 Migration Summary:")
        print(f"   • Landlords: {stats['landlords']:>4} migrated")
        print(f"   • PMCs:      {stats['pmcs']:>4} migrated")
        print(f"   • Admins:    {stats['admins']:>4} migrated")
        print(f"\n   TOTAL:       {sum(stats.values()):>4} records")
        
        # Verify counts
        print("\n📊 Verification - Django Database:")
        print(f"   • Landlords: {Landlord.objects.count():>4}")
        print(f"   • PMCs:      {PropertyManagementCompany.objects.count():>4}")
        print(f"   • Admins:    {Admin.objects.count():>4}")
        
        print(f"\n📅 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n✅ All RBAC data migrated successfully!")
        print()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

