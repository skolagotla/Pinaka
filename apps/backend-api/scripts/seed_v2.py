"""
Seed script for v2 database schema
Creates test data: organizations, users, roles, properties, units, leases, work orders
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select
from core.config import settings
import bcrypt
from db.models_v2 import (
    Organization, User, Role, UserRole,
    Landlord, Tenant, Vendor, Property, Unit,
    Lease, LeaseTenant, WorkOrder,
)
from datetime import date, timedelta
from uuid import uuid4

# Create async engine
db_url = settings.DATABASE_URL
if not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
# Remove schema parameter (asyncpg doesn't support it)
if "?schema=" in db_url:
    db_url = db_url.split("?schema=")[0]

engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed_data():
    """Seed v2 database with test data"""
    async with AsyncSessionLocal() as session:
        try:
            # 1. Create roles
            print("Creating roles...")
            roles_data = [
                {"name": "super_admin", "description": "Platform super administrator"},
                {"name": "pmc_admin", "description": "Property Management Company administrator"},
                {"name": "pm", "description": "Property Manager"},
                {"name": "landlord", "description": "Property owner"},
                {"name": "tenant", "description": "Tenant"},
                {"name": "vendor", "description": "Service vendor"},
            ]
            
            role_map = {}
            for role_data in roles_data:
                result = await session.execute(
                    select(Role).where(Role.name == role_data["name"])
                )
                role = result.scalar_one_or_none()
                
                if not role:
                    role = Role(**role_data)
                    session.add(role)
                    await session.flush()
                role_map[role_data["name"]] = role
            
            await session.commit()
            print("✓ Roles created")
            
            # 2. Create or get organization
            print("Creating organization...")
            result = await session.execute(
                select(Organization).where(Organization.name == "Test PMC").limit(1)
            )
            org = result.scalar_one_or_none()
            
            if not org:
                org = Organization(
                    name="Test PMC",
                    type="PMC",
                    timezone="America/Toronto",
                    country="Canada",
                )
                session.add(org)
                await session.flush()
                await session.commit()
                print(f"✓ Organization created: {org.id}")
            else:
                print(f"✓ Organization already exists: {org.id}")
            
            # 3. Create users
            print("Creating users...")
            users_data = [
                {
                    "email": "superadmin@pinaka.com",
                    "password": "SuperAdmin123!",
                    "full_name": "Super Admin",
                    "organization_id": None,  # Platform-wide
                    "role_name": "super_admin",
                },
                {
                    "email": "pmcadmin@pinaka.com",
                    "password": "PmcAdmin123!",
                    "full_name": "PMC Admin",
                    "organization_id": org.id,
                    "role_name": "pmc_admin",
                },
                {
                    "email": "landlord@pinaka.com",
                    "password": "Landlord123!",
                    "full_name": "Test Landlord",
                    "organization_id": org.id,
                    "role_name": "landlord",
                },
                {
                    "email": "tenant@pinaka.com",
                    "password": "Tenant123!",
                    "full_name": "Test Tenant",
                    "organization_id": org.id,
                    "role_name": "tenant",
                },
            ]
            
            user_map = {}
            for user_data in users_data:
                password = user_data.pop("password")
                role_name = user_data.pop("role_name")
                email = user_data["email"]
                
                # Check if user already exists
                result = await session.execute(
                    select(User).where(User.email == email)
                )
                user = result.scalar_one_or_none()
                
                if not user:
                    # Hash password using bcrypt directly (avoid passlib compatibility issue)
                    password_bytes = str(password).encode('utf-8')
                    # Bcrypt has a 72-byte limit
                    if len(password_bytes) > 72:
                        password_bytes = password_bytes[:72]
                    password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
                    
                    user = User(
                        **user_data,
                        password_hash=password_hash,
                        status="active",
                    )
                    session.add(user)
                    await session.flush()
                    print(f"✓ User created: {user.email} ({role_name})")
                else:
                    print(f"✓ User already exists: {user.email} ({role_name})")
                
                # Check if user_role already exists
                result = await session.execute(
                    select(UserRole).where(
                        UserRole.user_id == user.id,
                        UserRole.role_id == role_map[role_name].id,
                        UserRole.organization_id == user_data.get("organization_id"),
                    )
                )
                existing_user_role = result.scalar_one_or_none()
                
                if not existing_user_role:
                    # Assign role
                    user_role = UserRole(
                        user_id=user.id,
                        role_id=role_map[role_name].id,
                        organization_id=user_data.get("organization_id"),
                    )
                    session.add(user_role)
                
                user_map[role_name] = user
            
            await session.commit()
            
            # 4. Create landlord record
            print("Creating landlord...")
            landlord_user = user_map["landlord"]
            landlord = Landlord(
                user_id=landlord_user.id,
                organization_id=org.id,
                name=landlord_user.full_name,
                email=landlord_user.email,
                status="active",
            )
            session.add(landlord)
            await session.flush()
            await session.commit()
            print(f"✓ Landlord created: {landlord.id}")
            
            # 5. Create tenant record
            print("Creating tenant...")
            tenant_user = user_map["tenant"]
            tenant = Tenant(
                user_id=tenant_user.id,
                organization_id=org.id,
                name=tenant_user.full_name,
                email=tenant_user.email,
                status="active",
            )
            session.add(tenant)
            await session.flush()
            await session.commit()
            print(f"✓ Tenant created: {tenant.id}")
            
            # 6. Create property
            print("Creating property...")
            property_obj = Property(
                organization_id=org.id,
                landlord_id=landlord.id,
                name="123 Main Street",
                address_line1="123 Main Street",
                city="Toronto",
                state="ON",
                postal_code="M5H 2N2",
                country="Canada",
                status="active",
            )
            session.add(property_obj)
            await session.flush()
            await session.commit()
            print(f"✓ Property created: {property_obj.id}")
            
            # 7. Create unit
            print("Creating unit...")
            unit = Unit(
                property_id=property_obj.id,
                unit_number="101",
                floor="1",
                bedrooms=2,
                bathrooms=1,
                size_sqft=800,
                status="occupied",
            )
            session.add(unit)
            await session.flush()
            await session.commit()
            print(f"✓ Unit created: {unit.id}")
            
            # 8. Create lease
            print("Creating lease...")
            lease = Lease(
                organization_id=org.id,
                unit_id=unit.id,
                landlord_id=landlord.id,
                start_date=date.today() - timedelta(days=30),
                end_date=date.today() + timedelta(days=335),
                rent_amount=2000.00,
                rent_due_day=1,
                security_deposit=2000.00,
                status="active",
            )
            session.add(lease)
            await session.flush()
            
            # Link tenant to lease
            lease_tenant = LeaseTenant(
                lease_id=lease.id,
                tenant_id=tenant.id,
                is_primary=True,
            )
            session.add(lease_tenant)
            await session.commit()
            print(f"✓ Lease created: {lease.id}")
            
            # 9. Create work order
            print("Creating work order...")
            work_order = WorkOrder(
                organization_id=org.id,
                property_id=property_obj.id,
                unit_id=unit.id,
                tenant_id=tenant.id,
                created_by_user_id=tenant_user.id,
                title="Fix leaky faucet",
                description="Kitchen faucet is leaking in unit 101",
                status="new",
                priority="medium",
            )
            session.add(work_order)
            await session.commit()
            print(f"✓ Work order created: {work_order.id}")
            
            print("\n✅ Seed data created successfully!")
            print("\nTest users:")
            print("  - superadmin@pinaka.com / SuperAdmin123!")
            print("  - pmcadmin@pinaka.com / PmcAdmin123!")
            print("  - landlord@pinaka.com / Landlord123!")
            print("  - tenant@pinaka.com / Tenant123!")
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Error seeding data: {e}")
            raise
        finally:
            await session.close()


if __name__ == "__main__":
    asyncio.run(seed_data())

