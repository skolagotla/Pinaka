# Pinaka v2 - Portfolio Module

## Overview

The Portfolio module is the unified interface for all property management activities in Pinaka v2. It provides role-specific views, metrics, and actions in a single, cohesive interface.

## Architecture

The Portfolio module is located at `/portfolio` and provides tab-based navigation:

```
/portfolio
├── Dashboard (Overview)    # Role-specific dashboard
├── Properties              # Properties management
├── Units                   # Units management
├── Landlords              # Landlords (PMC_ADMIN, SUPER_ADMIN)
├── Tenants                # Tenants management
├── Leases                 # Leases management
├── Vendors                # Vendors (PMC_ADMIN, SUPER_ADMIN)
├── Administrators         # Admin users (SUPER_ADMIN only)
└── PMCs                   # Organizations (SUPER_ADMIN only)
```

## Component Structure

```
components/pages/shared/Portfolio/
├── ui.jsx                  # Main Portfolio component (tabs + content)
├── Dashboard.jsx           # Dashboard/Overview tab
├── Properties.jsx          # Properties tab
├── Units.jsx               # Units tab
├── Landlords.jsx           # Landlords tab
├── Tenants.jsx             # Tenants tab
├── Leases.jsx              # Leases tab
├── Vendors.jsx             # Vendors tab
├── Administrators.jsx      # Administrators tab
└── PMCs.jsx                # PMCs tab
```

## Main Portfolio Component

**File**: `components/pages/shared/Portfolio/ui.jsx`

**Features**:
- Tab-based navigation
- Role-specific metrics
- Role-specific quick links
- Unified data fetching
- URL-synced tabs

**Key Functions**:
```typescript
// Sync active tab with URL
const getActiveTabFromPath = () => {
  if (pathname === '/portfolio' || pathname === '/portfolio/') return 'overview';
  if (pathname?.includes('/portfolio/properties')) return 'properties';
  // ...
};

// Role-specific metrics
const roleMetrics = useMemo(() => {
  switch (normalizedRole) {
    case 'super_admin':
      return { totalPMCs, totalProperties, totalLeases, ... };
    case 'pmc_admin':
      return { propertiesUnderPMC, occupancyRate, ... };
    // ...
  }
}, [normalizedRole, data]);
```

## Dashboard Tab

**Route**: `/portfolio` or `/portfolio/dashboard`

**Component**: `components/pages/shared/Portfolio/Dashboard.jsx`

### SUPER_ADMIN Dashboard

**Metrics**:
- Total PMCs
- Total Landlords
- Total Properties
- Total Leases
- Active Leases
- Total Tenants
- Total Vendors
- Occupancy Rate
- Open Work Orders
- Total Work Orders

**Features**:
- Global view of all organizations
- Organization cards with quick links
- Recent work orders across all orgs
- System-wide analytics

### PMC_ADMIN Dashboard

**Metrics**:
- Properties Under PMC
- Occupancy Rate
- Rent Collected
- Rent Outstanding
- Open Work Orders

**Features**:
- Organization-specific view
- Property portfolio overview
- Financial summary
- Work order queue

### PM Dashboard

**Metrics**:
- Assigned Properties
- Active Work Orders
- Upcoming Move-ins
- Upcoming Move-outs

**Features**:
- Assigned properties only
- Work order queue
- Lease calendar view
- Quick actions

### LANDLORD Dashboard

**Metrics**:
- Properties Owned
- Occupancy Rate
- Upcoming Expirations
- Open Work Orders

**Features**:
- Owned properties only
- Lease expiration tracking
- Income overview
- Maintenance requests

### TENANT Dashboard

**Metrics**:
- Current Lease Summary
- Next Rent Due
- Monthly Rent
- Open Work Orders

**Features**:
- Own lease and unit only
- Rent payment tracking
- Maintenance request submission
- Lease document access

### VENDOR Dashboard

**Metrics**:
- Assigned Jobs
- Due Today
- Due This Week

**Features**:
- Assigned work orders only
- Job status tracking
- Due date management
- Work order updates

## Properties Tab

**Route**: `/portfolio/properties`

**Component**: `components/pages/shared/Portfolio/Properties.jsx`

**Features**:
- Properties list table
- Create property button (if permitted)
- Property details view
- Organization scoping
- Status filtering

**Columns**:
- Property Name
- Address
- Status
- Landlord (if applicable)
- Actions (Edit, Delete if permitted)

**Permissions**:
- **SUPER_ADMIN**: Full CRUD
- **PMC_ADMIN**: Full CRUD in organization
- **PM**: Read/Update assigned properties
- **LANDLORD**: Read/Update owned properties
- **TENANT**: Read only (their property)
- **VENDOR**: Read only

## Units Tab

**Route**: `/portfolio/units`

**Component**: `components/pages/shared/Portfolio/Units.jsx`

**Features**:
- Units list table
- Filter by property
- Create unit button (if permitted)
- Unit details view
- Status filtering (vacant, occupied, maintenance)

**Columns**:
- Unit Number
- Property
- Floor
- Bedrooms/Bathrooms
- Size (sqft)
- Status
- Actions

**Permissions**:
- **SUPER_ADMIN**: Full CRUD
- **PMC_ADMIN**: Full CRUD in organization
- **PM**: Create/Read/Update in assigned properties
- **LANDLORD**: Read/Update in owned properties
- **TENANT**: Read only (their unit)
- **VENDOR**: Read only

## Landlords Tab

**Route**: `/portfolio/landlords`

**Component**: `components/pages/shared/Portfolio/Landlords.jsx`

**Access**: PMC_ADMIN, SUPER_ADMIN only

**Features**:
- Landlords list table
- Create landlord button
- Landlord details view
- Property association
- Contact information

**Columns**:
- Name
- Email
- Phone
- Properties Count
- Status
- Actions

**Permissions**:
- **SUPER_ADMIN**: Full CRUD
- **PMC_ADMIN**: Full CRUD in organization
- **Other roles**: Not accessible

## Tenants Tab

**Route**: `/portfolio/tenants`

**Component**: `components/pages/shared/Portfolio/Tenants.jsx`

**Features**:
- Tenants list table
- Create tenant button (if permitted)
- Tenant details view
- Application status
- Lease association

**Columns**:
- Name
- Email
- Phone
- Status
- Current Lease
- Actions

**Permissions**:
- **SUPER_ADMIN**: Full CRUD
- **PMC_ADMIN**: Full CRUD in organization
- **PM**: Create/Read/Update in assigned properties
- **LANDLORD**: Read only
- **TENANT**: Read only (self)
- **VENDOR**: Read only

## Leases Tab

**Route**: `/portfolio/leases`

**Component**: `components/pages/shared/Portfolio/Leases.jsx`

**Features**:
- Leases list table
- Create lease button (if permitted)
- Lease details view
- Tenant association
- Status filtering (pending, active, terminated, expired)

**Columns**:
- Property
- Unit
- Start Date
- End Date
- Rent Amount
- Status
- Actions

**Permissions**:
- **SUPER_ADMIN**: Full CRUD
- **PMC_ADMIN**: Full CRUD in organization
- **PM**: Create/Read/Update in assigned properties
- **LANDLORD**: Read/Update owned leases
- **TENANT**: Read only (their lease)
- **VENDOR**: Not accessible

## Vendors Tab

**Route**: `/portfolio/vendors`

**Component**: `components/pages/shared/Portfolio/Vendors.jsx`

**Access**: PMC_ADMIN, SUPER_ADMIN only

**Features**:
- Vendors list table
- Create vendor button
- Vendor details view
- Service types
- Work order assignments

**Columns**:
- Name
- Business Name
- Email
- Phone
- Service Types
- Status
- Actions

**Permissions**:
- **SUPER_ADMIN**: Full CRUD
- **PMC_ADMIN**: Full CRUD in organization
- **Other roles**: Not accessible

## Administrators Tab

**Route**: `/portfolio/administrators`

**Component**: `components/pages/shared/Portfolio/Administrators.jsx`

**Access**: SUPER_ADMIN only

**Features**:
- Super admin users list
- User management
- Role assignment
- Status management

**Columns**:
- Name
- Email
- Status
- Actions

## PMCs Tab

**Route**: `/portfolio/pmcs`

**Component**: `components/pages/shared/Portfolio/PMCs.jsx`

**Access**: SUPER_ADMIN only

**Features**:
- Organizations (PMCs) list
- Create organization button
- Organization details view
- User management per org

**Columns**:
- Organization Name
- Type
- Status
- Actions

## Data Fetching

All Portfolio tabs use React Query hooks:

```typescript
// Properties
const { data: properties, isLoading } = useProperties(organizationId);

// Tenants
const { data: tenants, isLoading } = useTenants(organizationId);

// Leases
const { data: leases, isLoading } = useLeases({ organization_id: organizationId });

// Work Orders
const { data: workOrders, isLoading } = useWorkOrders({ organization_id: organizationId });
```

**Organization Scoping**:
- `useOrganizationId()` returns `undefined` for SUPER_ADMIN
- Other roles get their `organization_id`
- Backend automatically filters by organization

## Role-Based UI

### Screen Visibility

Portfolio tabs are filtered by role using `useRolePermissions()`:

```typescript
const { canViewScreen } = useRolePermissions();

// Only show tabs user can access
const visibleTabs = tabs.filter(tab => canViewScreen(tab.path));
```

### Action Buttons

Action buttons (Create, Edit, Delete) are conditionally rendered:

```typescript
const { canPerformAction } = useRolePermissions();

{canPerformAction('canCreate', '/portfolio/properties') && (
  <Button onClick={handleCreate}>Create Property</Button>
)}
```

## Quick Links

Role-specific quick links appear on the dashboard:

**SUPER_ADMIN**:
- Manage PMCs
- All Properties
- System Settings

**PMC_ADMIN**:
- Properties
- Tenants
- Work Orders

**PM**:
- Assigned Properties
- Work Order Queue
- Upcoming Move-ins

**LANDLORD**:
- My Properties
- Add Tenant
- New Work Order

**TENANT**:
- My Lease
- Submit Request
- Payment History

**VENDOR**:
- My Jobs
- Job Details

## Metrics Calculation

Metrics are calculated from fetched data:

```typescript
const roleMetrics = useMemo(() => {
  switch (normalizedRole) {
    case 'super_admin':
      return {
        totalPMCs: organizations.length,
        totalProperties: properties.length,
        occupancyRate: calculateOccupancyRate(units, leases),
        // ...
      };
    // ...
  }
}, [normalizedRole, data]);
```

## URL Synchronization

Portfolio tabs sync with URL:

```typescript
// URL → Tab
useEffect(() => {
  const tab = getActiveTabFromPath();
  setActiveTab(tab);
}, [pathname]);

// Tab → URL
const handleTabChange = (tab: string) => {
  setActiveTab(tab);
  router.push(`/portfolio/${tab}`);
};
```

## Best Practices

1. **Use React Query hooks** for all data fetching
2. **Check permissions** before showing action buttons
3. **Scope queries** by organization (except SUPER_ADMIN)
4. **Handle loading states** with Spinner components
5. **Handle errors** with Alert components
6. **Use FlowbiteTable** for consistent table rendering

---

**Related Documentation**:
- [Frontend Structure](03_Frontend_Structure.md) - Frontend organization
- [RBAC](05_RBAC_Roles_and_Permissions.md) - Access control
- [Development Guide](10_Development_Guide.md) - Adding new tabs

