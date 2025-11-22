#!/usr/bin/env python
"""
Data Migration Script: Prisma → Django
Migrates existing data from Prisma tables to Django models
"""
import os
import sys
import django
from datetime import datetime, timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection, transaction
from domains.property.models import Property, Unit
from domains.tenant.models import Tenant
from domains.lease.models import Lease, LeaseTenant
from domains.payment.models import RentPayment
from domains.maintenance.models import MaintenanceRequest


def execute_query(query):
    """Execute a raw SQL query and return results"""
    with connection.cursor() as cursor:
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]


@transaction.atomic
def migrate_properties():
    """Migrate Property data from Prisma to Django"""
    print("\n📦 Migrating Properties...")
    
    query = '''
        SELECT 
            id, "propertyId", "landlordId", "propertyName",
            "addressLine1", "addressLine2", city, "provinceState",
            "postalZip", country, "createdAt", "updatedAt"
        FROM "Property"
        ORDER BY "createdAt"
    '''
    
    prisma_properties = execute_query(query)
    count = 0
    
    for p in prisma_properties:
        # Store mapping between Prisma ID and Django object
        property_obj, created = Property.objects.get_or_create(
            property_name=p['propertyName'] or f"Property {p['propertyId']}",
            address_line1=p['addressLine1'],
            city=p['city'],
            postal_zip=p['postalZip'],
            defaults={
                'landlord_id': p['landlordId'],
                'address_line2': p['addressLine2'] or '',
                'province_state': p['provinceState'],
                'country': p['country'],
            }
        )
        # Store mapping for later use
        if not hasattr(migrate_properties, 'id_map'):
            migrate_properties.id_map = {}
        migrate_properties.id_map[p['propertyId']] = property_obj.id
        count += 1
    
    print(f"✅ Migrated {count} properties")
    return count


@transaction.atomic
def migrate_units():
    """Migrate Unit data from Prisma to Django"""
    print("\n📦 Migrating Units...")
    
    query = '''
        SELECT 
            id, "propertyId", "unitNumber", "floorNumber",
            bedrooms, bathrooms, "squareFeet", "rentAmount",
            status, "availableFrom", "createdAt", "updatedAt"
        FROM "Unit"
        ORDER BY "createdAt"
    '''
    
    prisma_units = execute_query(query)
    count = 0
    
    for u in prisma_units:
        try:
            property_obj = Property.objects.get(property_id=u['propertyId'])
            Unit.objects.get_or_create(
                property=property_obj,
                unit_number=u['unitNumber'],
                defaults={
                    'floor_number': u.get('floorNumber'),
                    'bedrooms': u.get('bedrooms'),
                    'bathrooms': u.get('bathrooms'),
                    'square_feet': u.get('squareFeet'),
                    'rent_amount': u.get('rentAmount'),
                    'status': u.get('status', 'Available'),
                    'available_from': u.get('availableFrom'),
                    'created_at': u['createdAt'],
                    'updated_at': u['updatedAt'],
                }
            )
            count += 1
        except Property.DoesNotExist:
            print(f"⚠️  Skipping unit {u['unitNumber']} - property {u['propertyId']} not found")
    
    print(f"✅ Migrated {count} units")
    return count


@transaction.atomic
def migrate_tenants():
    """Migrate Tenant data from Prisma to Django"""
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
    
    for t in prisma_tenants:
        Tenant.objects.get_or_create(
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
                'created_at': t['createdAt'],
                'updated_at': t['updatedAt'],
            }
        )
        count += 1
    
    print(f"✅ Migrated {count} tenants")
    return count


@transaction.atomic
def migrate_leases():
    """Migrate Lease data from Prisma to Django"""
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
    
    for l in prisma_leases:
        try:
            # Find the unit by its original Prisma ID
            unit_query = f'''
                SELECT "propertyId", "unitNumber" 
                FROM "Unit" 
                WHERE id = '{l['unitId']}'
            '''
            unit_data = execute_query(unit_query)
            
            if unit_data:
                property_obj = Property.objects.get(property_id=unit_data[0]['propertyId'])
                unit_obj = Unit.objects.get(
                    property=property_obj,
                    unit_number=unit_data[0]['unitNumber']
                )
                
                Lease.objects.get_or_create(
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
                        'created_at': l['createdAt'],
                        'updated_at': l['updatedAt'],
                    }
                )
                count += 1
        except (Property.DoesNotExist, Unit.DoesNotExist) as e:
            print(f"⚠️  Skipping lease {l['id']} - unit not found: {e}")
    
    print(f"✅ Migrated {count} leases")
    return count


@transaction.atomic
def migrate_lease_tenants():
    """Migrate LeaseTenant relationships from Prisma to Django"""
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
        try:
            lease_obj = Lease.objects.get(lease_id=lt['leaseId'])
            tenant_obj = Tenant.objects.get(tenant_id=lt['tenantId'])
            
            LeaseTenant.objects.get_or_create(
                lease=lease_obj,
                tenant=tenant_obj,
                defaults={
                    'is_primary_tenant': lt.get('isPrimaryTenant', False),
                    'added_at': lt['addedAt'],
                }
            )
            count += 1
        except (Lease.DoesNotExist, Tenant.DoesNotExist) as e:
            print(f"⚠️  Skipping lease-tenant relationship - not found: {e}")
    
    print(f"✅ Migrated {count} lease-tenant relationships")
    return count


@transaction.atomic
def migrate_rent_payments():
    """Migrate RentPayment data from Prisma to Django"""
    print("\n📦 Migrating Rent Payments...")
    
    query = '''
        SELECT 
            id, "leaseId", amount, "paymentDate", "paymentMethod",
            "paymentForMonth", status, "referenceNumber", notes,
            "isLate", "lateFee", "receiptUrl", "createdAt", "updatedAt"
        FROM "RentPayment"
        ORDER BY "createdAt"
        LIMIT 100
    '''
    
    prisma_payments = execute_query(query)
    count = 0
    
    for p in prisma_payments:
        try:
            lease_obj = Lease.objects.get(lease_id=p['leaseId'])
            
            RentPayment.objects.get_or_create(
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
                    'created_at': p['createdAt'],
                    'updated_at': p['updatedAt'],
                }
            )
            count += 1
        except Lease.DoesNotExist:
            print(f"⚠️  Skipping payment {p['id']} - lease not found")
    
    print(f"✅ Migrated {count} rent payments")
    return count


def main():
    """Main migration function"""
    print("\n" + "="*70)
    print("🚀 PRISMA → DJANGO DATA MIGRATION")
    print("="*70)
    print(f"\n📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    stats = {
        'properties': 0,
        'units': 0,
        'tenants': 0,
        'leases': 0,
        'lease_tenants': 0,
        'rent_payments': 0,
    }
    
    try:
        # Migrate in dependency order
        stats['properties'] = migrate_properties()
        stats['units'] = migrate_units()
        stats['tenants'] = migrate_tenants()
        stats['leases'] = migrate_leases()
        stats['lease_tenants'] = migrate_lease_tenants()
        stats['rent_payments'] = migrate_rent_payments()
        
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
        
        print(f"\n📅 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n🎯 Next Steps:")
        print("   1. Verify data in Django admin: http://localhost:8000/admin")
        print("   2. Check API endpoints: http://localhost:8000/api/docs/")
        print("   3. Start building your frontend!")
        print()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

