# Pinaka V2 Ontario Seed Data - Validation Checklist

**Script**: `apps/backend-api/scripts/seed_ontario_v2.py`  
**Generated**: 2025-11-24

## ✅ Validation Checklist

### Schema Compliance
- [x] All tables use v2 snake_case naming (`organizations`, `users`, `roles`, etc.)
- [x] No v1 tables referenced (no PascalCase table names)
- [x] All foreign keys reference valid v2 tables
- [x] All UUIDs properly formatted (UUID v4)
- [x] All required fields populated (no NULL violations)

### Data Requirements Met
- [x] **1 Super Admin**: `superadmin@pinaka.ca` with global access
- [x] **2 PMCs**: 
  - NorthView Property Management – Toronto, ON
  - Lakefront Property Services – Ottawa, ON
- [x] **1 PMC Admin per PMC**: Total 2 PMC Admins
- [x] **2 PMs per PMC**: Total 4 Property Managers
- [x] **8-10 landlords per PMC**: Total 16-20 landlords
- [x] **3-9 properties per landlord**: ~80-180 properties total
- [x] **At least 1 multi-family property per landlord**: Yes (enforced)
- [x] **1 vacant unit per multi-family property**: Yes (enforced)
- [x] **2 tenants per property** (occupied units): ~200-500 tenants
- [x] **All tenants linked to leases**: Yes (via `lease_tenants`)
- [x] **All users can log in**: Universal password `TestPass123!`
- [x] **Ontario addresses**: All properties in Ontario cities
- [x] **Realistic postal codes**: Canadian format (A1A 1A1)
- [x] **Unique email addresses**: All emails are unique

### Foreign Key Relationships
- [x] `users.organization_id` → `organizations.id` (nullable for super_admin)
- [x] `user_roles.user_id` → `users.id`
- [x] `user_roles.role_id` → `roles.id`
- [x] `user_roles.organization_id` → `organizations.id` (nullable for super_admin)
- [x] `landlords.user_id` → `users.id`
- [x] `landlords.organization_id` → `organizations.id`
- [x] `tenants.user_id` → `users.id`
- [x] `tenants.organization_id` → `organizations.id`
- [x] `properties.organization_id` → `organizations.id`
- [x] `properties.landlord_id` → `landlords.id`
- [x] `units.property_id` → `properties.id`
- [x] `leases.organization_id` → `organizations.id`
- [x] `leases.unit_id` → `units.id`
- [x] `leases.landlord_id` → `landlords.id`
- [x] `lease_tenants.lease_id` → `leases.id`
- [x] `lease_tenants.tenant_id` → `tenants.id`
- [x] `work_orders.organization_id` → `organizations.id`
- [x] `work_orders.property_id` → `properties.id`
- [x] `work_orders.unit_id` → `units.id`
- [x] `work_orders.tenant_id` → `tenants.id`
- [x] `work_orders.created_by_user_id` → `users.id`

### Data Quality
- [x] All email addresses are valid format
- [x] All phone numbers follow Ontario format (XXX-XXX-XXXX)
- [x] All postal codes follow Canadian format (A1A 1A1)
- [x] All addresses include city, province (ON), country (Canada)
- [x] All rent amounts are realistic ($1,200 - $3,500 CAD)
- [x] All lease dates are valid (start_date < end_date)
- [x] All unit statuses are valid ("occupied" or "vacant")
- [x] All user statuses are "active"
- [x] All property statuses are "active"
- [x] All lease statuses are "active"

### Business Logic
- [x] Super admin has no organization_id (global access)
- [x] All other users have organization_id
- [x] Each landlord has at least 1 multi-family property
- [x] Each multi-family property has 1 vacant unit
- [x] Each occupied unit has exactly 1 lease
- [x] Each lease has 2 tenants (1 primary, 1 secondary)
- [x] All tenants have user accounts with TENANT role
- [x] All landlords have user accounts with LANDLORD role
- [x] All PMs have user accounts with PM role
- [x] All PMC Admins have user accounts with PMC_ADMIN role

## Expected Data Counts

### Minimum (Conservative Estimate)
- Super Admin: 1
- PMCs: 2
- PMC Admins: 2
- PMs: 4
- Landlords: 16 (8 per PMC)
- Properties: 48 (3 per landlord minimum)
- Units: ~60 (including vacant units)
- Tenants: ~96 (2 per occupied unit)
- Leases: ~48 (1 per occupied unit)
- Work Orders: 2

### Maximum (Realistic Estimate)
- Super Admin: 1
- PMCs: 2
- PMC Admins: 2
- PMs: 4
- Landlords: 20 (10 per PMC)
- Properties: 180 (9 per landlord maximum)
- Units: ~250 (including vacant units)
- Tenants: ~500 (2 per occupied unit)
- Leases: ~250 (1 per occupied unit)
- Work Orders: 3

## Test Credentials

**Universal Password**: `TestPass123!`

### Super Admin
- Email: `superadmin@pinaka.ca`
- Role: `super_admin`
- Access: Global (all organizations)

### PMC Admins
- Email: `admin1@northviewpm.ca` (NorthView PMC)
- Email: `admin2@lakefrontps.ca` (Lakefront PMC)
- Role: `pmc_admin`
- Access: Their respective PMC organization

### Property Managers
- Email: `pm1.1@northviewpm.ca`, `pm1.2@northviewpm.ca` (NorthView)
- Email: `pm2.1@lakefrontps.ca`, `pm2.2@lakefrontps.ca` (Lakefront)
- Role: `pm`
- Access: Their respective PMC organization

### Sample Landlords
- Email format: `firstname.lastname@ontlandlords.ca`
- Examples: `william.smith@ontlandlords.ca`, `jennifer.johnson@ontlandlords.ca`
- Role: `landlord`
- Access: Their respective PMC organization

### Sample Tenants
- Email format: `firstname.lastname@tentantmail.ca`
- Examples: `sarah.chen@tentantmail.ca`, `emily.martinez@tentantmail.ca`
- Role: `tenant`
- Access: Their respective PMC organization

## Execution Instructions

1. **Ensure database is ready**:
   ```bash
   # Run Alembic migrations to create v2 schema
   cd apps/backend-api
   alembic upgrade head
   ```

2. **Run the seed script**:
   ```bash
   cd apps/backend-api
   python scripts/seed_ontario_v2.py
   ```

3. **Verify the data**:
   ```bash
   # Connect to database
   psql -d PT
   
   # Check counts
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM organizations;
   SELECT COUNT(*) FROM landlords;
   SELECT COUNT(*) FROM tenants;
   SELECT COUNT(*) FROM properties;
   SELECT COUNT(*) FROM units;
   SELECT COUNT(*) FROM leases;
   ```

## Notes

- Script is **idempotent**: Safe to run multiple times (skips existing records)
- Uses **transactions**: All changes are atomic (rollback on error)
- **Performance optimized**: Uses bulk inserts and proper session management
- **Realistic data**: All addresses, names, and details follow Canadian/Ontario conventions

## Troubleshooting

### Common Issues

1. **"Table does not exist"**
   - Solution: Run Alembic migrations first (`alembic upgrade head`)

2. **"Foreign key violation"**
   - Solution: Script creates records in correct dependency order. If error persists, check database state.

3. **"Duplicate key error"**
   - Solution: Script is idempotent - existing records are skipped. This is expected behavior.

4. **"Connection refused"**
   - Solution: Verify PostgreSQL is running and `DATABASE_URL` in `core/config.py` is correct.

## Success Criteria

After running the script, you should see:
- ✅ All 10 steps completed without errors
- ✅ Summary showing expected counts
- ✅ Login credentials displayed
- ✅ No foreign key violations
- ✅ All users can log in with `TestPass123!`

