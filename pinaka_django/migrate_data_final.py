#!/usr/bin/env python
"""
Final Data Migration Script: Prisma → Django
Handles ID mapping correctly by using Django ORM
"""
import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection, transaction
from domains.property.models import Property, Unit
from domains.tenant.models import Tenant
from domains.lease.models import Lease, LeaseTenant
from domains.payment.models import RentPayment, SecurityDeposit
from domains.maintenance.models import MaintenanceRequest


def execute_query(query):
    """Execute a raw SQL query and return results"""
    with connection.cursor() as cursor:
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


@transaction.atomic
def migrate_properties():
    """Migrate Property data"""
    print("\n📦 Migrating Properties...")
    
    query = '''
        SELECT 
            id, "propertyId", "landlordId", "propertyName",
            "addressLine1", "addressLine2", city, "provinceState",
            "postalZip", country, "propertyType",
            "createdAt", "updatedAt"
        FROM "Property"
        ORDER BY "createdAt"
    '''
    
    prisma_properties = execute_query(query)
    count = 0
    id_map = {}
    
    for p in prisma_properties:
        property_obj, created = Property.objects.get_or_create(
            property_name=p['propertyName'] or f"Property {p['propertyId']}",
            address_line1=p['addressLine1'],
            city=p['city'],
            postal_zip=p['postalZip'],
            defaults={
                'landlord_id': p['landlordId'],
                'address_line2': p.get('addressLine2') or '',
                'province_state': p['provinceState'],
                'country': p.get('country', 'Canada'),
                'property_type': p.get('propertyType', 'RESIDENTIAL'),
                'status': 'ACTIVE',  # Default status for all migrated properties
            }
        )
        id_map[p['propertyId']] = property_obj.id
        if created:
            count += 1
    
    print(f"✅ Migrated {count} properties")
    return count, id_map


@transaction.atomic
def migrate_units(property_id_map):
    """Migrate Unit data"""
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
        if u['propertyId'] not in property_id_map:
            print(f"⚠️  Skipping unit {u['unitName']} - property {u['propertyId']} not found")
            continue
        
        property_obj = Property.objects.get(id=property_id_map[u['propertyId']])
        
        unit_obj, created = Unit.objects.get_or_create(
            property=property_obj,
            unit_number=u['unitName'],
            defaults={
                'floor_number': u.get('floorNumber'),
                'bedrooms': u.get('bedrooms'),
                'bathrooms': u.get('bathrooms'),
                'rent_amount': u.get('rentPrice'),
                'status': u.get('status', 'AVAILABLE'),
            }
        )
        id_map[u['id']] = unit_obj.id
        if created:
            count += 1
    
    print(f"✅ Migrated {count} units")
    return count, id_map


@transaction.atomic
def migrate_tenants():
    """Migrate Tenant data"""
    print("\n📦 Migrating Tenants...")
    
    query = '''
        SELECT 
            id, "tenantId", "firstName", "middleName", "lastName",
            email, phone, "addressLine1", "addressLine2", city,
            "provinceState", "postalZip", country,
            "emergencyContactName", "emergencyContactPhone",
            "emergencyContactRelationship", "employerName",
            "employerPhone", "employerAddress", occupation, "annualIncome",
            status, "approvalStatus", "approvedAt", "rejectedAt",
            "rejectionReason", "signatureFileName",
            "createdAt", "updatedAt"
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
                'middle_name': t.get('middleName'),
                'last_name': t['lastName'],
                'email': t['email'],
                'phone': t.get('phone'),
                'address_line1': t.get('addressLine1'),
                'address_line2': t.get('addressLine2'),
                'city': t.get('city'),
                'province_state': t.get('provinceState'),
                'postal_zip': t.get('postalZip'),
                'country': t.get('country'),
                'emergency_contact_name': t.get('emergencyContactName'),
                'emergency_contact_phone': t.get('emergencyContactPhone'),
                'emergency_contact_relationship': t.get('emergencyContactRelationship'),
                'employer_name': t.get('employerName'),
                'employer_phone': t.get('employerPhone'),
                'employer_address': t.get('employerAddress'),
                'occupation': t.get('occupation'),
                'annual_income': t.get('annualIncome'),
                'status': t.get('status', 'PENDING'),
                'approval_status': t.get('approvalStatus', 'PENDING'),
                'approved_at': t.get('approvedAt'),
                'rejected_at': t.get('rejectedAt'),
                'rejection_reason': t.get('rejectionReason'),
                'signature_file_name': t.get('signatureFileName'),
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
        
        lease_obj, created = Lease.objects.get_or_create(
            lease_id=l['id'],
            defaults={
                'unit': unit_obj,
                'lease_start': l['leaseStart'],
                'lease_end': l.get('leaseEnd'),
                'rent_amount': l['rentAmount'],
                'rent_due_day': l.get('rentDueDay', 1),
                'security_deposit': l.get('securityDeposit'),
                'payment_method': l.get('paymentMethod'),
                'status': l.get('status', 'ACTIVE'),
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
        if lt['leaseId'] not in lease_id_map:
            continue
        if lt['tenantId'] not in tenant_id_map:
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
    """Migrate RentPayment data (last 100)"""
    print("\n📦 Migrating Rent Payments (recent 100)...")
    
    query = '''
        SELECT 
            id, "leaseId", amount, "paymentDate", "paymentMethod",
            "paymentForMonth", status, "referenceNumber", notes,
            "isLate", "lateFee", "receiptUrl", "createdAt", "updatedAt"
        FROM "RentPayment"
        ORDER BY "createdAt" DESC
        LIMIT 100
    '''
    
    prisma_payments = execute_query(query)
    count = 0
    
    for p in prisma_payments:
        if p['leaseId'] not in lease_id_map:
            continue
        
        lease_obj = Lease.objects.get(id=lease_id_map[p['leaseId']])
        
        _, created = RentPayment.objects.get_or_create(
            payment_id=p['id'],
            defaults={
                'lease': lease_obj,
                'amount': p['amount'],
                'payment_date': p['paymentDate'],
                'payment_method': p.get('paymentMethod', 'E_TRANSFER'),
                'payment_for_month': p.get('paymentForMonth', p['paymentDate']),
                'status': p.get('status', 'PAID'),
                'reference_number': p.get('referenceNumber'),
                'notes': p.get('notes'),
                'is_late': p.get('isLate', False),
                'late_fee': p.get('lateFee'),
                'receipt_url': p.get('receiptUrl'),
            }
        )
        if created:
            count += 1
    
    print(f"✅ Migrated {count} rent payments")
    return count


def print_summary(stats):
    """Print migration summary"""
    print("\n" + "="*70)
    print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
    print("="*70)
    print("\n📊 Migration Summary:")
    print(f"   • Properties:     {stats['properties']:>4} migrated")
    print(f"   • Units:          {stats['units']:>4} migrated")
    print(f"   • Tenants:        {stats['tenants']:>4} migrated")
    print(f"   • Leases:         {stats['leases']:>4} migrated")
    print(f"   • Lease-Tenants:  {stats['lease_tenants']:>4} migrated")
    print(f"   • Rent Payments:  {stats['rent_payments']:>4} migrated")
    print(f"\n   TOTAL:            {sum(stats.values()):>4} records")
    
    # Verify counts
    print("\n📊 Verification - Django Database:")
    print(f"   • Properties:     {Property.objects.count():>4}")
    print(f"   • Units:          {Unit.objects.count():>4}")
    print(f"   • Tenants:        {Tenant.objects.count():>4}")
    print(f"   • Leases:         {Lease.objects.count():>4}")
    print(f"   • Lease-Tenants:  {LeaseTenant.objects.count():>4}")
    print(f"   • Rent Payments:  {RentPayment.objects.count():>4}")


def main():
    """Main migration function"""
    print("\n" + "="*70)
    print("🚀 PRISMA → DJANGO DATA MIGRATION (Final)")
    print("="*70)
    print(f"\n📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    stats = {}
    id_maps = {}
    
    try:
        # Migrate in dependency order
        stats['properties'], id_maps['properties'] = migrate_properties()
        stats['units'], id_maps['units'] = migrate_units(id_maps['properties'])
        stats['tenants'], id_maps['tenants'] = migrate_tenants()
        stats['leases'], id_maps['leases'] = migrate_leases(id_maps['units'])
        stats['lease_tenants'] = migrate_lease_tenants(id_maps['leases'], id_maps['tenants'])
        stats['rent_payments'] = migrate_rent_payments(id_maps['leases'])
        
        print_summary(stats)
        
        print(f"\n📅 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n🎯 Next Steps:")
        print("   1. Verify data in admin: http://localhost:8000/admin")
        print("   2. Check your migrated data")
        print("   3. Ready to use!")
        print()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

