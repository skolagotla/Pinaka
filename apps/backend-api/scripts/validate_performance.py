#!/usr/bin/env python3
"""
Script to validate performance optimizations
Checks that indexes exist and queries are optimized
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine
    from core.config import settings
except ImportError as e:
    print(f"❌ Error: Missing dependencies. Please install requirements:")
    print(f"   cd {Path(__file__).parent.parent}")
    print(f"   pip install -r requirements.txt")
    print(f"\nOriginal error: {e}")
    sys.exit(1)

# Create engine from settings
db_url = settings.DATABASE_URL
engine = create_async_engine(db_url, echo=False)


async def validate_indexes():
    """Check that performance indexes exist"""
    print("🔍 Validating performance indexes...\n")
    
    # Core indexes (should exist)
    expected_indexes = [
        "idx_work_orders_status_created",
        "idx_work_orders_org_status_created",
        "idx_leases_status_created",
        "idx_properties_status_created",
        "idx_units_status_property",
        "idx_tenants_status_created",
        "idx_rent_payments_date_status",
        "idx_rent_payments_lease_status",
        "idx_expenses_date_category",
        "idx_notifications_user_read_created",
        "idx_attachments_entity",
        "idx_audit_logs_actor_created",
        "idx_audit_logs_org_created",
    ]
    
    # Optional indexes (depend on schema)
    optional_indexes = [
        "idx_leases_tenant_id_status",  # leases table doesn't have tenant_id directly
        "idx_expenses_work_order",  # may not exist if expenses table not migrated
        "idx_tasks_status_due_date",  # requires tasks table
        "idx_tasks_org_status",  # requires tasks table
    ]
    
    async with engine.begin() as conn:
        # Get all indexes
        result = await conn.execute(text("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public'
            AND indexname LIKE 'idx_%'
            ORDER BY indexname
        """))
        existing_indexes = {row[0] for row in result}
        
        print(f"Found {len(existing_indexes)} indexes in database\n")
        
        missing = []
        found = []
        optional_found = []
        optional_missing = []
        
        # Check core indexes
        for idx in expected_indexes:
            if idx in existing_indexes:
                found.append(idx)
                print(f"  ✅ {idx}")
            else:
                missing.append(idx)
                print(f"  ❌ {idx} (MISSING)")
        
        # Check optional indexes
        for idx in optional_indexes:
            if idx in existing_indexes:
                optional_found.append(idx)
                print(f"  ✅ {idx} (optional)")
            else:
                optional_missing.append(idx)
                print(f"  ⏭️  {idx} (optional - schema limitation)")
        
        print(f"\n📊 Summary:")
        print(f"  ✅ Core indexes: {len(found)}/{len(expected_indexes)}")
        print(f"  ⏭️  Optional indexes: {len(optional_found)}/{len(optional_indexes)}")
        
        if missing:
            print(f"\n⚠️  Missing core indexes detected. Run migration to create them:")
            print(f"   cd apps/backend-api && python scripts/apply_performance_indexes.py")
            return False
        else:
            print(f"\n✅ All core performance indexes are present!")
            if optional_missing:
                print(f"   Note: {len(optional_missing)} optional indexes skipped (schema limitations)")
            return True


async def validate_tables():
    """Check that required tables exist"""
    print("\n🔍 Validating database tables...\n")
    
    # Core required tables (must exist)
    required_tables = [
        "organizations", "users", "roles", "user_roles",
        "properties", "units", "tenants", "leases", "lease_tenants",
        "work_orders", "work_order_comments", "work_order_assignments",
        "rent_payments", "expenses", "notifications",
        "attachments", "audit_logs"
    ]
    
    # Optional tables (may not exist yet)
    optional_tables = ["tasks"]
    
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        existing_tables = {row[0] for row in result}
        
        missing = []
        for table in required_tables:
            if table in existing_tables:
                print(f"  ✅ {table}")
            else:
                missing.append(table)
                print(f"  ❌ {table} (MISSING)")
        
        # Check optional tables
        for table in optional_tables:
            if table in existing_tables:
                print(f"  ✅ {table} (optional)")
            else:
                print(f"  ⏭️  {table} (optional - not present)")
        
        if missing:
            print(f"\n⚠️  Missing required tables: {', '.join(missing)}")
            return False
        else:
            print(f"\n✅ All required tables exist!")
            return True


async def main():
    """Run all validations"""
    print("=" * 60)
    print("Performance Optimization Validation")
    print("=" * 60)
    print()
    
    tables_ok = await validate_tables()
    indexes_ok = await validate_indexes()
    
    print("\n" + "=" * 60)
    if tables_ok and indexes_ok:
        print("✅ All validations passed!")
        print("=" * 60)
        return 0
    else:
        print("⚠️  Some validations failed. Please review above.")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

