#!/usr/bin/env python
"""
Simplified Data Migration Script: Prisma → Django
Uses direct SQL INSERT to preserve IDs and relationships
"""
import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection, transaction


def execute_sql(sql, params=None):
    """Execute SQL and return count of affected rows"""
    with connection.cursor() as cursor:
        cursor.execute(sql, params or [])
        return cursor.rowcount


def query_count(table):
    """Get count from table"""
    with connection.cursor() as cursor:
        cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
        return cursor.fetchone()[0]


@transaction.atomic
def migrate_all_data():
    """Migrate all data using direct SQL INSERT"""
    print("\n" + "="*70)
    print("🚀 PRISMA → DJANGO DATA MIGRATION (Simplified)")
    print("="*70)
    print(f"\n📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    stats = {}
    
    # 1. Properties
    print("📦 Migrating Properties...")
    sql = '''
        INSERT INTO properties (
            landlord_id, property_name, address_line1, address_line2,
            city, province_state, postal_zip, country,
            property_type, status, unit_count, created_at, updated_at
        )
        SELECT 
            "landlordId",
            COALESCE("propertyName", 'Property ' || "propertyId"),
            "addressLine1",
            COALESCE("addressLine2", ''),
            city,
            "provinceState",
            "postalZip",
            country,
            'RESIDENTIAL',
            'ACTIVE',
            0,
            "createdAt",
            "updatedAt"
        FROM "Property"
        ON CONFLICT DO NOTHING
    '''
    stats['properties'] = execute_sql(sql)
    print(f"✅ Migrated {stats['properties']} properties")
    
    # 2. Units
    print("\n📦 Migrating Units...")
    sql = '''
        INSERT INTO units (
            property_id, unit_number, floor_number, bedrooms, bathrooms,
            square_feet, rent_amount, status, available_from,
            created_at, updated_at
        )
        SELECT 
            p.id,
            u."unitNumber",
            u."floorNumber",
            u.bedrooms,
            u.bathrooms,
            u."squareFeet",
            u."rentAmount",
            COALESCE(u.status, 'Available'),
            u."availableFrom",
            u."createdAt",
            u."updatedAt"
        FROM "Unit" u
        INNER JOIN "Property" prisma_prop ON u."propertyId" = prisma_prop."propertyId"
        INNER JOIN properties p ON 
            p.address_line1 = prisma_prop."addressLine1" AND
            p.city = prisma_prop.city AND
            p.postal_zip = prisma_prop."postalZip"
        ON CONFLICT DO NOTHING
    '''
    stats['units'] = execute_sql(sql)
    print(f"✅ Migrated {stats['units']} units")
    
    # 3. Tenants
    print("\n📦 Migrating Tenants...")
    sql = '''
        INSERT INTO tenants (
            tenant_id, first_name, middle_name, last_name, email, phone,
            address_line1, address_line2, city, province_state, postal_zip, country,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
            employer_name, employer_phone, employer_address, occupation, annual_income,
            status, approval_status, approved_at, rejected_at, rejection_reason,
            signature_file_name, created_at, updated_at
        )
        SELECT 
            "tenantId",
            "firstName",
            "middleName",
            "lastName",
            email,
            phone,
            "addressLine1",
            "addressLine2",
            city,
            "provinceState",
            "postalZip",
            country,
            "emergencyContactName",
            "emergencyContactPhone",
            "emergencyContactRelationship",
            "employerName",
            "employerPhone",
            "employerAddress",
            occupation,
            "annualIncome",
            COALESCE(status, 'PENDING'),
            COALESCE("approvalStatus", 'PENDING'),
            "approvedAt",
            "rejectedAt",
            "rejectionReason",
            "signatureFileName",
            "createdAt",
            "updatedAt"
        FROM "Tenant"
        ON CONFLICT (tenant_id) DO NOTHING
    '''
    stats['tenants'] = execute_sql(sql)
    print(f"✅ Migrated {stats['tenants']} tenants")
    
    # 4. Leases
    print("\n📦 Migrating Leases...")
    sql = '''
        INSERT INTO leases (
            lease_id, unit_id, lease_start, lease_end, rent_amount,
            rent_due_day, security_deposit, payment_method, status,
            renewal_reminder_sent, renewal_reminder_sent_at,
            renewal_decision, renewal_decision_at, renewal_decision_by,
            created_at, updated_at
        )
        SELECT 
            l.id,
            u.id,
            l."leaseStart",
            l."leaseEnd",
            l."rentAmount",
            COALESCE(l."rentDueDay", 1),
            l."securityDeposit",
            l."paymentMethod",
            COALESCE(l.status, 'ACTIVE'),
            COALESCE(l."renewalReminderSent", false),
            l."renewalReminderSentAt",
            l."renewalDecision",
            l."renewalDecisionAt",
            l."renewalDecisionBy",
            l."createdAt",
            l."updatedAt"
        FROM "Lease" l
        INNER JOIN "Unit" prisma_unit ON l."unitId" = prisma_unit.id
        INNER JOIN "Property" prisma_prop ON prisma_unit."propertyId" = prisma_prop."propertyId"
        INNER JOIN properties p ON 
            p.address_line1 = prisma_prop."addressLine1" AND
            p.city = prisma_prop.city AND
            p.postal_zip = prisma_prop."postalZip"
        INNER JOIN units u ON 
            u.property_id = p.id AND
            u.unit_number = prisma_unit."unitNumber"
        ON CONFLICT (lease_id) DO NOTHING
    '''
    stats['leases'] = execute_sql(sql)
    print(f"✅ Migrated {stats['leases']} leases")
    
    # 5. Lease-Tenant relationships
    print("\n📦 Migrating Lease-Tenant Relationships...")
    sql = '''
        INSERT INTO lease_tenants (
            lease_id, tenant_id, is_primary_tenant, added_at
        )
        SELECT 
            l.id,
            t.id,
            COALESCE(lt."isPrimaryTenant", false),
            lt."addedAt"
        FROM "LeaseTenant" lt
        INNER JOIN leases l ON l.lease_id = lt."leaseId"
        INNER JOIN tenants t ON t.tenant_id = lt."tenantId"
        ON CONFLICT (lease_id, tenant_id) DO NOTHING
    '''
    stats['lease_tenants'] = execute_sql(sql)
    print(f"✅ Migrated {stats['lease_tenants']} lease-tenant relationships")
    
    # 6. Rent Payments (limit to recent 100 for initial migration)
    print("\n📦 Migrating Rent Payments (recent 100)...")
    sql = '''
        INSERT INTO rent_payments (
            payment_id, lease_id, amount, payment_date, payment_method,
            payment_for_month, status, reference_number, notes,
            is_late, late_fee, receipt_url, created_at, updated_at
        )
        SELECT 
            rp.id,
            l.id,
            rp.amount,
            rp."paymentDate",
            COALESCE(rp."paymentMethod", 'E_TRANSFER'),
            COALESCE(rp."paymentForMonth", rp."paymentDate"),
            COALESCE(rp.status, 'PAID'),
            rp."referenceNumber",
            rp.notes,
            COALESCE(rp."isLate", false),
            rp."lateFee",
            rp."receiptUrl",
            rp."createdAt",
            rp."updatedAt"
        FROM "RentPayment" rp
        INNER JOIN leases l ON l.lease_id = rp."leaseId"
        ORDER BY rp."createdAt" DESC
        LIMIT 100
        ON CONFLICT (payment_id) DO NOTHING
    '''
    stats['rent_payments'] = execute_sql(sql)
    print(f"✅ Migrated {stats['rent_payments']} rent payments")
    
    # Print summary
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
    print("\n📊 Current Django Database Counts:")
    print(f"   • Properties:     {query_count('properties'):>4}")
    print(f"   • Units:          {query_count('units'):>4}")
    print(f"   • Tenants:        {query_count('tenants'):>4}")
    print(f"   • Leases:         {query_count('leases'):>4}")
    print(f"   • Lease-Tenants:  {query_count('lease_tenants'):>4}")
    print(f"   • Rent Payments:  {query_count('rent_payments'):>4}")
    
    print(f"\n📅 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n🎯 Next Steps:")
    print("   1. Verify data in Django admin: http://localhost:8000/admin")
    print("   2. Check API endpoints: http://localhost:8000/api/docs/")
    print("   3. Your data is now in Django - start building!")
    print()


def main():
    """Main entry point"""
    try:
        migrate_all_data()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

