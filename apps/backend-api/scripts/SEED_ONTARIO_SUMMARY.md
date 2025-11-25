# Pinaka V2 Ontario Seed Data Summary

**Generated**: 2025-11-24  
**Script**: `apps/backend-api/scripts/seed_ontario_v2.py`

## Overview

This seed script populates the Pinaka v2 PostgreSQL database with comprehensive, realistic Ontario-Canada based test data. All data follows v2 schema conventions and uses snake_case table names.

## Data Structure

### 1. Super Admin
- **Email**: `superadmin@pinaka.ca`
- **Role**: `super_admin`
- **Access**: Global (no organization_id)
- **Password**: `TestPass123!`

### 2. PMCs (Property Management Companies)
- **PMC #1**: "NorthView Property Management – Toronto, ON"
- **PMC #2**: "Lakefront Property Services – Ottawa, ON"

Each PMC has:
- 1 PMC Admin
- 2 Property Managers (PMs)
- 8-10 Landlords

### 3. Landlords
- **Total**: 16-20 landlords (8-10 per PMC)
- **Email Domain**: `@ontlandlords.ca`
- **Properties per Landlord**: 3-9 properties
- **Multi-family Requirement**: At least 1 multi-family property per landlord (2-4 units, 1 vacant)

### 4. Properties
- **Total**: ~80-180 properties (3-9 per landlord)
- **Types**: 
  - Multi-family (2-4 units, 1 vacant per property)
  - Single-family homes
  - Townhouses
  - Condos
  - Apartments
- **Locations**: Ontario cities (Toronto, Ottawa, Mississauga, Hamilton, London, Kingston, etc.)
- **Addresses**: Realistic Canadian format (e.g., "123 Main Street, Toronto, ON, M5H 2N2")

### 5. Units
- **Total**: ~100-250 units
- **Status Distribution**:
  - Occupied: ~75-85%
  - Vacant: ~15-25% (at least 1 per multi-family property)
- **Details**: Bedrooms (1-4), bathrooms (1-3), square footage (600-2000 sqft)

### 6. Tenants
- **Total**: ~200-500 tenants (2 per occupied unit)
- **Email Domain**: `@tentantmail.ca`
- **All tenants linked to leases**: Yes
- **All tenants have user accounts**: Yes

### 7. Leases
- **Total**: ~100-250 leases (1 per occupied unit)
- **Start Date**: 2024-01-01
- **End Date**: 2024-12-31
- **Rent Amount**: $1,200 - $3,500 CAD
- **Status**: All active
- **Tenants per Lease**: 2 (1 primary, 1 secondary)

### 8. Work Orders (Optional)
- **Total**: 2-3 work orders
- **Status**: "new" or "in_progress"
- **Priority**: "low", "medium", or "high"
- **Created by**: Random tenants

## Database Tables Populated

### Core Tables
- ✅ `organizations` - 2 PMCs
- ✅ `users` - ~250-500 users (super admin + PMC admins + PMs + landlords + tenants)
- ✅ `roles` - 6 roles (super_admin, pmc_admin, pm, landlord, tenant, vendor)
- ✅ `user_roles` - All user-role assignments
- ✅ `landlords` - 16-20 landlord records
- ✅ `tenants` - ~200-500 tenant records
- ✅ `properties` - ~80-180 properties
- ✅ `units` - ~100-250 units
- ✅ `leases` - ~100-250 leases
- ✅ `lease_tenants` - ~200-500 lease-tenant links

### Optional Tables
- ✅ `work_orders` - 2-3 work orders
- ⚪ `vendors` - Empty (can be populated separately)
- ⚪ `attachments` - Empty
- ⚪ `notifications` - Empty
- ⚪ `messages` - Empty

## Validation Checklist

### ✅ Schema Compliance
- [x] All tables use v2 snake_case naming
- [x] No v1 tables referenced
- [x] All foreign keys valid
- [x] All UUIDs properly formatted

### ✅ Data Requirements
- [x] 1 super admin with global access
- [x] 2 PMCs in Ontario
- [x] 1 PMC Admin per PMC
- [x] 2 PMs per PMC
- [x] 8-10 landlords per PMC
- [x] 3-9 properties per landlord
- [x] At least 1 multi-family property per landlord
- [x] 1 vacant unit per multi-family property
- [x] 2 tenants per property (occupied units)
- [x] All tenants linked to leases
- [x] All users can log in (universal password)
- [x] Ontario addresses with proper postal codes
- [x] Unique email addresses

### ✅ Relationships
- [x] Users → Organizations (where applicable)
- [x] Users → Roles (via user_roles)
- [x] Landlords → Organizations
- [x] Tenants → Organizations
- [x] Properties → Organizations + Landlords
- [x] Units → Properties
- [x] Leases → Organizations + Units + Landlords
- [x] LeaseTenants → Leases + Tenants
- [x] WorkOrders → Organizations + Properties + Units + Tenants + Users

## Execution

### Prerequisites
1. PostgreSQL database running
2. v2 schema tables created (via Alembic migrations)
3. Python dependencies installed (`bcrypt`, `sqlalchemy`, `asyncpg`)

### Run the Seed Script

```bash
cd apps/backend-api
python scripts/seed_ontario_v2.py
```

### Expected Output
```
============================================================
PINAKA V2 ONTARIO SEED SCRIPT
============================================================

[1/10] Creating roles...
✓ Created 6 roles

[2/10] Creating super admin...
✓ Super admin created: superadmin@pinaka.ca

[3/10] Creating PMCs...
✓ PMC created: NorthView Property Management – Toronto, ON
✓ PMC created: Lakefront Property Services – Ottawa, ON

[4/10] Creating PMC Admins and PMs...
✓ PMC Admin created for NorthView Property Management – Toronto, ON: ...
✓ PM created: ...
...

[5/10] Creating landlords...
  Creating 9 landlords for NorthView Property Management – Toronto, ON...
    ✓ Landlord 1/9: william.smith@ontlandlords.ca
    ...

[6/10] Creating properties and units...
  ✓ Created 5 properties for landlord William Smith
  ...

[7/10] Creating tenants and leases...
✓ Created 450 tenants and 225 leases

[8/10] Creating work orders...
  ✓ Work order created: Fix leaky faucet in kitchen
  ...

============================================================
SEED DATA SUMMARY
============================================================
✓ Super Admin: 1
✓ PMCs: 2
✓ PMC Admins: 2
✓ PMs: 4
✓ Landlords: 18
✓ Properties: 95
✓ Units: 120
  - Occupied: 95
  - Vacant: 25
✓ Tenants: 190
✓ Leases: 95
✓ Work Orders: 3

============================================================
LOGIN CREDENTIALS
============================================================
Universal Password: TestPass123!

Super Admin:
  Email: superadmin@pinaka.ca

PMC Admins:
  1. admin1@northviewpropertymanagementtorontoon.ca
  2. admin2@lakefrontpropertyservicesottawaon.ca

Sample Landlords (first 5):
  1. william.smith@ontlandlords.ca
  2. james.johnson@ontlandlords.ca
  ...

Sample Tenants (first 5):
  1. sarah.chen@tentantmail.ca
  2. emily.martinez@tentantmail.ca
  ...

✅ Seed data created successfully!
============================================================
```

## Notes

1. **Password**: All users share the same password hash for `TestPass123!`
2. **Idempotency**: Script checks for existing records and skips creation if they exist
3. **Randomization**: Uses random selection for names, addresses, and property details
4. **Realistic Data**: All addresses, postal codes, and phone numbers follow Canadian/Ontario formats
5. **Foreign Keys**: All relationships are properly maintained
6. **Performance**: Uses bulk inserts and proper session management for efficiency

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `DATABASE_URL` in `core/config.py`
   - Ensure PostgreSQL is running
   - Check database exists

2. **Table Not Found**
   - Run Alembic migrations first: `alembic upgrade head`
   - Verify v2 schema is created

3. **Duplicate Key Errors**
   - Script is idempotent - safe to re-run
   - Existing records are skipped

4. **Foreign Key Violations**
   - Ensure all parent records exist before creating children
   - Script creates records in correct dependency order

## Next Steps

After seeding:
1. Verify data in database
2. Test login with sample users
3. Test API endpoints with seeded data
4. Add additional data (vendors, attachments, etc.) as needed

