#!/usr/bin/env python3
"""
Test query performance to verify optimizations
"""
import asyncio
import time
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from sqlalchemy import select, text
    from sqlalchemy.orm import selectinload
    from core.database import get_db
    from db.models_v2 import Property, Tenant, Unit, Lease, WorkOrder
except ImportError as e:
    print(f"❌ Error: Missing dependencies. Please install requirements:")
    print(f"   cd {Path(__file__).parent.parent}")
    print(f"   pip install -r requirements.txt")
    print(f"\nOriginal error: {e}")
    sys.exit(1)


async def test_properties_query():
    """Test properties list query with eager loading"""
    async for db in get_db():
        start = time.time()
        
        query = select(Property).options(
            selectinload(Property.landlord),
            selectinload(Property.organization),
        ).limit(10)
        
        result = await db.execute(query)
        properties = result.scalars().all()
        
        elapsed = time.time() - start
        
        # Access relationships to ensure they're loaded
        for prop in properties:
            _ = prop.landlord
            _ = prop.organization
        
        print(f"✅ Properties query: {elapsed*1000:.2f}ms ({len(properties)} properties)")
        return elapsed


async def test_work_orders_query():
    """Test work orders query with eager loading"""
    async for db in get_db():
        start = time.time()
        
        from db.models_v2 import WorkOrderComment
        query = select(WorkOrder).options(
            selectinload(WorkOrder.comments).selectinload(WorkOrderComment.author),
            selectinload(WorkOrder.property),
            selectinload(WorkOrder.tenant),
        ).limit(10)
        
        result = await db.execute(query)
        work_orders = result.scalars().all()
        
        elapsed = time.time() - start
        
        # Access relationships
        for wo in work_orders:
            _ = wo.property
            _ = wo.tenant
            _ = wo.comments
        
        print(f"✅ Work orders query: {elapsed*1000:.2f}ms ({len(work_orders)} work orders)")
        return elapsed


async def test_index_usage():
    """Check if indexes are being used"""
    async for db in get_db():
        print("\n🔍 Checking index usage...")
        
        # Explain a query that should use an index
        result = await db.execute(text("""
            EXPLAIN ANALYZE
            SELECT * FROM work_orders 
            WHERE organization_id = '00000000-0000-0000-0000-000000000000'::uuid
            AND status = 'new'
            ORDER BY created_at DESC
            LIMIT 10
        """))
        
        plan = "\n".join([row[0] for row in result])
        
        if "Index Scan" in plan or "Bitmap Index Scan" in plan:
            print("  ✅ Index is being used!")
        else:
            print("  ⚠️  Index may not be used (check query plan)")
        
        print(f"\nQuery Plan:\n{plan}")


async def main():
    """Run performance tests"""
    print("=" * 60)
    print("Query Performance Tests")
    print("=" * 60)
    print()
    
    try:
        await test_properties_query()
        await test_work_orders_query()
        await test_index_usage()
        
        print("\n" + "=" * 60)
        print("✅ Performance tests completed!")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

