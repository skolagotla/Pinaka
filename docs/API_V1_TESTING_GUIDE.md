# API v1 Testing Guide

**Purpose:** Guide for testing the new Domain-Driven, API-First v1 APIs

---

## 🧪 Testing Strategy

### 1. **Schema Validation Testing**
Test that Zod schemas properly validate requests:

```bash
# Valid request
curl -X POST http://localhost:3000/api/v1/properties \
  -H "Content-Type: application/json" \
  -d '{"landlordId": "c123...", "addressLine1": "123 Main St", ...}'

# Invalid request (should return 400)
curl -X POST http://localhost:3000/api/v1/properties \
  -H "Content-Type: application/json" \
  -d '{"landlordId": "invalid"}'
```

### 2. **RBAC Testing**
Test permission checks:

```bash
# Test with different roles
# Should return 403 if user lacks permission
curl -X POST http://localhost:3000/api/v1/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### 3. **Pagination Testing**
Test pagination across all list endpoints:

```bash
# Test pagination
curl "http://localhost:3000/api/v1/properties?page=1&limit=10"
curl "http://localhost:3000/api/v1/properties?page=2&limit=10"
```

### 4. **Filtering Testing**
Test query parameter filtering:

```bash
# Test filters
curl "http://localhost:3000/api/v1/properties?city=Toronto&propertyType=Residential"
curl "http://localhost:3000/api/v1/rent-payments?status=Paid&dueDateFrom=2024-01-01"
```

---

## 📋 Domain-Specific Test Cases

### Properties API (`/api/v1/properties`)

**GET Tests:**
- [ ] List properties with pagination
- [ ] Filter by city
- [ ] Filter by propertyType
- [ ] Search by address
- [ ] PMC sees only managed properties
- [ ] Landlord sees only own properties

**POST Tests:**
- [ ] Create single-unit property
- [ ] Create multi-unit property
- [ ] Validation: missing required fields
- [ ] Validation: invalid date format
- [ ] RBAC: unauthorized user

**PATCH Tests:**
- [ ] Update property details
- [ ] Update unit financials
- [ ] Partial updates work

**DELETE Tests:**
- [ ] Delete property
- [ ] RBAC: unauthorized user

---

### Tenants API (`/api/v1/tenants`)

**GET Tests:**
- [ ] List tenants with pagination
- [ ] Filter by status
- [ ] Search by name/email
- [ ] PMC sees only managed tenants

**POST Tests:**
- [ ] Create tenant (landlord)
- [ ] Create tenant approval request (PMC)
- [ ] Validation: invalid email
- [ ] Validation: missing required fields

**PATCH Tests:**
- [ ] Update tenant details
- [ ] Update emergency contacts
- [ ] Update employers

---

### Leases API (`/api/v1/leases`)

**GET Tests:**
- [ ] List leases with pagination
- [ ] Filter by status
- [ ] Filter by propertyId
- [ ] Search by tenant name

**POST Tests:**
- [ ] Create lease with single tenant
- [ ] Create lease with multiple tenants
- [ ] Validation: lease end before start
- [ ] Auto-update unit/property status

**PATCH Tests:**
- [ ] Update lease details
- [ ] Update tenant list
- [ ] Status changes update unit/property

---

### Rent Payments API (`/api/v1/rent-payments`)

**GET Tests:**
- [ ] List payments with pagination
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Include partial payments
- [ ] Include Stripe payment status

**POST Tests:**
- [ ] Create rent payment
- [ ] Prevent duplicate (same lease + due date)
- [ ] Auto-send receipt if Paid

---

### Maintenance Requests API (`/api/v1/maintenance`)

**GET Tests:**
- [ ] List requests with pagination
- [ ] Filter by status/priority
- [ ] Tenant sees only own requests
- [ ] Landlord sees property requests
- [ ] PMC sees managed property requests

**POST Tests:**
- [ ] Tenant creates request
- [ ] Landlord creates request
- [ ] Auto-generate ticket number
- [ ] Auto-update status after first comment

---

### Documents API (`/api/v1/documents`)

**GET Tests:**
- [ ] List documents with pagination
- [ ] Filter by category
- [ ] Filter by isRequired
- [ ] Tenant sees only own documents

**PATCH Tests:**
- [ ] Update document metadata
- [ ] Verify/reject document
- [ ] Soft delete document

---

### Expenses API (`/api/v1/expenses`)

**GET Tests:**
- [ ] List expenses with pagination
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Include maintenance request data

**POST Tests:**
- [ ] Create expense with propertyId
- [ ] Create expense with maintenanceRequestId
- [ ] Auto-resolve propertyId from maintenance
- [ ] VendorId → paidTo mapping

---

### Inspections API (`/api/v1/inspections`)

**GET Tests:**
- [ ] List inspections with pagination
- [ ] Filter by checklistType
- [ ] Filter by status
- [ ] Include checklist items

**POST Tests:**
- [ ] Tenant requests inspection
- [ ] Landlord creates inspection
- [ ] Auto-generate checklist items

---

### Vendors API (`/api/v1/vendors`)

**GET Tests:**
- [ ] List vendors with pagination
- [ ] Filter by category
- [ ] Landlord sees global + local vendors
- [ ] PMC sees global + managed vendors
- [ ] Search functionality

**POST Tests:**
- [ ] Create vendor
- [ ] Generate providerId
- [ ] Validation: duplicate email

**PATCH Tests:**
- [ ] Update vendor details
- [ ] Soft delete vendor

---

### Conversations API (`/api/v1/conversations`)

**GET Tests:**
- [ ] List conversations with pagination
- [ ] Filter by status
- [ ] Landlord sees only LANDLORD_PMC
- [ ] Tenant sees only PMC_TENANT
- [ ] PMC sees both types

**POST Tests:**
- [ ] Create conversation
- [ ] Create with initial message
- [ ] Enforce communication restrictions

**POST /messages Tests:**
- [ ] Create message in conversation
- [ ] Add attachments
- [ ] Update lastMessageAt

---

### Applications API (`/api/v1/applications`)

**GET Tests:**
- [ ] List applications with pagination
- [ ] Filter by status
- [ ] Tenant sees only own applications

**POST Tests:**
- [ ] Create application
- [ ] Auto-set 1-week deadline
- [ ] Link to unit/property

**PATCH Tests:**
- [ ] Update application status
- [ ] Approve/reject application
- [ ] Update screening status

---

### Notifications API (`/api/v1/notifications`)

**GET Tests:**
- [ ] List notifications with pagination
- [ ] Filter unread only
- [ ] Filter archived
- [ ] User sees only own notifications

**POST Tests:**
- [ ] Admin creates notification
- [ ] RBAC: non-admin cannot create

**PATCH Tests:**
- [ ] Mark as read
- [ ] Archive notification

**PUT /read-all Tests:**
- [ ] Mark all as read

---

### Tasks API (`/api/v1/tasks`)

**GET Tests:**
- [ ] List tasks with pagination
- [ ] Filter by category
- [ ] Filter by completion status
- [ ] Filter by date range
- [ ] User sees only own tasks

**POST Tests:**
- [ ] Create task
- [ ] Auto-infer propertyId from linkedEntity
- [ ] Validation: title and dueDate required

**PATCH Tests:**
- [ ] Update task
- [ ] Mark as completed
- [ ] Update due date

**DELETE Tests:**
- [ ] Delete task
- [ ] RBAC: unauthorized user

---

## 🔍 Common Test Scenarios

### 1. **Pagination Edge Cases**
- First page (page=1)
- Last page
- Page beyond total pages
- Invalid page number
- Invalid limit (too large/small)

### 2. **Date Range Filters**
- Valid date range
- Invalid date format
- Start date after end date
- Single date (startDate only)

### 3. **Search Functionality**
- Empty search
- Partial matches
- Case insensitive
- Special characters

### 4. **RBAC Scenarios**
- Landlord accessing own data ✅
- Landlord accessing other's data ❌
- PMC accessing managed data ✅
- PMC accessing unmanaged data ❌
- Tenant accessing own data ✅
- Tenant accessing other's data ❌

### 5. **Organization Isolation**
- User sees only own organization's data
- Cross-organization access blocked
- Organization limits enforced

---

## 🛠️ Testing Tools

### Recommended Tools

1. **Postman/Insomnia** - API testing
2. **curl** - Command-line testing
3. **Jest/Supertest** - Automated tests
4. **Swagger/OpenAPI** - API documentation

### Example Test Script

```typescript
// tests/api/v1/properties.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/v1/properties';

describe('Properties API v1', () => {
  it('should create property with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        landlordId: 'c123...',
        addressLine1: '123 Main St',
        city: 'Toronto',
        postalZip: 'M5H 2N2',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
  });
});
```

---

## 📊 Performance Testing

### Load Testing
- Test pagination with large datasets
- Test concurrent requests
- Test database query performance
- Monitor response times

### Optimization Opportunities
- Add database indexes
- Implement caching where appropriate
- Optimize N+1 queries
- Consider query result limits

---

## ✅ Success Criteria

### API Quality
- ✅ All endpoints return consistent response format
- ✅ All errors are properly handled
- ✅ All validation errors are descriptive
- ✅ All RBAC checks are enforced
- ✅ All pagination works correctly

### Code Quality
- ✅ No linter errors
- ✅ Type safety maintained
- ✅ Business logic properly encapsulated
- ✅ Error messages are user-friendly

---

**Last Updated:** January 2025

