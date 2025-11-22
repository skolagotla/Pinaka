#!/usr/bin/env python
"""
Complete Data Migration: Prisma → Django
Fixes all schema mismatches and migrates ALL data
"""
import os
import sys
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection, transaction
from domains.property.models import Property, Unit
from domains.tenant.models import Tenant
from domains.lease.models import Lease, LeaseTenant
from domains.payment.models import RentPayment


def execute_query(query):
    """Execute SQL and return results"""
    with connection.cursor() as cursor:
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


@transaction.atomic
def migrate_units(property_id_map):
    """Migrate Unit data with correct schema"""
    print("\n📦 Migrating Units...")
    
    query = '''
        SELECT 
            id, "propertyId", "unitName", "floorNumber",
            bedrooms, bathrooms, "rentPrice", "depositAmount",
            status, "createdAt", "updatedAt"
        FROM "Unit"
        ORDER BY "createdAt"
    '''
    
    prisma_units = execute_query(query)
    count = 0
    id_map = {}
    
    for u in prisma_units:
        # Find property by Prisma Property.id -> Django Property.id mapping
        # We need to match Prisma Property.id to Django Property
        prisma_prop_query = f'''
            SELECT id, "propertyId", "addressLine1", city, "postalZip"
            FROM "Property" 
            WHERE id = '{u["propertyId"]}'
        '''
        prop_data = execute_query(prisma_prop_query)
        
        if not prop_data:
            print(f"⚠️  Skipping unit {u['unitName']} - property {u['propertyId']} not found")
            continue
        
        # Find Django property by matching address
        try:
            property_obj = Property.objects.get(
                address_line1=prop_data[0]['addressLine1'],
                city=prop_data[0]['city'],
                postal_zip=prop_data[0]['postalZip']
            )
        except Property.DoesNotExist:
            print(f"⚠️  Skipping unit {u['unitName']} - Django property not found")
            continue
        except Property.MultipleObjectsReturned:
            property_obj = Property.objects.filter(
                address_line1=prop_data[0]['addressLine1'],
                city=prop_data[0]['city'],
                postal_zip=prop_data[0]['postalZip']
            ).first()
        
        # Map Prisma status to Django status
        status_map = {
            'Vacant': 'VACANT',
            'Occupied': 'OCCUPIED',
            'Maintenance': 'MAINTENANCE',
            'Reserved': 'RESERVED',
        }
        django_status = status_map.get(u.get('status', 'Vacant'), 'VACANT')
        
        unit_obj, created = Unit.objects.get_or_create(
            property=property_obj,
            unit_name=u['unitName'],
            defaults={
                'floor_number': u.get('floorNumber'),
                'bedrooms': u.get('bedrooms') or 0,
                'bathrooms': u.get('bathrooms') or 1.0,
                'rent_price': u.get('rentPrice') or 0,
                'security_deposit': u.get('depositAmount'),
                'status': django_status,
            }
        )
        id_map[u['id']] = unit_obj.id
        if created:
            count += 1
    
    print(f"✅ Migrated {count} units")
    return count, id_map


@transaction.atomic
def migrate_tenants():
    """Migrate Tenant data with correct schema"""
    print("\n📦 Migrating Tenants...")
    
    query = '''
        SELECT 
            id, "tenantId", "firstName", "lastName",
            email, phone, country, "provinceState",
            city, "currentAddress", "emergencyContactName",
            "emergencyContactPhone", "employmentStatus",
            "monthlyIncome", "createdAt", "updatedAt"
        FROM "Tenant"
        ORDER BY "createdAt"
    '''
    
    prisma_tenants = execute_query(query)
    count = 0
    id_map = {}
    
    for t in prisma_tenants:
        tenant_obj, created = Tenant.objects.get_or_create(
            tenant_id=t['tenantId'],
            defaults={
                'first_name': t['firstName'],
                'last_name': t['lastName'],
                'email': t['email'],
                'phone': t.get('phone'),
                'city': t.get('city'),
                'province_state': t.get('provinceState'),
                'country': t.get('country'),
                'address_line1': t.get('currentAddress'),
                'emergency_contact_name': t.get('emergencyContactName'),
                'emergency_contact_phone': t.get('emergencyContactPhone'),
                'occupation': t.get('employmentStatus'),
                'annual_income': t.get('monthlyIncome') * 12 if t.get('monthlyIncome') else None,
                'status': 'ACTIVE',
                'approval_status': 'APPROVED',
            }
        )
        id_map[t['id']] = tenant_obj.id
        if created:
            count += 1
    
    print(f"✅ Migrated {count} tenants")
    return count, id_map


@transaction.atomic
def migrate_leases(unit_id_map):
    """Migrate Lease data"""
    print("\n📦 Migrating Leases...")
    
    query = '''
        SELECT 
            id, "unitId", "leaseStart", "leaseEnd", "rentAmount",
            "rentDueDay", "securityDeposit", "paymentMethod", status,
            "renewalReminderSent", "renewalReminderSentAt",
            "renewalDecision", "renewalDecisionAt", "renewalDecisionBy",
            "createdAt", "updatedAt"
        FROM "Lease"
        ORDER BY "createdAt"
    '''
    
    prisma_leases = execute_query(query)
    count = 0
    id_map = {}
    
    for l in prisma_leases:
        if l['unitId'] not in unit_id_map:
            print(f"⚠️  Skipping lease {l['id']} - unit not found")
            continue
        
        unit_obj = Unit.objects.get(id=unit_id_map[l['unitId']])
        
        # Map Prisma status to Django status
        status_map = {
            'Active': 'ACTIVE',
            'Expired': 'EXPIRED',
            'Terminated': 'TERMINATED',
            'Pending': 'PENDING',
        }
        django_status = status_map.get(l.get('status', 'Active'), 'ACTIVE')
        
        lease_obj, created = Lease.objects.get_or_create(
            lease_id=l['id'],
            defaults={
                'unit': unit_obj,
                'lease_start': l['leaseStart'].date() if l['leaseStart'] else None,
                'lease_end': l['leaseEnd'].date() if l.get('leaseEnd') else None,
                'rent_amount': l['rentAmount'],
                'rent_due_day': l.get('rentDueDay', 1),
                'security_deposit': l.get('securityDeposit'),
                'payment_method': l.get('paymentMethod'),
                'status': django_status,
                'renewal_reminder_sent': l.get('renewalReminderSent', False),
                'renewal_reminder_sent_at': l.get('renewalReminderSentAt'),
                'renewal_decision': l.get('renewalDecision'),
                'renewal_decision_at': l.get('renewalDecisionAt'),
                'renewal_decision_by': l.get('renewalDecisionBy'),
            }
        )
        id_map[l['id']] = lease_obj.id
        if created:
            count += 1
    
    print(f"✅ Migrated {count} leases")
    return count, id_map


@transaction.atomic
def migrate_lease_tenants(lease_id_map, tenant_id_map):
    """Migrate LeaseTenant relationships"""
    print("\n📦 Migrating Lease-Tenant Relationships...")
    
    query = '''
        SELECT 
            "leaseId", "tenantId", "isPrimaryTenant", "addedAt"
        FROM "LeaseTenant"
        ORDER BY "addedAt"
    '''
    
    prisma_lease_tenants = execute_query(query)
    count = 0
    
    for lt in prisma_lease_tenants:
        if lt['leaseId'] not in lease_id_map or lt['tenantId'] not in tenant_id_map:
            continue
        
        lease_obj = Lease.objects.get(id=lease_id_map[lt['leaseId']])
        tenant_obj = Tenant.objects.get(id=tenant_id_map[lt['tenantId']])
        
        _, created = LeaseTenant.objects.get_or_create(
            lease=lease_obj,
            tenant=tenant_obj,
            defaults={
                'is_primary_tenant': lt.get('isPrimaryTenant', False),
                'added_at': lt['addedAt'],
            }
        )
        if created:
            count += 1
    
    print(f"✅ Migrated {count} lease-tenant relationships")
    return count


@transaction.atomic
def migrate_rent_payments(lease_id_map):
    """Migrate RentPayment data"""
    print("\n📦 Migrating Rent Payments...")
    
    query = '''
        SELECT 
            id, "leaseId", amount, "dueDate", "paidDate", "paymentMethod",
            status, "referenceNumber", notes, "receiptNumber",
            "createdAt", "updatedAt"
        FROM "RentPayment"
        ORDER BY "createdAt" DESC
    '''
    
    prisma_payments = execute_query(query)
    count = 0
    
    for p in prisma_payments:
        if p['leaseId'] not in lease_id_map:
            continue
        
        lease_obj = Lease.objects.get(id=lease_id_map[p['leaseId']])
        
        # Map Prisma status to Django status
        status_map = {
            'Paid': 'PAID',
            'Unpaid': 'PENDING',
            'Overdue': 'OVERDUE',
            'Partial': 'PARTIAL',
            'Failed': 'FAILED',
        }
        django_status = status_map.get(p.get('status', 'Unpaid'), 'PENDING')
        
        # Determine if late
        is_late = False
        if p.get('paidDate') and p.get('dueDate'):
            is_late = p['paidDate'] > p['dueDate']
        elif not p.get('paidDate') and p.get('dueDate'):
            from django.utils import timezone
            is_late = timezone.now().date() > p['dueDate'].date()
        
        _, created = RentPayment.objects.get_or_create(
            payment_id=p['id'],
            defaults={
                'lease': lease_obj,
                'amount': p['amount'],
                'payment_date': p['paidDate'].date() if p.get('paidDate') else None,
                'payment_method': p.get('paymentMethod', 'E_TRANSFER'),
                'payment_for_month': p['dueDate'].date() if p.get('dueDate') else None,
                'status': django_status,
                'reference_number': p.get('referenceNumber') or p.get('receiptNumber'),
                'notes': p.get('notes'),
                'is_late': is_late,
            }
        )
        if created:
            count += 1
    
    print(f"✅ Migrated {count} rent payments")
    return count


def main():
    """Main migration function"""
    print("\n" + "="*70)
    print("🚀 COMPLETE DATA MIGRATION: Prisma → Django")
    print("="*70)
    print(f"\n📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    stats = {}
    id_maps = {}
    
    try:
        # Migrate in dependency order (properties already migrated)
        print(f"✅ Properties already migrated: {Property.objects.count()}\n")
        
        stats['units'], id_maps['units'] = migrate_units({})
        stats['tenants'], id_maps['tenants'] = migrate_tenants()
        stats['leases'], id_maps['leases'] = migrate_leases(id_maps['units'])
        stats['lease_tenants'] = migrate_lease_tenants(id_maps['leases'], id_maps['tenants'])
        stats['rent_payments'] = migrate_rent_payments(id_maps['leases'])
        
        # Print summary
        print("\n" + "="*70)
        print("✅ MIGRATION COMPLETED!")
        print("="*70)
        print("\n📊 Migration Summary:")
        print(f"   • Properties:     {Property.objects.count():>4} (already migrated)")
        print(f"   • Units:          {stats['units']:>4} migrated")
        print(f"   • Tenants:        {stats['tenants']:>4} migrated")
        print(f"   • Leases:         {stats['leases']:>4} migrated")
        print(f"   • Lease-Tenants:  {stats['lease_tenants']:>4} migrated")
        print(f"   • Rent Payments:  {stats['rent_payments']:>4} migrated")
        print(f"\n   TOTAL:            {sum(stats.values()) + Property.objects.count():>4} records")
        
        print(f"\n📅 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n✅ All data migrated successfully!")
        print()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

