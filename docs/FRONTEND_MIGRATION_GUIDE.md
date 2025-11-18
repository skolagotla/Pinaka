# Frontend Migration Guide: Legacy APIs → v1 APIs

**Purpose:** Guide for migrating frontend components from legacy APIs to the new Domain-Driven, API-First v1 APIs

---

## 🎯 Migration Overview

### Benefits of Migration

1. **Type Safety** - TypeScript types automatically inferred from Zod schemas
2. **Validation** - Automatic request/response validation
3. **Consistency** - Standardized API patterns across all domains
4. **Better DX** - Auto-completion, type checking, self-documenting code
5. **Future-Proof** - Versioned APIs allow evolution without breaking changes

---

## 📋 Migration Checklist

### Step 1: Update Imports

**Before:**
```typescript
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
```

**After:**
```typescript
import { v1Api } from '@/lib/api/v1-client';
import type { PropertyCreate, PropertyResponse } from '@/lib/schemas';
```

### Step 2: Replace API Calls

**Before:**
```typescript
const { fetch } = useUnifiedApi();

// GET request
const response = await fetch('/api/properties', { method: 'GET' });
const data = await response.json();
const properties = data.properties || [];

// POST request
const response = await fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
const result = await response.json();
```

**After:**
```typescript
// GET request (with pagination)
const response = await v1Api.properties.list({ page: 1, limit: 10 });
const properties = response.data.data; // Type-safe!

// POST request
const property = await v1Api.properties.create(formData); // Type-safe!
```

### Step 3: Update Type Definitions

**Before:**
```typescript
const [property, setProperty] = useState<any>(null);
```

**After:**
```typescript
import type { PropertyResponse } from '@/lib/schemas';
const [property, setProperty] = useState<PropertyResponse | null>(null);
```

### Step 4: Update Form Validation

**Before:**
```typescript
const [form] = Form.useForm();

const handleSubmit = async (values: any) => {
  // Manual validation
  if (!values.addressLine1) {
    message.error('Address is required');
    return;
  }
  // ... more manual checks
};
```

**After:**
```typescript
import { propertyCreateSchema, type PropertyCreate } from '@/lib/schemas';

const [form] = Form.useForm<PropertyCreate>();

const handleSubmit = async (values: PropertyCreate) => {
  try {
    // Schema validates automatically
    const validated = propertyCreateSchema.parse(values);
    await v1Api.properties.create(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      error.errors.forEach(err => {
        form.setFields([{ name: err.path, errors: [err.message] }]);
      });
    }
  }
};
```

---

## 🔄 Domain-by-Domain Migration

### Properties

**Legacy API:** `/api/properties`  
**v1 API:** `/api/v1/properties`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/properties');
const data = await response.json();
const properties = data.properties || [];

// After
const response = await v1Api.properties.list({ page: 1, limit: 50 });
const properties = response.data.data;
const pagination = response.data.pagination;
```

### Tenants

**Legacy API:** `/api/tenants`  
**v1 API:** `/api/v1/tenants`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/tenants', {
  method: 'POST',
  body: JSON.stringify(tenantData),
});

// After
const tenant = await v1Api.tenants.create(tenantData);
```

### Leases

**Legacy API:** `/api/leases`  
**v1 API:** `/api/v1/leases`

**Example Migration:**

```typescript
// Before
const response = await fetch(`/api/leases/${leaseId}`, {
  method: 'PATCH',
  body: JSON.stringify(updateData),
});

// After
const updatedLease = await v1Api.leases.update(leaseId, updateData);
```

### Rent Payments

**Legacy API:** `/api/rent-payments`  
**v1 API:** `/api/v1/rent-payments`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/rent-payments', {
  method: 'POST',
  body: JSON.stringify(paymentData),
});

// After
const payment = await v1Api.rentPayments.create(paymentData);
```

### Maintenance Requests

**Legacy API:** `/api/maintenance`  
**v1 API:** `/api/v1/maintenance`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/maintenance', {
  method: 'POST',
  body: JSON.stringify(requestData),
});

// After
const request = await v1Api.maintenance.create(requestData);
```

### Documents

**Legacy API:** `/api/documents`  
**v1 API:** `/api/v1/documents`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/documents', {
  method: 'POST',
  body: JSON.stringify(documentData),
});

// After
const document = await v1Api.documents.create(documentData);
```

### Expenses

**Legacy API:** `/api/financials/expenses`  
**v1 API:** `/api/v1/expenses`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/financials/expenses', {
  method: 'POST',
  body: JSON.stringify(expenseData),
});

// After
const expense = await v1Api.expenses.create(expenseData);
```

### Inspections

**Legacy API:** `/api/inspections`  
**v1 API:** `/api/v1/inspections`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/inspections', {
  method: 'POST',
  body: JSON.stringify(inspectionData),
});

// After
const inspection = await v1Api.inspections.create(inspectionData);
```

### Vendors

**Legacy API:** `/api/vendors`  
**v1 API:** `/api/v1/vendors`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/vendors', {
  method: 'POST',
  body: JSON.stringify(vendorData),
});

// After
const vendor = await v1Api.vendors.create(vendorData);
```

### Conversations

**Legacy API:** `/api/conversations`  
**v1 API:** `/api/v1/conversations`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/conversations', {
  method: 'POST',
  body: JSON.stringify(conversationData),
});

// After
const conversation = await v1Api.conversations.create(conversationData);
```

### Applications

**Legacy API:** `/api/applications`  
**v1 API:** `/api/v1/applications`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/applications', {
  method: 'POST',
  body: JSON.stringify(applicationData),
});

// After
const application = await v1Api.applications.create(applicationData);
```

### Notifications

**Legacy API:** `/api/notifications`  
**v1 API:** `/api/v1/notifications`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/notifications');
const data = await response.json();
const notifications = data.notifications || [];

// After
const response = await v1Api.notifications.list({ page: 1, limit: 20 });
const notifications = response.data.data;
```

### Tasks

**Legacy API:** `/api/tasks`  
**v1 API:** `/api/v1/tasks`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify(taskData),
});

// After
const task = await v1Api.tasks.create(taskData);
```

### Invitations

**Legacy API:** `/api/tenants/invite`  
**v1 API:** `/api/v1/invitations`

**Example Migration:**

```typescript
// Before
const response = await fetch('/api/tenants/invite', {
  method: 'POST',
  body: JSON.stringify({
    email: 'tenant@example.com',
    propertyId: 'c123...',
  }),
});

// After
const invitation = await v1Api.invitations.create({
  email: 'tenant@example.com',
  type: 'tenant',
  propertyId: 'c123...',
});
```

### Analytics

**Legacy API:** `/api/analytics/*`  
**v1 API:** `/api/v1/analytics/*`

**Example Migration:**

```typescript
// Before
const response = await fetch(`/api/analytics/property-performance?propertyId=${id}`);
const data = await response.json();

// After
const response = await v1Api.analytics.propertyPerformance({
  propertyId: id,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
```

---

## 🔧 Common Patterns

### Pagination

**Before:**
```typescript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);

const fetchData = async () => {
  const response = await fetch(`/api/properties?page=${page}&limit=${limit}`);
  const data = await response.json();
  setProperties(data.properties || []);
  setTotal(data.total || 0);
};
```

**After:**
```typescript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);

const fetchData = async () => {
  const response = await v1Api.properties.list({ page, limit });
  setProperties(response.data.data);
  setTotal(response.data.pagination.total);
};
```

### Filtering

**Before:**
```typescript
const fetchData = async () => {
  const params = new URLSearchParams({
    city: 'Toronto',
    propertyType: 'Residential',
  });
  const response = await fetch(`/api/properties?${params}`);
  const data = await response.json();
};
```

**After:**
```typescript
const fetchData = async () => {
  const response = await v1Api.properties.list({
    city: 'Toronto',
    propertyType: 'Residential',
  });
};
```

### Error Handling

**Before:**
```typescript
try {
  const response = await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    message.error(error.error || 'Failed to create property');
    return;
  }
  const result = await response.json();
  message.success('Property created successfully');
} catch (error) {
  message.error('An error occurred');
}
```

**After:**
```typescript
try {
  const property = await v1Api.properties.create(data);
  message.success('Property created successfully');
} catch (error: any) {
  if (error.message) {
    message.error(error.message);
  } else {
    message.error('An error occurred');
  }
}
```

### Loading States

**Before:**
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/properties');
    const data = await response.json();
    setProperties(data.properties || []);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
// Option 1: Manual loading state
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await v1Api.properties.list();
    setProperties(response.data.data);
  } finally {
    setLoading(false);
  }
};

// Option 2: Use useUnifiedApi hook (still works with v1 APIs)
const { get, loading, data } = useUnifiedApi();
useEffect(() => {
  get('/api/v1/properties');
}, []);
```

---

## 🚨 Breaking Changes

### Response Format

**Legacy:**
```json
{
  "properties": [...],
  "total": 100
}
```

**v1:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Format

**Legacy:**
```json
{
  "error": "Error message"
}
```

**v1:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## ✅ Migration Checklist

For each component:

- [ ] Update imports to use `v1Api` and schema types
- [ ] Replace API calls with `v1Api` methods
- [ ] Update type definitions to use schema types
- [ ] Update form validation to use schemas
- [ ] Update error handling for new error format
- [ ] Update pagination handling for new response format
- [ ] Test all CRUD operations
- [ ] Test filtering and search
- [ ] Test error scenarios
- [ ] Verify type safety (no `any` types)

---

## 📚 Resources

- **Schema Definitions:** `lib/schemas/domains/*.schema.ts`
- **API Client:** `lib/api/v1-client.ts`
- **API Handlers:** `lib/api/handlers.ts`
- **Testing Guide:** `docs/API_V1_TESTING_GUIDE.md`

---

**Last Updated:** January 2025

