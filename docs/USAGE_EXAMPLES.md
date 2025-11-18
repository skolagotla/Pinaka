# Canonical Schema Architecture - Usage Examples

**Complete examples for using generated types and API client**

---

## 📦 Importing Generated Types

### Basic Types
```typescript
import { 
  PropertyCreate, 
  PropertyUpdate, 
  PropertyResponse,
  TenantCreate,
  LeaseCreate,
  // ... all 80 types available
} from '@/lib/schemas';
```

### Using Types in Components
```typescript
import { PropertyCreate } from '@/lib/schemas';
import { useState } from 'react';

function PropertyForm() {
  const [formData, setFormData] = useState<PropertyCreate>({
    landlordId: 'c123...',
    addressLine1: '',
    city: '',
    postalZip: '',
    // TypeScript autocomplete works!
  });

  // Form handling...
}
```

---

## 🚀 Using Generated API Client

### Basic Usage
```typescript
import { v1Api } from '@/lib/api/v1-client';

// List properties
const properties = await v1Api.properties.list({ 
  page: 1, 
  limit: 10 
});

// Get property by ID
const property = await v1Api.properties.get('c123...');

// Create property
const newProperty = await v1Api.properties.create({
  landlordId: 'c123...',
  addressLine1: '123 Main St',
  city: 'Toronto',
  postalZip: 'M5H 2N2',
});

// Update property
const updated = await v1Api.properties.update('c123...', {
  propertyName: 'Updated Name',
});

// Delete property
await v1Api.properties.delete('c123...');
```

### All Available Domains
```typescript
import { v1Api } from '@/lib/api/v1-client';

// Properties
await v1Api.properties.list();
await v1Api.properties.create({ ... });
await v1Api.properties.update(id, { ... });
await v1Api.properties.delete(id);

// Tenants
await v1Api.tenants.list();
await v1Api.tenants.create({ ... });
await v1Api.tenants.update(id, { ... });
await v1Api.tenants.delete(id);

// Leases
await v1Api.leases.list();
await v1Api.leases.create({ ... });
await v1Api.leases.update(id, { ... });
await v1Api.leases.delete(id);

// Rent Payments
await v1Api.rentPayments.list();
await v1Api.rentPayments.create({ ... });
await v1Api.rentPayments.update(id, { ... });
await v1Api.rentPayments.delete(id);

// Maintenance
await v1Api.maintenance.list();
await v1Api.maintenance.create({ ... });
await v1Api.maintenance.update(id, { ... });
await v1Api.maintenance.delete(id);

// Documents
await v1Api.documents.list();
await v1Api.documents.create({ ... });
await v1Api.documents.update(id, { ... });
await v1Api.documents.delete(id);

// Expenses
await v1Api.expenses.list();
await v1Api.expenses.create({ ... });
await v1Api.expenses.update(id, { ... });
await v1Api.expenses.delete(id);

// Inspections
await v1Api.inspections.list();
await v1Api.inspections.create({ ... });
await v1Api.inspections.update(id, { ... });
await v1Api.inspections.delete(id);

// Vendors
await v1Api.vendors.list();
await v1Api.vendors.create({ ... });
await v1Api.vendors.update(id, { ... });
await v1Api.vendors.delete(id);

// Conversations
await v1Api.conversations.list();
await v1Api.conversations.create({ ... });
await v1Api.conversations.update(id, { ... });
await v1Api.conversations.delete(id);

// Applications
await v1Api.applications.list();
await v1Api.applications.create({ ... });
await v1Api.applications.update(id, { ... });
await v1Api.applications.delete(id);

// Notifications
await v1Api.notifications.list();
await v1Api.notifications.create({ ... });
await v1Api.notifications.update(id, { ... });
await v1Api.notifications.delete(id);

// Tasks
await v1Api.tasks.list();
await v1Api.tasks.create({ ... });
await v1Api.tasks.update(id, { ... });
await v1Api.tasks.delete(id);

// Invitations
await v1Api.invitations.list();
await v1Api.invitations.create({ ... });
await v1Api.invitations.update(id, { ... });
await v1Api.invitations.delete(id);

// Generated Forms
await v1Api.generatedForms.list();
await v1Api.generatedForms.create({ ... });
await v1Api.generatedForms.update(id, { ... });
await v1Api.generatedForms.delete(id);

// Units
await v1Api.units.list();
await v1Api.units.create({ ... });
await v1Api.units.update(id, { ... });
await v1Api.units.delete(id);
```

### Specialized Endpoints
```typescript
import { v1Api } from '@/lib/api/v1-client';

// Analytics
const propertyPerformance = await v1Api.specialized.propertyperformance({
  propertyId: 'c123...',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
});

const portfolioPerformance = await v1Api.specialized.portfolioperformance({
  landlordId: 'c123...',
});

const tenantRisk = await v1Api.specialized.tenantdelinquencyrisk();
const cashFlow = await v1Api.specialized.cashflowforecast();
```

---

## 🔄 Complete Example: React Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input } from 'antd';
import { v1Api } from '@/lib/api/v1-client';
import type { PropertyCreate, PropertyResponse } from '@/lib/schemas';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Load properties
  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await v1Api.properties.list({ page: 1, limit: 50 });
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Create property
  const handleCreate = async (values: PropertyCreate) => {
    try {
      const newProperty = await v1Api.properties.create(values);
      setProperties([...properties, newProperty]);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create property:', error);
    }
  };

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>Add Property</Button>
      
      <Table
        dataSource={properties}
        loading={loading}
        columns={[
          { title: 'Address', dataIndex: 'addressLine1' },
          { title: 'City', dataIndex: 'city' },
          // ... more columns
        ]}
      />

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item name="addressLine1" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="city" label="City">
            <Input />
          </Form.Item>
          {/* ... more fields */}
        </Form>
      </Modal>
    </div>
  );
}
```

---

## 🎯 Type-Safe Form Handling

```typescript
import { Form } from 'antd';
import { PropertyCreate, propertyCreateSchema } from '@/lib/schemas';
import { zodToAntdRules } from '@/lib/utils/zod-to-antd-rules';

function PropertyForm() {
  const [form] = Form.useForm<PropertyCreate>();

  // Convert Zod schema to Ant Design rules
  const rules = zodToAntdRules(propertyCreateSchema);

  const handleSubmit = async (values: PropertyCreate) => {
    // Validate with Zod
    const result = propertyCreateSchema.safeParse(values);
    if (!result.success) {
      // Handle validation errors
      return;
    }

    // Type-safe API call
    const property = await v1Api.properties.create(result.data);
    console.log('Created:', property);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item 
        name="addressLine1" 
        rules={rules.addressLine1}
        label="Address"
      >
        <Input />
      </Form.Item>
      {/* ... more fields */}
    </Form>
  );
}
```

---

## 🔍 Query Parameters

```typescript
import { v1Api } from '@/lib/api/v1-client';
import type { PropertyQuery } from '@/lib/schemas';

// Type-safe query parameters
const query: PropertyQuery = {
  page: '1',
  limit: '50',
  landlordId: 'c123...',
  propertyType: 'Single Family',
  countryCode: 'CA',
};

const response = await v1Api.properties.list(query);
// response.data: PropertyResponse[]
// response.pagination: { page, limit, total, totalPages }
```

---

## ⚠️ Error Handling

```typescript
import { v1Api } from '@/lib/api/v1-client';

try {
  const property = await v1Api.properties.create({
    landlordId: 'c123...',
    addressLine1: '123 Main St',
    city: 'Toronto',
    postalZip: 'M5H 2N2',
  });
  console.log('Success:', property);
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    // Handle error (show toast, etc.)
  }
}
```

---

## 🔄 Regenerating Code

When you update the schema registry:

```bash
# Regenerate all code
npm run generate:all

# Or regenerate individually
npm run generate:types
npm run generate:api-client
npm run generate:openapi
npm run generate:api-handlers
```

---

## 📚 Additional Resources

- **Architecture Guide:** `docs/CANONICAL_SCHEMA_ARCHITECTURE.md`
- **Implementation Summary:** `docs/CANONICAL_SCHEMA_IMPLEMENTATION_SUMMARY.md`
- **Migration Guide:** `docs/MIGRATION_TO_GENERATED_CODE.md`
- **OpenAPI Spec:** `docs/openapi.json`

---

**All code is type-safe and generated from a single source of truth!** 🚀

