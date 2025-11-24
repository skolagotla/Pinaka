# V2 FastAPI Migration - Final Implementation Guide

## ✅ Completed

### 1. Database Schema (v2)
- ✅ All v2 tables created with UUID primary keys
- ✅ Migrations: 001-006 (organizations, users, roles, user_roles, landlords, tenants, vendors, properties, units, leases, lease_tenants, work_orders, work_order_assignments, work_order_comments, attachments, notifications, audit_logs)
- ✅ All indexes added for performance
- ✅ Legacy tables preserved (renamed with `_legacy_prisma` suffix)

### 2. FastAPI Backend
- ✅ All core routers implemented:
  - `/api/v2/auth` - Login, me
  - `/api/v2/organizations` - CRUD
  - `/api/v2/properties` - CRUD
  - `/api/v2/units` - CRUD
  - `/api/v2/landlords` - CRUD
  - `/api/v2/tenants` - CRUD + approve/reject/rent-data
  - `/api/v2/leases` - CRUD + renew/terminate
  - `/api/v2/work-orders` - CRUD + comments + approve
  - `/api/v2/attachments` - List, upload, download
  - `/api/v2/notifications` - List, mark read
  - `/api/v2/users` - List, get, assign role
  - `/api/v2/vendors` - CRUD (v2)
  - `/api/v2/search` - Global search
  - `/api/v2/audit-logs` - List (super_admin)

### 3. Frontend Data Layer
- ✅ `v2-client.ts` - Complete API client
- ✅ `useV2Auth.ts` - Authentication hook
- ✅ `useV2Data.ts` - Comprehensive React Query hooks
- ✅ `useDataQueries.ts` - Updated to re-export v2 hooks

### 4. Frontend Pages Migrated
- ✅ Root Layout - Uses v2 auth
- ✅ LayoutClient - Uses v2 auth
- ✅ ProLayoutWrapper - Uses v2 auth
- ✅ Navigation - Role-aware with v2
- ✅ Portfolio - Role-based dashboard
- ✅ Properties (list & detail)
- ✅ Leases, Tenants, Landlords (list pages)
- ✅ Work Orders (Kanban board)
- ✅ Vendors/Partners (list page)
- ✅ Dashboard - Redirects to portfolio
- ✅ NotificationCenter - Uses v2
- ✅ GlobalSearch - Uses v2 search endpoint
- ✅ AttachmentsList - New component

---

## 🔄 Remaining Frontend Migration

### High Priority Components (Still using v1 API)

1. **MaintenanceClient** (`components/shared/MaintenanceClient.jsx`)
   - Uses `v1Api` for work orders
   - **Action**: Replace with `useWorkOrders`, `useCreateWorkOrder`, `useUpdateWorkOrder` from `useV2Data`

2. **Landlord/PMC Vendor Components**
   - `components/pages/landlord/vendors/ui.jsx`
   - `components/pages/pmc/vendors/ui.jsx`
   - **Action**: Use `useVendors`, `useCreateVendor`, `useUpdateVendor` from `useV2Data`

3. **Landlord/PMC Property Components**
   - `components/pages/landlord/properties/ui.jsx`
   - `components/pages/pmc/properties/ui.jsx`
   - **Action**: Use `useProperties`, `useCreateProperty`, `useUpdateProperty` from `useV2Data`

4. **Lease Modals**
   - `components/shared/LeaseRenewalModal.jsx`
   - `components/shared/LeaseTerminationModal.jsx`
   - **Action**: Use `useRenewLease`, `useTerminateLease` from `useV2Data`

---

## Migration Pattern for Components

### Step 1: Update Imports
```tsx
// Old
import { v1Api } from '@/lib/api/v1-client';
import { useProperties } from '@/lib/hooks/useDataQueries';

// New
import { useProperties, useCreateProperty, useUpdateProperty } from '@/lib/hooks/useV2Data';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
```

### Step 2: Replace Data Fetching
```tsx
// Old
const [properties, setProperties] = useState([]);
useEffect(() => {
  fetch('/api/v1/properties').then(r => r.json()).then(setProperties);
}, []);

// New
const { user } = useV2Auth();
const organizationId = user?.organization_id;
const { data: properties, isLoading } = useProperties(organizationId);
```

### Step 3: Replace Mutations
```tsx
// Old
const handleCreate = async (data) => {
  await fetch('/api/v1/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// New
const createProperty = useCreateProperty();
const handleCreate = async (data) => {
  await createProperty.mutateAsync(data);
};
```

### Step 4: Update Data Shape
```tsx
// Old (v1 shape)
property.propertyName
property.addressLine1

// New (v2 shape)
property.name
property.address_line1
```

---

## Next.js API Routes to Remove

After frontend migration is complete, remove these files:

### Fully Migrated (Safe to Remove)
- `/apps/api-server/pages/api/v1/properties/*` ✅
- `/apps/api-server/pages/api/v1/units/*` ✅
- `/apps/api-server/pages/api/v1/landlords/*` ✅
- `/apps/api-server/pages/api/v1/tenants/*` ✅
- `/apps/api-server/pages/api/v1/leases/*` ✅
- `/apps/api-server/pages/api/v1/maintenance/*` ✅ (use work-orders)
- `/apps/api-server/pages/api/v1/vendors/*` ✅
- `/apps/api-server/pages/api/v1/notifications/*` ✅
- `/apps/api-server/pages/api/v1/search/*` ✅

### Keep for Now (Not Yet Migrated)
- `/apps/api-server/pages/api/v1/documents/*` - Use attachments instead
- `/apps/api-server/pages/api/v1/conversations/*` - Needs implementation
- `/apps/api-server/pages/api/v1/applications/*` - Needs implementation
- `/apps/api-server/pages/api/v1/rent-payments/*` - Needs RentPayment model
- `/apps/api-server/pages/api/v1/expenses/*` - Needs implementation
- `/apps/api-server/pages/api/v1/tasks/*` - May map to work_orders
- `/apps/api-server/pages/api/v1/inspections/*` - Needs implementation
- `/apps/api-server/pages/api/v1/analytics/*` - Needs implementation
- `/apps/api-server/pages/api/v1/forms/*` - Needs implementation
- `/apps/api-server/pages/api/v1/ltb-documents/*` - Specialized

### Admin Routes (Keep)
- `/apps/api-server/pages/api/admin/*` - Platform admin routes (may remain)

---

## Running Migrations

### 1. Apply Database Migrations
```bash
cd apps/backend-api
source venv/bin/activate
alembic upgrade head
```

### 2. Seed Test Data
```bash
python scripts/seed_v2.py
```

### 3. Start FastAPI
```bash
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start Next.js
```bash
cd apps/web-app
pnpm dev
```

---

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_V2_BASE_URL=http://localhost:8000/api/v2
```

### Backend (.env)
```bash
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/pinaka
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Testing Checklist

- [ ] Login as super_admin → Can see all organizations
- [ ] Login as pmc_admin → Can see org properties, leases, work orders
- [ ] Login as landlord → Can see only their properties
- [ ] Login as tenant → Can see only their leases and work orders
- [ ] Login as vendor → Can see only assigned work orders
- [ ] Create property → Appears in list
- [ ] Create lease → Appears in list
- [ ] Create work order → Appears in Kanban
- [ ] Upload attachment → Appears in attachments list
- [ ] Search → Returns results from v2 search endpoint

---

## Notes

- All v2 endpoints use UUID primary keys
- All v2 endpoints are scoped by organization_id
- Role-based access control enforced via `require_role_v2`
- Frontend should use `v2Api` client and `useV2Data` hooks
- Legacy Prisma tables preserved for data migration if needed
- Next.js API routes can be removed after frontend migration is complete

---

## Quick Reference

### API Client
```typescript
import { v2Api } from '@/lib/api/v2-client';
```

### Hooks
```typescript
import { 
  useProperties, useTenants, useLeases, useWorkOrders,
  useVendors, useNotifications, useAttachments 
} from '@/lib/hooks/useV2Data';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
```

### Base URL
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
```
