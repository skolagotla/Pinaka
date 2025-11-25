# Pinaka V2 Migration Guide

## Quick Start

### For New Components
Use the unified CRUD hook:
```tsx
import { useUnifiedCRUD } from '@/lib/hooks/useUnifiedCRUD';

const { data, isLoading, create, update, remove } = useUnifiedCRUD({
  entityName: 'properties',
  apiEndpoint: '/api/v2/properties',
});
```

### For RBAC
Use the unified RBAC client:
```tsx
import { usePermission, checkPermission } from '@/lib/rbac/v2-client';

// In component
const { has_permission, loading } = usePermission({
  resource: 'properties',
  action: 'CREATE',
});

// Or programmatically
const result = await checkPermission({
  resource: 'properties',
  action: 'UPDATE',
});
```

## Migration Checklist

### ✅ Completed
- [x] OpenAPI type generation pipeline
- [x] Unified CRUD hook (`useUnifiedCRUD`)
- [x] RBAC implementation (backend + frontend)
- [x] All backend routes use RBAC
- [x] Schema migration to OpenAPI types
- [x] No Next.js API routes

### 🔄 In Progress / Optional
- [ ] Migrate Prisma services to v2 API calls
- [ ] Remove legacy middleware
- [ ] Clean up folder structure

## Deprecated Hooks

The following hooks are deprecated. Migrate to `useUnifiedCRUD`:

- ❌ `usePinakaCRUD` → ✅ `useUnifiedCRUD`
- ❌ `useCRUD` → ✅ `useUnifiedCRUD`
- ❌ `useV2CRUD` → ✅ `useUnifiedCRUD`
- ❌ `useCrudHooks` → ✅ `useUnifiedCRUD`

## Type Usage

Always use generated OpenAPI types:
```tsx
import type { components } from '@pinaka/shared-types/v2-api';

type Property = components['schemas']['Property'];
type PropertyCreate = components['schemas']['PropertyCreate'];
```

## API Client

Use the typed v2 API client:
```tsx
import { v2Api } from '@/lib/api/v2-client';

// v2Api provides typed methods for all endpoints
const response = await v2Api.get('/api/v2/properties');
```

## RBAC

All backend routes enforce RBAC. Frontend should check permissions before showing UI:
```tsx
const { has_permission } = usePermission({
  resource: 'properties',
  action: 'CREATE',
});

{has_permission && <Button>Create Property</Button>}
```

