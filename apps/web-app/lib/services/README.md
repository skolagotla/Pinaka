# Services Migration Guide

## ⚠️ Migration Status

All services in this directory are being migrated from Prisma to FastAPI v2 API calls.

## Migration Pattern

### Before (Prisma):
```javascript
const { prisma } = require('../prisma');

async function getData(id) {
  return await prisma.model.findUnique({ where: { id } });
}
```

### After (v2 API):
```javascript
const { serverV2Api } = require('../api/v2-server-client');

async function getData(id) {
  return await serverV2Api.getById('model', id);
}
```

## Services to Migrate

- [ ] `analytics-service.js` - Use `/api/v2/properties`, `/api/v2/expenses`, etc.
- [ ] `application-service.ts` - Use `/api/v2/applications`
- [ ] `approval-service.js` - Use `/api/v2/approvals` (if endpoint exists)
- [ ] `bulk-operations-service.js` - Use batch endpoints
- [ ] `document-expiration-service.js` - Use `/api/v2/documents`
- [ ] `invitation-acceptance.ts` - Use `/api/v2/invitations`
- [ ] `late-fee-service.js` - Use `/api/v2/rent-payments`
- [ ] `lease-expiration-service.js` - Use `/api/v2/leases`
- [ ] `lease-termination-service.js` - Use `/api/v2/leases`
- [ ] `notification-service.js` - Use `/api/v2/notifications`
- [ ] `payment-dispute-service.js` - Use `/api/v2/rent-payments`
- [ ] `payment-gateway-failure-service.js` - Use `/api/v2/rent-payments`
- [ ] `payment-retry-service.js` - Use `/api/v2/rent-payments`
- [ ] `tax-reporting-service.js` - Use `/api/v2/expenses`, `/api/v2/rent-payments`
- [ ] `trial-handler.ts` - Use `/api/v2/organizations`
- [ ] `unified-verification-service.js` - Use `/api/v2/verifications`
- [ ] `year-end-closing-service.js` - Use `/api/v2/expenses`, `/api/v2/rent-payments`

## Server-Side API Client

Use `serverV2Api` from `@/lib/api/v2-server-client` for server-side service calls:

```javascript
const { serverV2Api } = require('@/lib/api/v2-server-client');

// List entities
const properties = await serverV2Api.list('properties', { organization_id: orgId });

// Get by ID
const property = await serverV2Api.getById('properties', propertyId);

// Create
const newProperty = await serverV2Api.create('properties', propertyData);

// Update
const updated = await serverV2Api.update('properties', id, updateData);

// Delete
await serverV2Api.remove('properties', id);
```

## Authentication

For server-side services, set `API_SERVICE_TOKEN` environment variable or use service account authentication.

