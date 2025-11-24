#!/usr/bin/env python3
"""
Script to apply performance indexes migration
This can be run manually if Alembic is not available
"""
import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Try to import, with helpful error message if dependencies are missing
try:
    from sqlalchemy import text
    from core.database import engine
except ImportError as e:
    print(f"❌ Error: Missing dependencies. Please install requirements:")
    print(f"   cd {backend_dir}")
    print(f"   pip install -r requirements.txt")
    print(f"\nOriginal error: {e}")
    sys.exit(1)


async def apply_indexes():
    """Apply performance indexes directly via SQL"""
    from sqlalchemy.ext.asyncio import create_async_engine
    from core.config import settings
    
    # Create engine from settings
    db_url = settings.DATABASE_URL
    engine = create_async_engine(db_url, echo=False)
    
    indexes = [
        # Work Orders
        "CREATE INDEX IF NOT EXISTS idx_work_orders_status_created ON work_orders (status, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS idx_work_orders_org_status_created ON work_orders (organization_id, status, created_at DESC)",
        
        # Leases
        "CREATE INDEX IF NOT EXISTS idx_leases_status_created ON leases (status, created_at DESC)",
        # Note: leases table doesn't have tenant_id directly (uses lease_tenants junction table)
        # "CREATE INDEX IF NOT EXISTS idx_leases_tenant_id_status ON leases (tenant_id, status)",
        
        # Properties
        "CREATE INDEX IF NOT EXISTS idx_properties_status_created ON properties (status, created_at DESC)",
        
        # Units
        "CREATE INDEX IF NOT EXISTS idx_units_status_property ON units (status, property_id)",
        
        # Tenants
        "CREATE INDEX IF NOT EXISTS idx_tenants_status_created ON tenants (status, created_at DESC)",
        
        # Rent Payments
        "CREATE INDEX IF NOT EXISTS idx_rent_payments_date_status ON rent_payments (payment_date, status)",
        "CREATE INDEX IF NOT EXISTS idx_rent_payments_lease_status ON rent_payments (lease_id, status)",
        
        # Expenses
        "CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses (expense_date, category)",
        "CREATE INDEX IF NOT EXISTS idx_expenses_work_order ON expenses (work_order_id)",
        
        # Notifications
        "CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications (user_id, is_read, created_at DESC)",
        
        # Tasks (will be created when tasks table exists)
        "CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON tasks (status, due_date)",
        "CREATE INDEX IF NOT EXISTS idx_tasks_org_status ON tasks (organization_id, status)",
        
        # Attachments
        "CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments (entity_type, entity_id)",
        
        # Audit Logs
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON audit_logs (actor_user_id, created_at DESC)",
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs (organization_id, created_at DESC)",
    ]
    
    print("Applying performance indexes...")
    success_count = 0
    error_count = 0
    
    # Apply each index in its own transaction to avoid cascading failures
    for i, index_sql in enumerate(indexes, 1):
        try:
            async with engine.begin() as conn:
                await conn.execute(text(index_sql))
                index_name = index_sql.split("idx_")[1].split(" ")[0] if "idx_" in index_sql else "unknown"
                print(f"  [{i}/{len(indexes)}] ✅ Created index: idx_{index_name}")
                success_count += 1
        except Exception as e:
            index_name = index_sql.split("idx_")[1].split(" ")[0] if "idx_" in index_sql else "unknown"
            error_msg = str(e)
            # Check if it's a column doesn't exist error
            if "does not exist" in error_msg or "UndefinedColumnError" in error_msg:
                print(f"  [{i}/{len(indexes)}] ⏭️  Skipped idx_{index_name}: Column doesn't exist in schema")
            else:
                print(f"  [{i}/{len(indexes)}] ⚠️  Index idx_{index_name}: {error_msg[:100]}")
            error_count += 1
    
    print(f"\n📊 Summary:")
    print(f"  ✅ Successfully created: {success_count}/{len(indexes)}")
    print(f"  ⚠️  Errors/Skipped: {error_count}/{len(indexes)}")
    
    if success_count > 0:
        print(f"\n✅ Applied {success_count} performance indexes successfully!")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(apply_indexes())

