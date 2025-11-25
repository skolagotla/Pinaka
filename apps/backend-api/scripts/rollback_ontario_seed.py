#!/usr/bin/env python3
"""
Script to rollback Ontario seed data from the database
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

try:
    from sqlalchemy import text
    from core.database import engine
    from core.config import settings
except ImportError as e:
    print(f"❌ Error: Missing dependencies. Please install requirements:")
    print(f"   cd {backend_dir}")
    print(f"   pip install -r requirements.txt")
    print(f"\nOriginal error: {e}")
    sys.exit(1)


async def rollback_ontario_seed():
    """Execute the rollback SQL script"""
    
    # Split SQL into individual statements (asyncpg requires single statements)
    statements = [
        # Remove work orders for Ontario test data
        """DELETE FROM work_orders
WHERE created_by_email LIKE '%@tenantmail.ca'
   OR created_by_email LIKE '%@pmontario.ca'""",
        
        # Remove leases and lease_tenants
        """DELETE FROM lease_tenants
WHERE tenant_id IN (
    SELECT id FROM tenants WHERE email LIKE '%@tenantmail.ca'
)""",
        
        """DELETE FROM leases
WHERE created_by_email LIKE '%@pmontario.ca'""",
        
        # Remove units and properties seeded for Ontario PMCs
        """DELETE FROM units
WHERE property_id IN (
    SELECT id FROM properties WHERE city IN ('Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Kingston')
)""",
        
        """DELETE FROM properties
WHERE city IN ('Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Kingston')""",
        
        # Remove tenants and landlords (Ontario sample)
        """DELETE FROM tenants
WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@tenantmail.ca'
)""",
        
        """DELETE FROM landlords
WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@ontlandlords.ca'
)""",
        
        # Remove PMC admins and PMs
        """DELETE FROM user_roles
WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@pmcadmin.ca'
       OR email LIKE '%@pmontario.ca'
       OR email = 'superadmin@pinaka.ca'
)""",
        
        """DELETE FROM users
WHERE email LIKE '%@tenantmail.ca'
   OR email LIKE '%@ontlandlords.ca'
   OR email LIKE '%@pmcadmin.ca'
   OR email LIKE '%@pmontario.ca'
   OR email = 'superadmin@pinaka.ca'""",
        
        # Remove the Ontario organizations
        """DELETE FROM organizations
WHERE name IN ('NorthView Property Management – Toronto, ON',
               'Lakefront Property Services – Ottawa, ON')""",
    ]
    
    print("🔄 Starting rollback of Ontario seed data...")
    print(f"📊 Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    print()
    
    total_affected = 0
    
    try:
        # Execute each statement in its own transaction to avoid abort issues
        for i, statement in enumerate(statements, 1):
            try:
                async with engine.begin() as conn:
                    result = await conn.execute(text(statement))
                    rows_affected = result.rowcount
                    total_affected += rows_affected
                    print(f"  ✓ Statement {i}/{len(statements)}: {rows_affected} row(s) affected")
            except Exception as e:
                error_str = str(e).lower()
                # Some tables might not exist or have no matching rows - that's okay
                if "does not exist" in error_str or "relation" in error_str:
                    print(f"  ⚠ Statement {i}/{len(statements)}: Table not found (skipping)")
                elif "no such table" in error_str:
                    print(f"  ⚠ Statement {i}/{len(statements)}: Table not found (skipping)")
                else:
                    # For other errors, still try to continue
                    print(f"  ⚠ Statement {i}/{len(statements)}: {str(e)[:100]}")
            
        print()
        print("✅ Rollback completed!")
        print(f"📊 Total rows affected: {total_affected}")
        print()
        print("Removed:")
        print("  - Work orders for Ontario test data")
        print("  - Leases and lease_tenants")
        print("  - Units and properties in Ontario cities")
        print("  - Tenants and landlords")
        print("  - PMC admins and PMs")
        print("  - Ontario organizations")
            
    except Exception as e:
        print(f"❌ Fatal error during rollback: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(rollback_ontario_seed())

