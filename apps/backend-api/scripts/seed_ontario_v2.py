"""
Comprehensive Ontario-Canada seed script for Pinaka v2 database schema
Creates realistic test data with 2 PMCs, landlords, properties, tenants, and leases
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
from datetime import date, datetime, timedelta
from uuid import uuid4
import random

# Create async engine
db_url = settings.DATABASE_URL
if not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
if "?schema=" in db_url:
    db_url = db_url.split("?schema=")[0]

engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Universal password hash for all test users: TestPass123!
UNIVERSAL_PASSWORD_HASH = "$2b$12$AQXckKytFIa/.wQF3To6XunYM/eMddsf0.hZeS2r/1JAwHjsmkXFO"

# Ontario cities and postal codes
ONTARIO_CITIES = [
    ("Toronto", "M5H", "M5H 2N2"),
    ("Toronto", "M4B", "M4B 1B3"),
    ("Toronto", "M6K", "M6K 3A1"),
    ("Ottawa", "K1A", "K1A 0A6"),
    ("Ottawa", "K2P", "K2P 1A1"),
    ("Mississauga", "L5A", "L5A 3A1"),
    ("Hamilton", "L8L", "L8L 4A1"),
    ("London", "N6A", "N6A 3A1"),
    ("Kingston", "K7K", "K7K 3A1"),
    ("Windsor", "N9A", "N9A 3A1"),
    ("Kitchener", "N2H", "N2H 3A1"),
    ("Waterloo", "N2L", "N2L 3A1"),
]

# Property types
PROPERTY_TYPES = ["single_family", "townhouse", "condo", "apartment", "multi_family"]

# Ontario street names
STREET_NAMES = [
    "Main Street", "King Street", "Queen Street", "Yonge Street", "Bay Street",
    "College Street", "Dundas Street", "Bloor Street", "Spadina Avenue", "University Avenue",
    "Front Street", "Wellington Street", "Rideau Street", "Bank Street", "Elgin Street",
    "Carling Avenue", "Merivale Road", "Baseline Road", "Richmond Street", "Oxford Street",
]

# First and last names for realistic data
FIRST_NAMES = [
    "William", "James", "Michael", "David", "Robert", "John", "Richard", "Thomas",
    "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven",
    "Sarah", "Jennifer", "Emily", "Jessica", "Amanda", "Melissa", "Nicole", "Michelle",
    "Ashley", "Stephanie", "Rachel", "Lauren", "Sofia", "Emma", "Olivia", "Isabella",
    "Ava", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris",
    "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen",
    "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Chen", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
]


def generate_email(first_name: str, last_name: str, domain: str) -> str:
    """Generate a unique email address"""
    return f"{first_name.lower()}.{last_name.lower()}@{domain}"


def generate_phone() -> str:
    """Generate a realistic Ontario phone number"""
    area_codes = ["416", "647", "437", "519", "226", "613", "343", "905", "289", "365"]
    area = random.choice(area_codes)
    number = f"{random.randint(200, 999)}-{random.randint(1000, 9999)}"
    return f"{area}-{number}"


def generate_postal_code() -> str:
    """Generate a realistic Canadian postal code"""
    city_data = random.choice(ONTARIO_CITIES)
    return city_data[2]


def get_city_from_postal(postal_code: str) -> tuple:
    """Get city and province from postal code prefix"""
    prefix = postal_code.split()[0]
    for city, prefix_match, full_code in ONTARIO_CITIES:
        if prefix.startswith(prefix_match[:2]):
            return (city, "ON")
    return ("Toronto", "ON")


async def seed_data():
    """Seed v2 database with comprehensive Ontario test data"""
    async with AsyncSessionLocal() as session:
        try:
            print("=" * 60)
            print("PINAKA V2 ONTARIO SEED SCRIPT")
            print("=" * 60)
            
            # 1. Create roles
            print("\n[1/10] Creating roles...")
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
            print(f"✓ Created {len(role_map)} roles")
            
            # 2. Create Super Admin
            print("\n[2/10] Creating super admin...")
            super_admin_email = "superadmin@pinaka.ca"
            result = await session.execute(
                select(User).where(User.email == super_admin_email)
            )
            super_admin_user = result.scalar_one_or_none()
            
            if not super_admin_user:
                super_admin_user = User(
                    email=super_admin_email,
                    password_hash=UNIVERSAL_PASSWORD_HASH,
                    full_name="Super Administrator",
                    phone=generate_phone(),
                    status="active",
                    organization_id=None,
                )
                session.add(super_admin_user)
                await session.flush()
                
                # Assign super_admin role
                user_role = UserRole(
                    user_id=super_admin_user.id,
                    role_id=role_map["super_admin"].id,
                    organization_id=None,
                )
                session.add(user_role)
                await session.commit()
                print(f"✓ Super admin created: {super_admin_email}")
            else:
                print(f"✓ Super admin already exists: {super_admin_email}")
            
            # 3. Create 2 PMCs
            print("\n[3/10] Creating PMCs...")
            pmcs_data = [
                {
                    "name": "NorthView Property Management – Toronto, ON",
                    "city": "Toronto",
                    "timezone": "America/Toronto",
                },
                {
                    "name": "Lakefront Property Services – Ottawa, ON",
                    "city": "Ottawa",
                    "timezone": "America/Toronto",
                },
            ]
            
            pmc_orgs = []
            for pmc_data in pmcs_data:
                result = await session.execute(
                    select(Organization).where(Organization.name == pmc_data["name"]).limit(1)
                )
                org = result.scalar_one_or_none()
                
                if not org:
                    org = Organization(
                        name=pmc_data["name"],
                        type="PMC",
                        timezone=pmc_data["timezone"],
                        country="Canada",
                    )
                    session.add(org)
                    await session.flush()
                    await session.commit()
                    print(f"✓ PMC created: {pmc_data['name']}")
                else:
                    print(f"✓ PMC already exists: {pmc_data['name']}")
                
                pmc_orgs.append(org)
            
            # 4. Create PMC Admins and PMs for each PMC
            print("\n[4/10] Creating PMC Admins and PMs...")
            pmc_admins = []
            pms = []
            
            for idx, org in enumerate(pmc_orgs):
                # PMC Admin
                pmc_admin_first = random.choice(["Alex", "Jordan", "Taylor", "Casey", "Morgan"])
                pmc_admin_last = random.choice(LAST_NAMES)
                # Clean org name for email domain - use simple domain based on city
                if "Toronto" in org.name:
                    org_domain = "northviewpm"
                else:
                    org_domain = "lakefrontps"
                pmc_admin_email = f"admin{idx+1}@{org_domain}.ca"
                
                result = await session.execute(
                    select(User).where(User.email == pmc_admin_email)
                )
                pmc_admin_user = result.scalar_one_or_none()
                
                if not pmc_admin_user:
                    pmc_admin_user = User(
                        email=pmc_admin_email,
                        password_hash=UNIVERSAL_PASSWORD_HASH,
                        full_name=f"{pmc_admin_first} {pmc_admin_last}",
                        phone=generate_phone(),
                        status="active",
                        organization_id=org.id,
                    )
                    session.add(pmc_admin_user)
                    await session.flush()
                    
                    user_role = UserRole(
                        user_id=pmc_admin_user.id,
                        role_id=role_map["pmc_admin"].id,
                        organization_id=org.id,
                    )
                    session.add(user_role)
                    await session.commit()
                
                pmc_admins.append(pmc_admin_user)
                print(f"✓ PMC Admin created for {org.name}: {pmc_admin_email}")
                
                # 2 PMs per PMC
                for pm_idx in range(2):
                    pm_first = random.choice(FIRST_NAMES)
                    pm_last = random.choice(LAST_NAMES)
                    pm_email = f"pm{idx+1}.{pm_idx+1}@{org_domain}.ca"
                    
                    result = await session.execute(
                        select(User).where(User.email == pm_email)
                    )
                    pm_user = result.scalar_one_or_none()
                    
                    if not pm_user:
                        pm_user = User(
                            email=pm_email,
                            password_hash=UNIVERSAL_PASSWORD_HASH,
                            full_name=f"{pm_first} {pm_last}",
                            phone=generate_phone(),
                            status="active",
                            organization_id=org.id,
                        )
                        session.add(pm_user)
                        await session.flush()
                        
                        user_role = UserRole(
                            user_id=pm_user.id,
                            role_id=role_map["pm"].id,
                            organization_id=org.id,
                        )
                        session.add(user_role)
                        await session.commit()
                    
                    pms.append((pm_user, org))
                    print(f"✓ PM created: {pm_email}")
            
            # 5. Create 8-10 landlords per PMC
            print("\n[5/10] Creating landlords...")
            all_landlords = []
            
            for org_idx, org in enumerate(pmc_orgs):
                num_landlords = random.randint(8, 10)
                print(f"\n  Creating {num_landlords} landlords for {org.name}...")
                
                for landlord_idx in range(num_landlords):
                    first_name = random.choice(FIRST_NAMES)
                    last_name = random.choice(LAST_NAMES)
                    email = generate_email(first_name, last_name, "ontlandlords.ca")
                    
                    # Check if user exists
                    result = await session.execute(
                        select(User).where(User.email == email)
                    )
                    landlord_user = result.scalar_one_or_none()
                    
                    if not landlord_user:
                        landlord_user = User(
                            email=email,
                            password_hash=UNIVERSAL_PASSWORD_HASH,
                            full_name=f"{first_name} {last_name}",
                            phone=generate_phone(),
                            status="active",
                            organization_id=org.id,
                        )
                        session.add(landlord_user)
                        await session.flush()
                        
                        # Assign landlord role
                        user_role = UserRole(
                            user_id=landlord_user.id,
                            role_id=role_map["landlord"].id,
                            organization_id=org.id,
                        )
                        session.add(user_role)
                        await session.commit()
                    
                    # Create landlord record
                    landlord = Landlord(
                        user_id=landlord_user.id,
                        organization_id=org.id,
                        name=f"{first_name} {last_name}",
                        email=email,
                        phone=landlord_user.phone,
                        status="active",
                    )
                    session.add(landlord)
                    await session.flush()
                    await session.commit()
                    
                    all_landlords.append((landlord, org))
                    print(f"    ✓ Landlord {landlord_idx+1}/{num_landlords}: {email}")
            
            # 6. Create properties (3-9 per landlord, at least 1 multi-family)
            print("\n[6/10] Creating properties and units...")
            all_properties = []
            all_units = []
            
            for landlord, org in all_landlords:
                num_properties = random.randint(3, 9)
                has_multi_family = False
                
                for prop_idx in range(num_properties):
                    # Ensure at least one multi-family property
                    if prop_idx == 0 or (not has_multi_family and prop_idx == num_properties - 1):
                        prop_type = "multi_family"
                        has_multi_family = True
                    else:
                        prop_type = random.choice(["single_family", "townhouse", "condo", "apartment"])
                    
                    street_num = random.randint(100, 9999)
                    street_name = random.choice(STREET_NAMES)
                    postal_code = generate_postal_code()
                    city, province = get_city_from_postal(postal_code)
                    
                    property_obj = Property(
                        organization_id=org.id,
                        landlord_id=landlord.id,
                        name=f"{street_num} {street_name}",
                        address_line1=f"{street_num} {street_name}",
                        city=city,
                        state=province,
                        postal_code=postal_code,
                        country="Canada",
                        status="active",
                    )
                    session.add(property_obj)
                    await session.flush()
                    all_properties.append((property_obj, prop_type, landlord, org))
                    
                    # Create units
                    if prop_type == "multi_family":
                        num_units = random.randint(2, 4)
                        # One unit must be vacant
                        vacant_unit_idx = random.randint(0, num_units - 1)
                        
                        for unit_idx in range(num_units):
                            unit_status = "vacant" if unit_idx == vacant_unit_idx else "occupied"
                            unit = Unit(
                                property_id=property_obj.id,
                                unit_number=str(unit_idx + 1),
                                floor=str((unit_idx // 2) + 1) if num_units > 2 else "1",
                                bedrooms=random.randint(1, 3),
                                bathrooms=random.randint(1, 2),
                                size_sqft=random.randint(600, 1200),
                                status=unit_status,
                            )
                            session.add(unit)
                            await session.flush()
                            all_units.append((unit, property_obj, unit_status))
                    else:
                        # Single unit property
                        unit = Unit(
                            property_id=property_obj.id,
                            unit_number="1",
                            floor="1",
                            bedrooms=random.randint(2, 4),
                            bathrooms=random.randint(1, 3),
                            size_sqft=random.randint(800, 2000),
                            status="occupied",
                        )
                        session.add(unit)
                        await session.flush()
                        all_units.append((unit, property_obj, "occupied"))
                
                await session.commit()
                print(f"  ✓ Created {num_properties} properties for landlord {landlord.name}")
            
            # 7. Create tenants (2 per property, linked to leases)
            print("\n[7/10] Creating tenants and leases...")
            all_tenants = []
            all_leases = []
            
            for unit, property_obj, unit_status in all_units:
                if unit_status == "vacant":
                    continue  # Skip vacant units
                
                # Create 2 tenants per occupied unit
                tenants_for_unit = []
                for tenant_idx in range(2):
                    first_name = random.choice(FIRST_NAMES)
                    last_name = random.choice(LAST_NAMES)
                    email = generate_email(first_name, last_name, "tentantmail.ca")
                    
                    # Check if user exists
                    result = await session.execute(
                        select(User).where(User.email == email)
                    )
                    tenant_user = result.scalar_one_or_none()
                    
                    if not tenant_user:
                        tenant_user = User(
                            email=email,
                            password_hash=UNIVERSAL_PASSWORD_HASH,
                            full_name=f"{first_name} {last_name}",
                            phone=generate_phone(),
                            status="active",
                            organization_id=property_obj.organization_id,
                        )
                        session.add(tenant_user)
                        await session.flush()
                        
                        # Assign tenant role
                        user_role = UserRole(
                            user_id=tenant_user.id,
                            role_id=role_map["tenant"].id,
                            organization_id=property_obj.organization_id,
                        )
                        session.add(user_role)
                        await session.commit()
                    
                    # Create tenant record
                    tenant = Tenant(
                        user_id=tenant_user.id,
                        organization_id=property_obj.organization_id,
                        name=f"{first_name} {last_name}",
                        email=email,
                        phone=tenant_user.phone,
                        status="active",
                    )
                    session.add(tenant)
                    await session.flush()
                    tenants_for_unit.append(tenant)
                    all_tenants.append(tenant)
                
                # Create lease for this unit
                lease = Lease(
                    organization_id=property_obj.organization_id,
                    unit_id=unit.id,
                    landlord_id=property_obj.landlord_id,
                    start_date=date(2024, 1, 1),
                    end_date=date(2024, 12, 31),
                    rent_amount=round(random.uniform(1200, 3500), 2),
                    rent_due_day=random.randint(1, 5),
                    security_deposit=round(random.uniform(1000, 2500), 2),
                    status="active",
                )
                session.add(lease)
                await session.flush()
                all_leases.append(lease)
                
                # Link tenants to lease
                for tenant_idx, tenant in enumerate(tenants_for_unit):
                    lease_tenant = LeaseTenant(
                        lease_id=lease.id,
                        tenant_id=tenant.id,
                        is_primary=(tenant_idx == 0),
                    )
                    session.add(lease_tenant)
                
                await session.commit()
            
            print(f"✓ Created {len(all_tenants)} tenants and {len(all_leases)} leases")
            
            # 8. Create optional work orders (2-3 for random units)
            print("\n[8/10] Creating work orders...")
            work_order_titles = [
                "Fix leaky faucet in kitchen",
                "Replace broken window",
                "Repair heating system",
                "Fix electrical outlet",
                "Replace door lock",
                "Repair bathroom tile",
                "Fix garbage disposal",
                "Replace smoke detector",
            ]
            
            num_work_orders = random.randint(2, 3)
            occupied_units = [(u, p, s) for u, p, s in all_units if s == "occupied"]
            selected_units = random.sample(occupied_units, min(num_work_orders, len(occupied_units)))
            
            work_orders_created = 0
            for unit, property_obj, _ in selected_units:
                # Get tenants linked to leases for this unit
                result = await session.execute(
                    select(Tenant)
                    .join(LeaseTenant)
                    .join(Lease)
                    .where(Lease.unit_id == unit.id)
                    .limit(1)
                )
                tenant = result.scalar_one_or_none()
                
                if tenant:
                    work_order = WorkOrder(
                        organization_id=property_obj.organization_id,
                        property_id=property_obj.id,
                        unit_id=unit.id,
                        tenant_id=tenant.id,
                        created_by_user_id=tenant.user_id,
                        title=random.choice(work_order_titles),
                        description=f"Work order for unit {unit.unit_number} at {property_obj.address_line1}",
                        status=random.choice(["new", "in_progress"]),
                        priority=random.choice(["low", "medium", "high"]),
                    )
                    session.add(work_order)
                    await session.commit()
                    work_orders_created += 1
                    print(f"  ✓ Work order created: {work_order.title}")
            
            # 9. Summary
            print("\n" + "=" * 60)
            print("SEED DATA SUMMARY")
            print("=" * 60)
            print(f"✓ Super Admin: 1")
            print(f"✓ PMCs: {len(pmc_orgs)}")
            print(f"✓ PMC Admins: {len(pmc_admins)}")
            print(f"✓ PMs: {len(pms)}")
            print(f"✓ Landlords: {len(all_landlords)}")
            print(f"✓ Properties: {len(all_properties)}")
            print(f"✓ Units: {len(all_units)}")
            occupied_count = len([item for item in all_units if item[2] == 'occupied'])
            vacant_count = len([item for item in all_units if item[2] == 'vacant'])
            print(f"  - Occupied: {occupied_count}")
            print(f"  - Vacant: {vacant_count}")
            print(f"✓ Tenants: {len(all_tenants)}")
            print(f"✓ Leases: {len(all_leases)}")
            print(f"✓ Work Orders: {work_orders_created}")
            
            print("\n" + "=" * 60)
            print("LOGIN CREDENTIALS")
            print("=" * 60)
            print("Universal Password: TestPass123!")
            print("\nSuper Admin:")
            print(f"  Email: {super_admin_email}")
            print("\nPMC Admins:")
            for idx, admin in enumerate(pmc_admins):
                print(f"  {idx+1}. {admin.email}")
            print("\nSample Landlords (first 5):")
            for idx, (landlord, _) in enumerate(all_landlords[:5]):
                print(f"  {idx+1}. {landlord.email}")
            print("\nSample Tenants (first 5):")
            for idx, tenant in enumerate(all_tenants[:5]):
                print(f"  {idx+1}. {tenant.email}")
            
            print("\n✅ Seed data created successfully!")
            print("=" * 60)
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Error seeding data: {e}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            await session.close()


if __name__ == "__main__":
    asyncio.run(seed_data())

