# Legacy API Deprecation Plan

**Date:** January 2025  
**Status:** ⚠️ **Deprecation Started**

---

## 🎯 Deprecation Strategy

### Phase 1: Add Deprecation Warnings (Current)
- Add deprecation headers to legacy API endpoints
- Log deprecation warnings in responses
- Document migration path

### Phase 2: Monitor Usage (Next)
- Track usage of legacy endpoints
- Identify components still using legacy APIs
- Prioritize migration based on usage

### Phase 3: Remove Legacy APIs (Future)
- After 90%+ migration to v1 APIs
- Provide 30-day notice before removal
- Remove legacy endpoints

---

## 📋 Deprecated Endpoints

### Core Management APIs

| Legacy Endpoint | v1 Replacement | Status |
|----------------|----------------|--------|
| `GET/POST /api/properties` | `GET/POST /api/v1/properties` | ⚠️ Deprecated |
| `GET/POST /api/tenants` | `GET/POST /api/v1/tenants` | ⚠️ Deprecated |
| `GET/POST /api/leases` | `GET/POST /api/v1/leases` | ⚠️ Deprecated |
| `GET/POST /api/rent-payments` | `GET/POST /api/v1/rent-payments` | ⚠️ Deprecated |
| `POST /api/rent-payments/[id]/partial` | `POST /api/v1/rent-payments` (with partial payment data) | ⚠️ Deprecated |

### Maintenance & Tasks

| Legacy Endpoint | v1 Replacement | Status |
|----------------|----------------|--------|
| `GET /api/maintenance` | `GET /api/v1/maintenance` | ⚠️ Deprecated |
| `POST /api/maintenance/[id]/comments` | `PATCH /api/v1/maintenance/[id]` (with comment) | ⚠️ Deprecated |
| `POST /api/maintenance/[id]/status` | `PATCH /api/v1/maintenance/[id]` (with status) | ⚠️ Deprecated |
| `GET/POST /api/tasks` | `GET/POST /api/v1/tasks` | ⚠️ Deprecated |

### Financial Management

| Legacy Endpoint | v1 Replacement | Status |
|----------------|----------------|--------|
| `GET /api/financials/dashboard` | Keep (dashboard-specific) | ✅ Keep |
| `GET/POST /api/financials/expenses` | `GET/POST /api/v1/expenses` | ⚠️ Deprecated |

### Documents

| Legacy Endpoint | v1 Replacement | Status |
|----------------|----------------|--------|
| `GET/POST /api/documents` | `GET/POST /api/v1/documents` | ⚠️ Deprecated |

### Analytics

| Legacy Endpoint | v1 Replacement | Status |
|----------------|----------------|--------|
| `GET /api/analytics/property-performance` | `GET /api/v1/analytics/property-performance` | ⚠️ Deprecated |
| `GET /api/analytics/portfolio-performance` | `GET /api/v1/analytics/portfolio-performance` | ⚠️ Deprecated |
| `GET /api/analytics/tenant-delinquency-risk` | `GET /api/v1/analytics/tenant-delinquency-risk` | ⚠️ Deprecated |
| `GET /api/analytics/cash-flow-forecast` | `GET /api/v1/analytics/cash-flow-forecast` | ⚠️ Deprecated |

### Other

| Legacy Endpoint | v1 Replacement | Status |
|----------------|----------------|--------|
| `GET/POST /api/vendors` | `GET/POST /api/v1/vendors` | ⚠️ Deprecated |
| `GET/POST /api/inspections` | `GET/POST /api/v1/inspections` | ⚠️ Deprecated |
| `GET/POST /api/conversations` | `GET/POST /api/v1/conversations` | ⚠️ Deprecated |
| `GET/POST /api/applications` | `GET/POST /api/v1/applications` | ⚠️ Deprecated |
| `GET/POST /api/notifications` | `GET/POST /api/v1/notifications` | ⚠️ Deprecated |
| `POST /api/tenants/invite` | `POST /api/v1/invitations` | ⚠️ Deprecated |

---

## 🔄 Migration Guide

### For Components

**Before:**
```typescript
const { fetch } = useUnifiedApi();
const response = await fetch('/api/properties', { method: 'GET' });
const data = await response.json();
```

**After:**
```typescript
import { v1Api } from '@/lib/api/v1-client';
const response = await v1Api.properties.list({ page: 1, limit: 10 });
const properties = response.data.data;
```

### For API Routes

**Before:**
```typescript
// pages/api/properties.ts
export default async function handler(req, res) {
  // ... legacy code
}
```

**After:**
```typescript
// Use v1 API: /api/v1/properties
// Legacy endpoint should redirect or return deprecation warning
```

---

## ⚠️ Deprecation Warnings

### Response Headers

All legacy API endpoints now include:
```
X-API-Deprecated: true
X-API-Deprecated-Since: 2025-01-XX
X-API-Replacement: /api/v1/{domain}
X-API-Sunset: 2025-04-XX (90 days from deprecation)
```

### Response Body (for GET requests)

```json
{
  "success": true,
  "data": [...],
  "_deprecation": {
    "warning": "This API endpoint is deprecated",
    "replacement": "/api/v1/{domain}",
    "sunsetDate": "2025-04-XX"
  }
}
```

---

## 📊 Migration Progress

### Components Migrated

- [ ] `components/pages/landlord/properties/ui.jsx`
- [ ] `components/pages/landlord/tenants/ui.jsx`
- [ ] `components/pages/landlord/leases/ui.jsx`
- [ ] `components/pages/landlord/rent-payments/ui.jsx`
- [ ] `components/pages/landlord/maintenance/ui.jsx`
- [ ] `components/shared/MaintenanceClient.jsx`
- [ ] Other components...

### Migration Status

- **Total Components:** ~50+
- **Migrated:** 0
- **In Progress:** 0
- **Remaining:** ~50+

---

## 🚨 Timeline

- **January 2025:** Deprecation warnings added
- **February 2025:** Monitor usage, continue migration
- **March 2025:** 90% migration target
- **April 2025:** Legacy API removal (if migration complete)

---

## 📝 Notes

- Legacy APIs will continue to work during deprecation period
- No breaking changes until removal date
- Frontend can use both APIs during migration
- Gradual migration reduces risk

---

**Last Updated:** January 2025

