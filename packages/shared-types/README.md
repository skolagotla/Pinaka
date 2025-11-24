# @pinaka/shared-types

TypeScript types generated from FastAPI OpenAPI spec.

## Usage

```typescript
import type { components, paths } from "@pinaka/shared-types/v2-api";

// Use component types
type Property = components["schemas"]["Property"];
type WorkOrder = components["schemas"]["WorkOrder"];

// Use path types
type GetPropertiesResponse = paths["/api/v2/properties"]["get"]["responses"]["200"]["content"]["application/json"];
```

## Generation

Types are generated from FastAPI's OpenAPI spec:

```bash
# Make sure FastAPI is running on http://localhost:8000
pnpm generate:types
```

This will fetch `/openapi.json` from FastAPI and generate `v2-api.d.ts`.

