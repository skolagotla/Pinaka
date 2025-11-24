# OpenAPI Types Migration Guide

## Overview

The Pinaka monorepo has been migrated from legacy Zod schemas to OpenAPI-generated TypeScript types from FastAPI.

## Architecture

### V2 Stack
- **Backend**: FastAPI + Pydantic (source of truth)
- **Type Generation**: `openapi-typescript` generates TypeScript types from `/openapi.json`
- **API Client**: `openapi-fetch` for type-safe API calls
- **Types Package**: `@pinaka/shared-types` contains generated types
- **Client Package**: `@pinaka/api-client` contains typed API client

## Package Structure

```
packages/
  shared-types/          # Generated TypeScript types from FastAPI
    v2-api.d.ts         # Generated types file
    package.json
    
  api-client/            # Typed API client
    src/
      api-client.ts     # openapi-fetch client
      index.ts
    package.json
```

## Usage

### 1. Generate Types

```bash
# Make sure FastAPI is running
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, generate types
pnpm generate:types
```

This generates `packages/shared-types/v2-api.d.ts` from FastAPI's OpenAPI spec.

### 2. Use Types in Frontend

```typescript
// Import types
import type { components, paths } from "@pinaka/shared-types/v2-api";

// Use component types
type Property = components["schemas"]["Property"];
type PropertyCreate = components["schemas"]["PropertyCreate"];

// Use path types for responses
type GetPropertiesResponse = paths["/api/v2/properties"]["get"]["responses"]["200"]["content"]["application/json"];
```

### 3. Use Typed API Client

```typescript
import { api, authenticatedApi } from "@pinaka/api-client";

// GET request (fully typed)
const { data, error } = await authenticatedApi.GET("/api/v2/properties", {
  params: {
    query: { page: 1, limit: 10 }
  }
});

// POST request (fully typed)
const { data, error } = await authenticatedApi.POST("/api/v2/properties", {
  body: {
    landlord_id: "...",
    address_line1: "...",
    // TypeScript will autocomplete and validate!
  }
});
```

## Migration from Legacy Schemas

### Before (Legacy Zod)

```typescript
import { PropertyCreate } from "@pinaka/schemas";
import { z } from "zod";

const schema = z.object({...});
```

### After (OpenAPI Types)

```typescript
import type { components } from "@pinaka/shared-types/v2-api";
type PropertyCreate = components["schemas"]["PropertyCreate"];

// For runtime validation, use Pydantic on the backend
// Frontend types are for TypeScript only
```

## Removed Packages

- ❌ `@pinaka/schemas` - Legacy Zod schemas (removed)
- ❌ `@pinaka/api-client` (old) - Legacy client generator (replaced)

## Build Process

1. **Generate Types**: `pnpm generate:types` (fetches from FastAPI)
2. **Build Packages**: `pnpm build:packages` (builds shared-types, api-client, etc.)
3. **Build Apps**: `pnpm build:apps` (builds web-app)

## Troubleshooting

### Types Not Updating

If types don't reflect backend changes:
1. Restart FastAPI server
2. Run `pnpm generate:types`
3. Restart TypeScript server in your IDE

### FastAPI Not Running

If type generation fails:
```bash
cd apps/backend-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Import Errors

If you see import errors:
1. Make sure `@pinaka/shared-types` is in your dependencies
2. Run `pnpm install`
3. Check that `v2-api.d.ts` exists in `packages/shared-types/`

## Next Steps

1. ✅ Types generated from FastAPI
2. ✅ Typed API client using openapi-fetch
3. ⏳ Update all frontend code to use new types
4. ⏳ Remove all Zod schema references
5. ⏳ Update React Query hooks to use typed client

